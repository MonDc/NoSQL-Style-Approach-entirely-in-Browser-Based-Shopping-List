import { ShoppingListRepository } from '../db/repositories/shopping-list.repository';
import { CatalogRepository } from '../db/repositories/catalog.repository';
import { ShoppingListValidator } from './validators/shopping-list.validator';
import { 

  ShoppingListItem as IShoppingListItem,
  UUID, 
  OperationResult,
  ItemStatus,
  Priority,
  Unit,
  CatalogProduct
} from '../types/shopping-list.types';
import { ShoppingList } from '../models/shopping-list.model';
import { generateId } from '../utils/id-generator.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { SyncService, SyncEvent } from './sync.service';

/**
 * Business logic layer for shopping lists
 * Orchestrates repository operations and applies business rules
 */
export class ShoppingListService {
    public repository: ShoppingListRepository;
    private catalogRepository: CatalogRepository;
    private validator: ShoppingListValidator;
    private errorHandler: ErrorHandler;
    private syncService: SyncService | null = null; // ADD THIS
    //private clientId: string; // ADD THIS

    constructor() {
        this.repository = new ShoppingListRepository();
        this.catalogRepository = new CatalogRepository();
        this.validator = new ShoppingListValidator();
        this.errorHandler = ErrorHandler.getInstance();
        //this.clientId = this.generateClientId(); // ADD THIS
    }

    // ADD THIS ENTIRE SECTION
    /* ==================== SYNC METHODS ==================== */

    // private generateClientId(): string {
    //     return 'client_' + Math.random().toString(36).substr(2, 9);
    // }

    /**
     * Enable real-time sync between devices
     * @param serverUrl WebSocket server URL (e.g., ws://192.168.1.xxx:8080)
     */
    public enableSync(serverUrl: string): void {
        this.syncService = new SyncService(serverUrl);
        
        this.syncService.onSync(async (event: SyncEvent) => {
            console.log('🔄 Remote sync received:', event.type);
            
            try {
                switch (event.type) {
                    case 'ADD_ITEM':
                        await this.applyRemoteAdd(event.listId, event.data);
                        break;
                    case 'TOGGLE_ITEM':
                        await this.applyRemoteToggle(event.listId, event.data);
                        break;
                    case 'DELETE_ITEM':
                        await this.applyRemoteDelete(event.listId, event.data);
                        break;
                    case 'CLEAR_COMPLETED':
                        await this.applyRemoteClear(event.listId);
                        break;
                }
            } catch (error) {
                console.error('Failed to apply remote sync:', error);
            }
        });
    }

    private async applyRemoteAdd(listId: UUID, data: any): Promise<void> {
        await this._addItem(listId, data, true);
    }

    private async applyRemoteToggle(listId: UUID, data: { itemId: UUID }): Promise<void> {
        await this._toggleItemStatus(listId, data.itemId, true);
    }

    private async applyRemoteDelete(listId: UUID, data: { itemId: UUID }): Promise<void> {
        await this.repository.removeItemFromList(listId, data.itemId);
    }

    private async applyRemoteClear(listId: UUID): Promise<void> {
        const listResult = await this.getList(listId);
        if (listResult.success && listResult.data) {
            listResult.data.clearCompleted();
            await this.repository.update(listId, listResult.data.toJSON());
        }
    }

    private shouldBroadcast(): boolean {
        return this.syncService !== null && this.syncService.isConnected();
    }

    // MODIFY THIS METHOD
    /**
     * Add item to list (appears at top)
     */
    public async addItem(
        listId: UUID,
        itemData: {
            name: string;
            quantity: number;
            unit: Unit;
            priority?: Priority;
            category?: string;
            notes?: string;
        }
    ): Promise<OperationResult<ShoppingList>> {
        return this._addItem(listId, itemData, false);
    }

