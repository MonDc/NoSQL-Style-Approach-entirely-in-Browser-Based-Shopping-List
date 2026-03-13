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
import { generateId, generateStableUUID } from '../utils/id-generator.util';
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
    private _syncService: SyncService | null = null;
    private clientId: string;
    private _currentListId: UUID | null = null;

    constructor() {
        this.repository = new ShoppingListRepository();
        this.catalogRepository = new CatalogRepository();
        this.validator = new ShoppingListValidator();
        this.errorHandler = ErrorHandler.getInstance();
        this.clientId = this.generateClientId();
    }









    
    private generateClientId(): string {
        return 'client_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Enable real-time sync between devices
     * @param serverUrl WebSocket server URL (e.g., ws://192.168.178.21:8080)
     */
    public enableSync(serverUrl: string): void {
        console.log('🔌 enableSync CALLED with URL:', serverUrl);
        if (!serverUrl) {
            console.error('❌ No server URL provided');
            return;
        }
        try {
            this._syncService = new SyncService(serverUrl, this.clientId);
            console.log('✅ _syncService created');
            
            // Subscribe to remote sync events
            this._syncService.onSync((event: SyncEvent) => {
                this.handleRemoteEvent(event);
            });
            console.log('✅ Subscribed to remote sync events');
        } catch (error) {
            console.error('❌ Failed to create syncService:', error);
        }
    }

    /**
     * Get the sync service instance (for internal use)
     */
    private getSyncService(): SyncService | null {
        return this._syncService;
    }

    /* ==================== LIST MANAGEMENT ==================== */

    /**
     * Create a new shopping list with stable ID
     */
    public async createList(
        name: string,
        ownerId: string,
        description?: string
    ): Promise<OperationResult<ShoppingList>> {
        try {
            const validation = this.validator.validateNewList(name, ownerId);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            const stableId = generateStableUUID(`${ownerId}:shared-shopping-list`);

            // Try to get existing list first
            const existing = await this.repository.findById(stableId);
            if (existing.success && existing.data) {
                this._currentListId = stableId;
                return {
                    success: true,
                    data: new ShoppingList(existing.data)
                };
            }

            // Create new with stable ID
            const result = await this.repository.create({
                name,
                description,
                ownerId,
                items: [],
                isArchived: false,
                sharedWith: []
            }, stableId);

            if (result.success && result.data) {
                this._currentListId = stableId;
                return {
                    success: true,
                    data: new ShoppingList(result.data)
                };
            }

            return result as OperationResult<ShoppingList>;
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to create shopping list');
        }
    }

    /**
     * Get list by ID (returns model)
     */
    public async getList(listId: UUID): Promise<OperationResult<ShoppingList>> {
        try {
            const result = await this.repository.findById(listId);
            if (result.success && result.data) {
                this._currentListId = listId;
                return {
                    success: true,
                    data: new ShoppingList(result.data)
                };
            }
            return result as OperationResult<ShoppingList>;
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to get list');
        }
    }

    /**
     * Get all active lists for a user (returns models)
     */
    public async getUserLists(userId: string): Promise<OperationResult<ShoppingList[]>> {
        try {
            const result = await this.repository.findByOwner(userId);
            if (result.success && result.data) {
                const lists = result.data
                    .filter(list => !list.isArchived)
                    .map(list => new ShoppingList(list));
                return { success: true, data: lists };
            }
            return result as OperationResult<ShoppingList[]>;
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList[]>(error, 'Failed to get user lists');
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
            return this.mapToModelResult(result);
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to archive list');
        }
    }

    /* ==================== ITEM MANAGEMENT ==================== */

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
        console.log('📝 _addItem called', { isRemote, listId, itemData });

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
                const sync = this.getSyncService();
                if (!isRemote && sync) {
                    console.log('📤 BROADCASTING ADD_ITEM via sync service');
                    sync.broadcast({
                        type: 'ADD_ITEM',
                        listId,
                        data: itemData
                    });
                } else {
                    console.log('⏭️ NOT broadcasting', { isRemote, hasSync: !!sync });
                }
            }

            return this.mapToModelResult(result);
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to add item to list');
        }
    }

    /**
     * Toggle item status (complete/incomplete)
     */
    public async toggleItemStatus(listId: UUID, itemId: UUID): Promise<OperationResult<ShoppingList>> {
        return this._toggleItemStatus(listId, itemId, false);
    }

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

            if (!isRemote) {
                const sync = this.getSyncService();
                if (sync) {
                    console.log('📤 BROADCASTING TOGGLE_ITEM');
                    sync.broadcast({
                        type: 'TOGGLE_ITEM',
                        listId,
                        data: { itemId }
                    });
                }
            }

            return this.mapToModelResult(updateResult);
        } catch (error) {
            return this.errorHandler.handleError<ShoppingList>(error, 'Failed to toggle item status');
        }
    }

    /**
     * Remove item from list
     */
    public async removeItem(listId: UUID, itemId: UUID): Promise<OperationResult<ShoppingList>> {
        try {
            const result = await this.repository.removeItemFromList(listId, itemId);

            const sync = this.getSyncService();
            if (sync) {
                console.log('📤 BROADCASTING DELETE_ITEM');
                sync.broadcast({
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

                const sync = this.getSyncService();
                if (sync) {
                    console.log('📤 BROADCASTING CLEAR_COMPLETED');
                    sync.broadcast({
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

    /* ==================== PRIVATE HELPERS ==================== */

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

    /* ==================== CATALOG OPERATIONS ==================== */

    public async initializeCatalog(): Promise<void> {
        await this.catalogRepository.initializeCatalog();
    }

    public async searchProducts(query: string): Promise<OperationResult<CatalogProduct[]>> {
        return this.catalogRepository.searchProducts(query);
    }

    public async getPopularProducts(): Promise<OperationResult<CatalogProduct[]>> {
        return this.catalogRepository.getPopularProducts();
    }

    public async addCatalogItemToList(
        listId: UUID,
        catalogProductId: UUID,
        customQuantity?: number
    ): Promise<OperationResult<ShoppingList>> {
        try {
            const productResult = await this.catalogRepository.findById(catalogProductId);
            if (!productResult.success || !productResult.data) {
                throw new Error('Product not found in catalog');
            }

            const product = productResult.data;
            const newItem: IShoppingListItem = {
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

            const result = await this.repository.addItemToList(listId, newItem);
            return this.mapToModelResult(result);
        } catch (error) {
            return this.errorHandler.handleError(error, 'Failed to add catalog item to list');
        }
    }

    /* ==================== UTILITY METHODS ==================== */

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
            return {
                success: true,
                data: listResult.data.getSummary()
            };
        } catch (error) {
            return this.errorHandler.handleError(error, 'Failed to get list summary');
        }
    }

    public subscribeToList(listId: UUID, callback: (list: ShoppingList) => void): () => void {
        return this.repository.subscribe((event) => {
            if (event.data.id === listId) {
                callback(event.data as ShoppingList);
            }
        });
    }

    /* ==================== GETTERS / SETTERS ==================== */

    public setCurrentList(listId: UUID): void {
        this._currentListId = listId;
    }

    public get currentListId(): UUID | null {
        return this._currentListId;
    }

    private async applyRemoteAdd(listId: UUID, data: any): Promise<void> {
        console.log('📨 applyRemoteAdd: adding item remotely', { listId, data });
        const result = await this._addItem(listId, data, true);
        if (result.success) {
            // Force a refresh by notifying subscribers manually? 
            // The repository should already notify, but just in case:
            console.log('✅ Remote add successful, UI should update via subscription');
        } else {
            console.error('❌ Remote add failed:', result.error);
        }
    }

    /**
     * Handle incoming remote sync events
     */
    private async handleRemoteEvent(event: SyncEvent): Promise<void> {
        console.log('🔄 Handling remote event:', event.type, event);
        try {
            switch (event.type) {
                case 'ADD_ITEM':
                    await this.applyRemoteAdd(event.listId, event.data);
                    break;
                // TODO: Add cases for UPDATE_ITEM, DELETE_ITEM, etc.
                default:
                    console.warn('⚠️ Unknown remote event type:', event.type);
            }
        } catch (error) {
            console.error('❌ Error handling remote event:', error);
        }
    }
}