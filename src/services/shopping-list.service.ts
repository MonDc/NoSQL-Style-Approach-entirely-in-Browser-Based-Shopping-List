import { ShoppingListRepository } from '../db/repositories/shopping-list.repository';
import { CatalogRepository } from '../db/repositories/catalog.repository';
import { ShoppingListValidator } from './validators/shopping-list.validator';
import { 
  ShoppingList, 
  ShoppingListItem, 
  UUID, 
  OperationResult,
  ItemStatus,
  Priority,
  Unit,
  CatalogProduct
} from '../types/shopping-list.types';
import { generateId } from '../utils/id-generator.util';
import { ErrorHandler } from '../utils/error-handler.util';

/**
 * Business logic layer for shopping lists
 * Orchestrates repository operations and applies business rules
 */
export class ShoppingListService {
  private repository: ShoppingListRepository;
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

      // Create list with default values - REMOVE createdAt and updatedAt
      const result = await this.repository.create({
        name,
        description,
        ownerId,
        items: [],
        isArchived: false,
        sharedWith: []
        // REMOVED: createdAt and updatedAt - repository adds them
      });

      this.errorHandler.logInfo('Shopping list created', { listId: result.data?.id });
      return result;
    } catch (error) {
      return this.errorHandler.handleError<ShoppingList>(
        error, 
        'Failed to create shopping list'
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
      const newItem: ShoppingListItem = {
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
      
      if (result.success) {
        this.errorHandler.logInfo('Item added to list', { 
          listId, 
          itemId: newItem.id 
        });
      }

      return result;
    } catch (error) {
      return this.errorHandler.handleError<ShoppingList>(
        error, 
        'Failed to add item to list'
      );
    }
  }

  /**
   * Get all active lists for a user
   */
  public async getUserLists(userId: string): Promise<OperationResult<ShoppingList[]>> {
    try {
      const result = await this.repository.findByOwner(userId);
      
      // Filter out archived lists
      if (result.success && result.data) {
        result.data = result.data.filter(list => !list.isArchived);
      }

      return result;
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

      return result;
    } catch (error) {
      return this.errorHandler.handleError<ShoppingList>(
        error, 
        'Failed to archive list'
      );
    }
  }

  /**
   * Get list summary with computed values
   */
  public async getListSummary(listId: UUID): Promise<OperationResult<{
    totalItems: number;
    completedItems: number;
    pendingItems: number;
    estimatedTotal: number;
    itemsByCategory: Record<string, number>;
  }>> {
    try {
      const listResult = await this.repository.findById(listId);
      
      if (!listResult.success || !listResult.data) {
        throw new Error('List not found');
      }

      const list = listResult.data;
      const items = list.items;

      const summary = {
        totalItems: items.length,
        completedItems: items.filter(i => i.status === ItemStatus.COMPLETED).length,
        pendingItems: items.filter(i => i.status === ItemStatus.PENDING).length,
        estimatedTotal: items.reduce((sum, item) => sum + (item.price || 0), 0),
        itemsByCategory: items.reduce((acc, item) => {
          const cat = item.category || 'uncategorized';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

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

            // Create shopping list item from catalog product
            const newItem: ShoppingListItem = {
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
                tags: product.tags
            };

            // Add to list
            return this.repository.addItemToList(listId, newItem);
        } catch (error) {
            return this.errorHandler.handleError(error, 'Failed to add catalog item to list');
        }
    }
}