    // ADD THIS PRIVATE METHOD
    private async _addItem(
        listId: UUID,
        itemData: {
            name: string;
            quantity: number;
            unit: Unit;
            priority?: Priority;
            category?: string;
            notes?: string;
        },
        isRemote: boolean
    ): Promise<OperationResult<ShoppingList>> {
        try {
            const validation = this.validator.validateNewItem(itemData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            const newItem: IShoppingListItem = {
                id: generateId(),
                name: itemData.name,
                quantity: itemData.quantity,
                unit: itemData.unit,
                priority: itemData.priority || Priority.MEDIUM,
                category: itemData.category,
                notes: itemData.notes,
                status: ItemStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: []
            };

            const listResult = await this.repository.findById(listId);
            if (!listResult.success || !listResult.data) {
                throw new Error('List not found');
            }

            const updatedList = {
                ...listResult.data,
                items: [newItem, ...listResult.data.items],
                updatedAt: new Date()
            };

            const result = await this.repository.update(listId, updatedList);
            
            if (result.success && result.data) {
                this.errorHandler.logInfo('Item added to list', { listId, itemId: newItem.id });
                
                // Broadcast to other devices (unless this is already a remote sync)
                if (!isRemote && this.shouldBroadcast()) {
                    this.syncService!.broadcast({
                        type: 'ADD_ITEM',
                        listId,
                        data: itemData
                    });
                }
            }

            return this.mapToModelResult(result);
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to add item to list');
        }
    }

    /* ==================== PRIVATE HELPERS ==================== */

    /**
     * Convert repository result (interface) to model result
     */
    private mapToModelResult(result: OperationResult<any>): OperationResult<ShoppingList> {
        if (result.success && result.data) {
            return {
                success: true,
                data: new ShoppingList(result.data)
            };
        }
        return {
            success: false,
            error: result.error,
            message: result.message
        };
    }

    // MODIFY THIS METHOD
    /**
     * Toggle item status (complete/incomplete)
     */
    public async toggleItemStatus(listId: UUID, itemId: UUID): Promise<OperationResult<ShoppingList>> {
        return this._toggleItemStatus(listId, itemId, false);
    }

    // ADD THIS PRIVATE METHOD
    private async _toggleItemStatus(listId: UUID, itemId: UUID, isRemote: boolean): Promise<OperationResult<ShoppingList>> {
        try {
            const listResult = await this.getList(listId);
            if (!listResult.success || !listResult.data) {
                throw new Error('List not found');
            }

            const list = listResult.data;
            const toggled = list.toggleItemStatus(itemId);
            
            if (!toggled) {
                throw new Error('Item not found');
            }

            const updateResult = await this.repository.update(listId, list.toJSON());
            
            // Broadcast to other devices (unless this is already a remote sync)
            if (!isRemote && this.shouldBroadcast()) {
                this.syncService!.broadcast({
                    type: 'TOGGLE_ITEM',
                    listId,
                    data: { itemId }
                });
            }
            
            return this.mapToModelResult(updateResult);
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to toggle item status');
        }
    }

    // MODIFY THIS METHOD
    /**
     * Remove item from list
     */
    public async removeItem(listId: UUID, itemId: UUID): Promise<OperationResult<ShoppingList>> {
        try {
            const result = await this.repository.removeItemFromList(listId, itemId);
            
            // Broadcast to other devices
            if (this.shouldBroadcast()) {
                this.syncService!.broadcast({
                    type: 'DELETE_ITEM',
                    listId,
                    data: { itemId }
                });
            }
            
            return this.mapToModelResult(result);
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to remove item');
        }
    }

    // MODIFY THIS METHOD
    /**
     * Clear all completed items
     */
    public async clearCompleted(listId: UUID): Promise<OperationResult<ShoppingList>> {
        try {
            const listResult = await this.getList(listId);
            if (!listResult.success || !listResult.data) {
                throw new Error('List not found');
            }

            const list = listResult.data;
            const clearedCount = list.clearCompleted();
            
            if (clearedCount === 0) {
                return { success: true, data: list, message: 'No completed items to clear' };
            }

            const updateResult = await this.repository.update(listId, list.toJSON());
            
            if (updateResult.success) {
                this.errorHandler.logInfo(`Cleared ${clearedCount} completed items`, { listId });
                
                // Broadcast to other devices
                if (this.shouldBroadcast()) {
                    this.syncService!.broadcast({
                        type: 'CLEAR_COMPLETED',
                        listId,
                        data: null
                    });
                }
            }

            return this.mapToModelResult(updateResult);
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to clear completed items');
        }
    }

    /**
     * Create a new shopping list
     */
    public async createList(
        name: string, 
        ownerId: string, 
        description?: string
    ): Promise<OperationResult<ShoppingList>> {
        try {
        // Validate input
        const validation = this.validator.validateNewList(name, ownerId);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // Create list with default values
        const result = await this.repository.create({
            name,
            description,
            ownerId,
            items: [],
            isArchived: false,
            sharedWith: []
        });

        if (result.success && result.data) {
            // Convert to model
            const list = new ShoppingList(result.data);
            return {
            success: true,
            data: list
            };
        }

        return result as OperationResult<ShoppingList>;
        } catch (error) {
        return this.errorHandler.handleError<ShoppingList>(
            error, 
            'Failed to create shopping list'
        );
        }
    }

    /**
     * Get list by ID (returns model)
     */
    public async getList(listId: UUID): Promise<OperationResult<ShoppingList>> {
        try {
        const result = await this.repository.findById(listId);
        
        if (result.success && result.data) {
            const list = new ShoppingList(result.data);
            return {
            success: true,
            data: list
            };
        }
        
        return result as OperationResult<ShoppingList>;
        } catch (error) {
        return this.errorHandler.handleError<ShoppingList>(
            error, 
            'Failed to get list'
        );
        }
    }

    /**
     * Get all active lists for a user (returns models)
     */
    public async getUserLists(userId: string): Promise<OperationResult<ShoppingList[]>> {
        try {
        const result = await this.repository.findByOwner(userId);
        
        if (result.success && result.data) {
            // Filter out archived and convert to models
            const lists = result.data
            .filter(list => !list.isArchived)
            .map(list => new ShoppingList(list));
            
            return {
            success: true,
            data: lists
            };
        }

        return result as OperationResult<ShoppingList[]>;
        } catch (error) {
        return this.errorHandler.handleError<ShoppingList[]>(
            error, 
            'Failed to get user lists'
        );
        }
    }

    /**
     * Archive a list (soft delete)
     */
    public async archiveList(listId: UUID): Promise<OperationResult<ShoppingList>> {
        try {
        const result = await this.repository.update(listId, { 
            isArchived: true,
            updatedAt: new Date()
        });

        if (result.success) {
            this.errorHandler.logInfo('List archived', { listId });
        }

        return result as OperationResult<ShoppingList>;
        } catch (error) {
        return this.errorHandler.handleError<ShoppingList>(
            error, 
            'Failed to archive list'
        );
        }
    }

    /**
     * Get list summary (uses model method)
     */
    public async getListSummary(listId: UUID): Promise<OperationResult<{
        totalItems: number;
        completedItems: number;
        pendingItems: number;
        estimatedTotal: number;
        itemsByCategory: Record<string, number>;
    }>> {
        try {
        const listResult = await this.getList(listId);
        
        if (!listResult.success || !listResult.data) {
            throw new Error('List not found');
        }

        const summary = listResult.data.getSummary();

        return {
            success: true,
            data: summary
        };
        } catch (error) {
        return this.errorHandler.handleError(error, 'Failed to get list summary');
        }
    }


    /**
     * Subscribe to list changes
     */
    public subscribeToList(listId: UUID, callback: (list: ShoppingList) => void): () => void {
        return this.repository.subscribe((event) => {
        if (event.data.id === listId) {
            callback(event.data as ShoppingList);
        }
        });
    }


    /**
     * Initialize catalog (call this when app starts)
     */
    public async initializeCatalog(): Promise<void> {
        await this.catalogRepository.initializeCatalog();
    }

    /**
     * Search available products
     */
    public async searchProducts(query: string): Promise<OperationResult<CatalogProduct[]>> {
        return this.catalogRepository.searchProducts(query);
    }

    /**
     * Get popular products for quick add
     */
    public async getPopularProducts(): Promise<OperationResult<CatalogProduct[]>> {
        return this.catalogRepository.getPopularProducts();
    }

    /**
     * Add item from catalog to list
     */
    public async addCatalogItemToList(
        listId: UUID,
        catalogProductId: UUID,
        customQuantity?: number
    ): Promise<OperationResult<ShoppingList>> {
        try {
            // Get product from catalog
            const productResult = await this.catalogRepository.findById(catalogProductId);
            if (!productResult.success || !productResult.data) {
                throw new Error('Product not found in catalog');
            }

            const product = productResult.data;

            // Create shopping list item from catalog product - use INTERFACE type
            const newItem: IShoppingListItem = {  // ← Use IShoppingListItem, not ShoppingListItem model
                id: generateId(),
                catalogProductId: product.id,
                name: product.name,
                quantity: customQuantity || product.defaultQuantity || 1,
                unit: product.defaultUnit,
                category: product.category,
                priority: Priority.MEDIUM,
                status: ItemStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: product.tags || []
            };

            // Add to list - repository expects interface, not model
            const result = await this.repository.addItemToList(listId, newItem);
            
            if (result.success && result.data) {
                // Convert the result to model before returning
                const listModel = new ShoppingList(result.data);
                return {
                    success: true,
                    data: listModel
                };
            }

            return result as unknown as OperationResult<ShoppingList>;
        } catch (error) {
            return this.errorHandler.handleError(error, 'Failed to add catalog item to list');
        }
    }
}