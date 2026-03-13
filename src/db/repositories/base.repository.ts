import { IDBPDatabase, StoreNames, StoreValue } from 'idb';
import { DatabaseService } from '../database.service';
import { OperationResult, QueryParams, DataEvent, DataEventType, UUID } from '../../types/shopping-list.types';

// Type helper to convert StoreNames<Schema> to string
type StoreNameAsString<Schema> = StoreNames<Schema> & string;

/**
 * Generic base repository with common CRUD operations
 * Uses TypeScript generics for type safety
 * @template T Entity type (must have id field)
 * @template Schema Database schema type
 */
export abstract class BaseRepository<T extends { id: UUID }, Schema> {
  protected dbService: DatabaseService;
  protected abstract storeName: StoreNameAsString<Schema>;
  private subscribers: ((event: DataEvent<T>) => void)[] = [];

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Get database instance (ensures initialization)
   * @returns Promise<IDBPDatabase<Schema>>
   * @example const db = await this.getDb();
   */
  protected async getDb(): Promise<IDBPDatabase<Schema>> {
    // Cast through unknown to satisfy TypeScript
    return this.dbService.getDb() as unknown as Promise<IDBPDatabase<Schema>>;
  }

  /**
   * Create new entity (auto-generates id, createdAt, updatedAt)
   * @param data Entity data without id/timestamps
   * @returns OperationResult with created entity
   * @example const result = await repo.create({ name: "Milk", price: 2.99 });
   */
  public async create(
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
    fixedId?: UUID
  ): Promise<OperationResult<T>> {
    try {
      const db = await this.getDb();
      
      const now = new Date();
      const newItem = {
        ...data,
        id: fixedId || crypto.randomUUID() as UUID,
        createdAt: now,
        updatedAt: now,
      };

      const tx = db.transaction(this.storeName, 'readwrite');
      // Cast through unknown to satisfy TypeScript
      await tx.objectStore(this.storeName).add(newItem as unknown as StoreValue<Schema, StoreNameAsString<Schema>>);
      await tx.done;

      this.notifySubscribers({
        type: DataEventType.CREATED,
        data: newItem as unknown as T, // Cast through unknown
        timestamp: new Date(),
        source: this.storeName
      });

      return { success: true, data: newItem as unknown as T }; // Cast through unknown
    } catch (error) {
      return this.handleError<T>(error, 'Failed to create entity');
    }
  }

  /**
   * Find entity by ID
   * @param id UUID of entity to find
   * @returns OperationResult with entity or undefined
   * @example const result = await repo.findById('123e4567-e89b-12d3-a456-426614174000');
   */
  public async findById(id: UUID): Promise<OperationResult<T>> {
    try {
      const db = await this.getDb();
      const data = await db.get(this.storeName, id as any); // Cast id to any
      return { success: true, data: data as T };
    } catch (error) {
      return this.handleError<T>(error, `Failed to find entity with id ${id}`);
    }
  }

