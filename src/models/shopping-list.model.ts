import { 
    ShoppingList as IShoppingList,
    ShoppingListItem as IShoppingListItem,
    UUID,
    ItemStatus,
    Priority,
    Unit
} from '../types/shopping-list.types';

/**
 * Shopping List Item Model
 * Represents a single item in a shopping list with behavior
 */
export class ShoppingListItem implements IShoppingListItem {
    id: UUID;
    catalogProductId?: UUID;
    name: string;
    quantity: number;
    unit: Unit;
    notes?: string;
    category?: string;
    priority: Priority;
    status: ItemStatus;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    price?: number;
    store?: string;
    tags: string[];

    constructor(data: IShoppingListItem) {
        this.id = data.id;
        this.catalogProductId = data.catalogProductId;
        this.name = data.name;
        this.quantity = data.quantity;
        this.unit = data.unit;
        this.notes = data.notes;
        this.category = data.category;
        this.priority = data.priority;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.completedAt = data.completedAt;
        this.price = data.price;
        this.store = data.store;
        this.tags = data.tags || [];
    }

    /**
     * Check if item is completed
     */
    get isCompleted(): boolean {
        return this.status === ItemStatus.COMPLETED;
    }

    /**
     * Check if item is pending
     */
    get isPending(): boolean {
        return this.status === ItemStatus.PENDING;
    }

    /**
     * Toggle completion status
     */
    toggleStatus(): void {
        if (this.isCompleted) {
            this.status = ItemStatus.PENDING;
            this.completedAt = undefined;
        } else {
            this.status = ItemStatus.COMPLETED;
            this.completedAt = new Date();
        }
        this.updatedAt = new Date();
    }

