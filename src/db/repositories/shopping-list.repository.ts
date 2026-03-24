import { BaseRepository } from './base.repository';
import { 
  ShoppingList, 
  ShoppingListItem, 
  UUID, 
  OperationResult,
  ItemStatus 
} from '../../types/shopping-list.types';
import { ShoppingListDBSchema } from '../../types/shopping-list.types';

/**
 * Repository for shopping list operations
 * Extends base repository with list-specific methods
 */
export class ShoppingListRepository extends BaseRepository<ShoppingList, ShoppingListDBSchema> {
  protected storeName = 'shoppingLists' as const;

  /**
   * Find lists by owner
   */
  public async findByOwner(ownerId: string): Promise<OperationResult<ShoppingList[]>> {
    try {
      const db = await this.getDb();
      const index = db.transaction(this.storeName).store.index('by-owner');
      const lists = await index.getAll(ownerId);

      return {
        success: true,
        data: lists
      };
    } catch (error) {
      return this.handleError<ShoppingList[]>(error, `Failed to find lists for owner ${ownerId}`);
    }
  }

  /**
   * Find active (non-archived) lists
   */
  public async findActiveLists(): Promise<OperationResult<ShoppingList[]>> {
      try {
          const db = await this.getDb();
          const index = db.transaction(this.storeName).store.index('by-archived');
          const lists = await index.getAll(IDBKeyRange.only(false));

          return {
              success: true,
              data: lists
          };
      } catch (error) {
          return this.handleError<ShoppingList[]>(error, 'Failed to find active lists');
      }
  }

  /**
   * Add item to list
   */
  public async addItemToList(listId: UUID, item: ShoppingListItem): Promise<OperationResult<ShoppingList>> {
    try {
      const listResult = await this.findById(listId);
      if (!listResult.success || !listResult.data) {
        throw new Error('List not found');
      }

      const list = listResult.data;
      const updatedItems = [...list.items, item];

      return this.update(listId, { 
        items: updatedItems,
        updatedAt: new Date()
      });
    } catch (error) {
      return this.handleError<ShoppingList>(error, 'Failed to add item to list');
    }
  }

  /**
   * Update item in list
   */
  public async updateItemInList(
    listId: UUID, 
    itemId: UUID, 
    updates: Partial<ShoppingListItem>
  ): Promise<OperationResult<ShoppingList>> {
    try {
      const listResult = await this.findById(listId);
      if (!listResult.success || !listResult.data) {
        throw new Error('List not found');
      }

      const list = listResult.data;
      const itemIndex = list.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in list');
      }

      const updatedItems = [...list.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        ...updates,
        updatedAt: new Date()
      };

      return this.update(listId, { 
        items: updatedItems,
        updatedAt: new Date()
      });
    } catch (error) {
      return this.handleError<ShoppingList>(error, 'Failed to update item in list');
    }
  }

  /**
   * Remove item from list
   */
public async removeItemFromList(listId: UUID, itemId: UUID): Promise<OperationResult<ShoppingList>> {
    try {
        const listResult = await this.findById(listId);
        if (!listResult.success || !listResult.data) {
            throw new Error('List not found');
        }

        const list = listResult.data;
        
        // ADD THESE DEBUG LINES
        console.log('🗑️ Before filter, items:', list.items.map(i => i.id));
        console.log('🗑️ Looking for itemId:', itemId);
        
        const updatedItems = list.items.filter(item => item.id !== itemId);
        
        console.log('🗑️ After filter, items count:', updatedItems.length);
        console.log('🗑️ Removed item?', updatedItems.length !== list.items.length);
        
        return this.update(listId, { 
            items: updatedItems,
            updatedAt: new Date()
        });
    } catch (error) {
        return this.handleError<ShoppingList>(error, 'Failed to remove item from list');
    }
}

  /**
   * Toggle item completion status
   */
  public async toggleItemStatus(listId: UUID, itemId: UUID): Promise<OperationResult<ShoppingList>> {
    try {
      const listResult = await this.findById(listId);
      if (!listResult.success || !listResult.data) {
        throw new Error('List not found');
      }

      const list = listResult.data;
      const item = list.items.find(i => i.id === itemId);
      
      if (!item) {
        throw new Error('Item not found');
      }

      const newStatus = item.status === ItemStatus.COMPLETED 
        ? ItemStatus.PENDING 
        : ItemStatus.COMPLETED;

      const completedAt = newStatus === ItemStatus.COMPLETED ? new Date() : undefined;

      return this.updateItemInList(listId, itemId, { 
        status: newStatus,
        completedAt
      });
    } catch (error) {
      return this.handleError<ShoppingList>(error, 'Failed to toggle item status');
    }
  }
}