  /**
   * Find all entities with optional filtering/sorting/pagination
   * @param params Query parameters (filter, sort, limit, offset)
   * @returns OperationResult with array of entities
   * @example 
   * const result = await repo.findAll({
   *   filter: { category: 'Dairy' },
   *   sort: { field: 'name', direction: 'asc' },
   *   limit: 10
   * });
   */
  public async findAll(params?: QueryParams<T>): Promise<OperationResult<T[]>> {
    try {
      const db = await this.getDb();
      let data = await db.getAll(this.storeName);

      // Apply filters
      if (params?.filter) {
        data = data.filter(item => {
          return Object.entries(params.filter!).every(([key, value]) => {
            return (item as any)[key] === value; // Use 'as any' for dynamic property access
          });
        });
      }

      // Apply sorting
      if (params?.sort) {
        const { field, direction } = params.sort;
        data.sort((a, b) => {
          const aVal = (a as any)[field]; // Use 'as any' for dynamic property access
          const bVal = (b as any)[field];
          
          if (aVal < bVal) return direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      if (params?.offset) data = data.slice(params.offset);
      if (params?.limit) data = data.slice(0, params.limit);

      return { success: true, data: data as T[] };
    } catch (error) {
      return this.handleError<T[]>(error, 'Failed to find entities');
    }
  }

  /**
   * Query by boolean index using IDBKeyRange (type-safe for booleans)
   * @param indexName Name of the index to query
   * @param value Boolean value to match (true/false)
   * @returns Array of matching entities
   * @example const activeItems = await this.queryBooleanIndex('by-active', true);
   */
  protected async queryBooleanIndex(indexName: string, value: boolean): Promise<T[]> {
    try {
      const db = await this.getDb();
      const store = db.transaction(this.storeName).store;
      
      if (!store.indexNames.contains(indexName as any)) {
        console.warn(`⚠️ Index '${indexName}' not found`);
        return [];
      }
      
      const results = await store.index(indexName as any).getAll(IDBKeyRange.only(value));
      return results as unknown as T[]; // Cast through unknown
    } catch (error) {
      console.error(`Error querying boolean index:`, error);
      return [];
    }
  }

  /**
   * Query by string index
   * @param indexName Name of the index to query
   * @param value String value to match
   * @returns Array of matching entities
   * @example const dairy = await this.queryStringIndex('by-category', 'Dairy');
   */
  protected async queryStringIndex(indexName: string, value: string): Promise<T[]> {
    try {
      const db = await this.getDb();
      const store = db.transaction(this.storeName).store;
      
      if (!store.indexNames.contains(indexName as any)) return [];
      // Cast value to any for IndexedDB query
      const results = await store.index(indexName as any).getAll(value as any);
      return results as unknown as T[];
    } catch (error) {
      console.error(`Error querying string index:`, error);
      return [];
    }
  }

  /**
   * Query by date range
   * @param indexName Name of the index to query
   * @param startDate Start of range (inclusive)
   * @param endDate End of range (inclusive)
   * @returns Array of matching entities
   * @example const today = await this.queryDateRangeIndex('by-created', startOfDay, endOfDay);
   */
  protected async queryDateRangeIndex(indexName: string, startDate: Date, endDate: Date): Promise<T[]> {
    try {
      const db = await this.getDb();
      const store = db.transaction(this.storeName).store;
      
      if (!store.indexNames.contains(indexName as any)) return [];
      const range = IDBKeyRange.bound(startDate, endDate);
      const results = await store.index(indexName as any).getAll(range);
      return results as unknown as T[]; // Cast through unknown
    } catch (error) {
      console.error(`Error querying date range:`, error);
      return [];
    }
  }

  /**
   * Count entities matching a boolean index
   */
  protected async countBooleanIndex(indexName: string, value: boolean): Promise<number> {
    try {
      const db = await this.getDb();
      const store = db.transaction(this.storeName).store;
      
      if (!store.indexNames.contains(indexName as any)) return 0;
      
      const keys = await store.index(indexName as any).getAllKeys(IDBKeyRange.only(value));
      return keys.length;
    } catch (error) {
      console.error(`Error counting boolean index:`, error);
      return 0;
    }
  }

  /**
   * Update an entity
   * @param id UUID of entity to update
   * @param updates Partial entity with fields to update
   * @returns OperationResult with updated entity
   * @example const result = await repo.update(itemId, { quantity: 3 });
   */
  public async update(id: UUID, updates: Partial<T>): Promise<OperationResult<T>> {
    try {
      const db = await this.getDb();
      
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      
      const existing = await store.get(id as any); // Cast id to any
      if (!existing) throw new Error(`Entity with id ${id} not found`);

      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };

      await store.put(updated as any); // Cast updated to any
      await tx.done;

this.notifySubscribers({
    type: DataEventType.UPDATED,
    data: updated,
    timestamp: new Date(),
    source: this.storeName
});
console.log('🔔 Repository notified subscribers for update', updated.id);

      return { success: true, data: updated as T };
    } catch (error) {
      return this.handleError<T>(error, `Failed to update entity with id ${id}`);
    }
  }

  /**
   * Delete an entity
   * @param id UUID of entity to delete
   * @returns OperationResult with boolean success
   * @example const result = await repo.delete('123e4567-e89b-12d3-a456-426614174000');
   */
  public async delete(id: UUID): Promise<OperationResult<boolean>> {
    try {
      const db = await this.getDb();
      
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.objectStore(this.storeName).delete(id as any); // Cast id to any
      await tx.done;

      this.notifySubscribers({
        type: DataEventType.DELETED,
        data: { id } as T,
        timestamp: new Date(),
        source: this.storeName
      });

      return { success: true, data: true };
    } catch (error) {
      return this.handleError<boolean>(error, `Failed to delete entity with id ${id}`);
    }
  }

  /**
   * Handle and format errors consistently
   * @param error The error object
   * @param defaultMessage Default message if error is not an Error instance
   * @returns OperationResult with error details
   */
  protected handleError<T>(error: unknown, defaultMessage: string): OperationResult<T> {
    console.error(defaultMessage, error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(defaultMessage),
      message: error instanceof Error ? error.message : defaultMessage
    };
  }

  /**
   * Subscribe to data changes
   * @param callback Function to call when data changes
   * @returns Unsubscribe function
   * @example const unsubscribe = repo.subscribe((event) => console.log('Data changed:', event));
   */
  public subscribe(callback: (event: DataEvent<T>) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify subscribers of data changes
   * @param event Data event with type and changed data
   */
  protected notifySubscribers(event: DataEvent<T>): void {
    this.subscribers.forEach(callback => {
      try { callback(event); } 
      catch (error) { console.error('Subscriber callback failed:', error); }
    });
  }
}