import { ShoppingListRepository } from '../db/repositories/shopping-list.repository';
import { CatalogRepository } from '../db/repositories/catalog.repository';
import { ShoppingListValidator } from './validators/shopping-list.validator';
import { 
  ShoppingList as IShoppingList, 
  ShoppingListItem as IShoppingListItem,
  UUID, 
  OperationResult,
  ItemStatus,
  Priority,
  Unit,
  CatalogProduct
} from '../types/shopping-list.types';
import { ShoppingList, ShoppingListItem } from '../models/shopping-list.model';
import { generateId } from '../utils/id-generator.util';
import { ErrorHandler } from '../utils/error-handler.util';

/**
 * Business logic layer for shopping lists
 * Orchestrates repository operations and applies business rules
 */
export class ShoppingListService {
  public repository: ShoppingListRepository;
  private catalogRepository: CatalogRepository;
  private validator: ShoppingListValidator;
  private errorHandler: ErrorHandler;

  constructor() {
    this.repository = new ShoppingListRepository();
    this.catalogRepository = new CatalogRepository();
    this.validator = new ShoppingListValidator();
    this.errorHandler = ErrorHandler.getInstance();
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
   * Add item to list with business logic
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
    try {
      // Validate item data
      const validation = this.validator.validateNewItem(itemData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Create item with defaults
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

      const result = await this.repository.addItemToList(listId, newItem);
      
      if (result.success && result.data) {
        this.errorHandler.logInfo('Item added to list', { 
          listId, 
          itemId: newItem.id 
        });
        
        // Return as model
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
        'Failed to add item to list'
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
   * Toggle item status (uses model method)
   */
  public async toggleItemStatus(listId: UUID, itemId: UUID): Promise<OperationResult<ShoppingList>> {
    try {
      // Get current list
      const listResult = await this.getList(listId);
      if (!listResult.success || !listResult.data) {
        throw new Error('List not found');
      }

      const list = listResult.data;
      
      // Use model method to toggle
      const toggled = list.toggleItemStatus(itemId);
      
      if (!toggled) {
        throw new Error('Item not found');
      }

      // Save updated list
      const updateResult = await this.repository.update(listId, list.toJSON());
      
      if (updateResult.success && updateResult.data) {
        return {
          success: true,
          data: new ShoppingList(updateResult.data)
        };
      }

      return updateResult as OperationResult<ShoppingList>;
    } catch (error) {
      return this.errorHandler.handleError<ShoppingList>(
        error, 
        'Failed to toggle item status'
      );
    }
  }

  /**
   * Clear completed items (uses model method)
   */
  public async clearCompleted(listId: UUID): Promise<OperationResult<ShoppingList>> {
    try {
      // Get current list
      const listResult = await this.getList(listId);
      if (!listResult.success || !listResult.data) {
        throw new Error('List not found');
      }

      const list = listResult.data;
      
      // Use model method to clear completed
      const clearedCount = list.clearCompleted();
      
      if (clearedCount === 0) {
        return {
          success: true,
          data: list,
          message: 'No completed items to clear'
        };
      }

      // Save updated list
      const updateResult = await this.repository.update(listId, list.toJSON());
      
      if (updateResult.success && updateResult.data) {
        this.errorHandler.logInfo(`Cleared ${clearedCount} completed items`, { listId });
        return {
          success: true,
          data: new ShoppingList(updateResult.data)
        };
      }

      return updateResult as OperationResult<ShoppingList>;
    } catch (error) {
      return this.errorHandler.handleError<ShoppingList>(
        error, 
        'Failed to clear completed items'
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