    /**
     * Update quantity
     */
    updateQuantity(quantity: number): void {
        if (quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        this.quantity = quantity;
        this.updatedAt = new Date();
    }

    /**
     * Add a tag
     */
    addTag(tag: string): void {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove a tag
     */
    removeTag(tag: string): void {
        this.tags = this.tags.filter(t => t !== tag);
        this.updatedAt = new Date();
    }

    /**
     * Convert to plain object for storage
     */
    toJSON(): IShoppingListItem {
        return {
            id: this.id,
            catalogProductId: this.catalogProductId,
            name: this.name,
            quantity: this.quantity,
            unit: this.unit,
            notes: this.notes,
            category: this.category,
            priority: this.priority,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            completedAt: this.completedAt,
            price: this.price,
            store: this.store,
            tags: this.tags
        };
    }
}

/**
 * Shopping List Model
 * Main aggregate root with behavior
 */
export class ShoppingList implements IShoppingList {
    id: UUID;
    name: string;
    description?: string;
    private _items: ShoppingListItem[];
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    sharedWith?: string[];
    isArchived: boolean;
    store?: string;
    estimatedTotal?: number;
    tags?: string[];

    constructor(data: IShoppingList) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this._items = data.items.map(item => new ShoppingListItem(item));
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.ownerId = data.ownerId;
        this.sharedWith = data.sharedWith || [];
        this.isArchived = data.isArchived || false;
        this.store = data.store;
        this.estimatedTotal = data.estimatedTotal;
        this.tags = data.tags || [];
    }

    /**
     * Get items (read-only access)
     */
    get items(): ShoppingListItem[] {
        return [...this._items]; // Return a copy to prevent direct mutation
    }

    /**
     * Get completed items
     */
    get completedItems(): ShoppingListItem[] {
        return this._items.filter(item => item.isCompleted);
    }

    /**
     * Get pending items
     */
    get pendingItems(): ShoppingListItem[] {
        return this._items.filter(item => item.isPending);
    }

    /**
     * Get items by category
     */
    getItemsByCategory(category: string): ShoppingListItem[] {
        return this._items.filter(item => item.category === category);
    }

    /**
     * Get items by priority
     */
    getItemsByPriority(priority: Priority): ShoppingListItem[] {
        return this._items.filter(item => item.priority === priority);
    }

    /**
     * Add an item to the list
     */
    addItem(item: IShoppingListItem): ShoppingListItem {
        const newItem = new ShoppingListItem(item);
        this._items.push(newItem);
        this.updatedAt = new Date();
        this.updateEstimatedTotal();
        return newItem;
    }

    /**
     * Add multiple items at once
     */
    addItems(items: IShoppingListItem[]): ShoppingListItem[] {
        const newItems = items.map(item => new ShoppingListItem(item));
        this._items.push(...newItems);
        this.updatedAt = new Date();
        this.updateEstimatedTotal();
        return newItems;
    }

    /**
     * Remove an item by ID
     */
    removeItem(itemId: UUID): boolean {
        const initialLength = this._items.length;
        this._items = this._items.filter(item => item.id !== itemId);
        if (this._items.length !== initialLength) {
            this.updatedAt = new Date();
            this.updateEstimatedTotal();
            return true;
        }
        return false;
    }

    /**
     * Find an item by ID
     */
    findItem(itemId: UUID): ShoppingListItem | undefined {
        return this._items.find(item => item.id === itemId);
    }

    /**
     * Toggle item status by ID
     */
    toggleItemStatus(itemId: UUID): boolean {
        const item = this.findItem(itemId);
        if (item) {
            item.toggleStatus();
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * Clear all completed items
     */
    clearCompleted(): number {
        const completedCount = this.completedItems.length;
        this._items = this.pendingItems;
        if (completedCount > 0) {
            this.updatedAt = new Date();
            this.updateEstimatedTotal();
        }
        return completedCount;
    }

    /**
     * Update list name
     */
    rename(newName: string): void {
        if (!newName || newName.trim().length === 0) {
            throw new Error('List name cannot be empty');
        }
        this.name = newName.trim();
        this.updatedAt = new Date();
    }

    /**
     * Archive or unarchive the list
     */
    setArchived(archived: boolean): void {
        this.isArchived = archived;
        this.updatedAt = new Date();
    }

    /**
     * Share with another user
     */
    shareWith(userId: string): void {
        if (!this.sharedWith) {
            this.sharedWith = [];
        }
        if (!this.sharedWith.includes(userId)) {
            this.sharedWith.push(userId);
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove sharing from a user
     */
    unshareWith(userId: string): void {
        if (this.sharedWith) {
            this.sharedWith = this.sharedWith.filter(id => id !== userId);
            this.updatedAt = new Date();
        }
    }

    /**
     * Update estimated total based on item prices
     */
    private updateEstimatedTotal(): void {
        this.estimatedTotal = this._items.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity, 
            0
        );
    }

    /**
     * Get summary statistics
     */
    getSummary(): {
        totalItems: number;
        completedItems: number;
        pendingItems: number;
        estimatedTotal: number;
        itemsByCategory: Record<string, number>;
    } {
        return {
            totalItems: this._items.length,
            completedItems: this.completedItems.length,
            pendingItems: this.pendingItems.length,
            estimatedTotal: this.estimatedTotal || 0,
            itemsByCategory: this._items.reduce((acc, item) => {
                const cat = item.category || 'uncategorized';
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }

    /**
     * Convert to plain object for storage
     */
    toJSON(): IShoppingList {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            items: this._items.map(item => item.toJSON()),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            ownerId: this.ownerId,
            sharedWith: this.sharedWith,
            isArchived: this.isArchived,
            store: this.store,
            estimatedTotal: this.estimatedTotal,
            tags: this.tags
        };
    }

    /**
     * Create a new empty shopping list
     */
    static createEmpty(name: string, ownerId: string): ShoppingList {
        return new ShoppingList({
            id: crypto.randomUUID() as UUID,
            name,
            ownerId,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isArchived: false
        });
    }
}