import { IDBPDatabase, StoreNames, StoreKey, StoreValue } from 'idb';
import { DatabaseService } from '../database.service';
import { OperationResult, QueryParams, DataEvent, DataEventType, UUID } from '../../types/shopping-list.types';

/**
 * Generic base repository with common CRUD operations
 * Uses TypeScript generics for type safety
 */
export abstract class BaseRepository<T extends { id: UUID }, Schema> {
  protected dbService: DatabaseService;
  protected abstract storeName: StoreNames<Schema>;
  private subscribers: ((event: DataEvent<T>) => void)[] = [];

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Get database instance
   */
  protected async getDb(): Promise<IDBPDatabase<Schema>> {
    return this.dbService.getDb() as Promise<IDBPDatabase<Schema>>;
  }

  /**
   * Create a new entity
   */
  public async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<T>> {
    try {
      const db = await this.getDb();
      
      const now = new Date();
      const newItem = {
        ...data,
        id: crypto.randomUUID() as UUID,
        createdAt: now,
        updatedAt: now,
      } as T;

      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.objectStore(this.storeName).add(newItem);
      await tx.done;

      this.notifySubscribers({
        type: DataEventType.CREATED,
        data: newItem,
        timestamp: new Date(),
        source: this.storeName
      });

      return {
        success: true,
        data: newItem
      };
    } catch (error) {
      return this.handleError<T>(error, 'Failed to create entity');
    }
  }

  /**
   * Find entity by ID
   */
  public async findById(id: UUID): Promise<OperationResult<T>> {
    try {
      const db = await this.getDb();
      const data = await db.get(this.storeName, id as StoreKey<Schema, typeof this.storeName>);

      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      return this.handleError<T>(error, `Failed to find entity with id ${id}`);
    }
  }

  /**
   * Find all entities matching query
   */
  public async findAll(params?: QueryParams<T>): Promise<OperationResult<T[]>> {
    try {
      const db = await this.getDb();
      let data = await db.getAll(this.storeName);

      // Apply filters
      if (params?.filter) {
        data = data.filter(item => {
          return Object.entries(params.filter!).every(([key, value]) => {
            return item[key as keyof T] === value;
          });
        });
      }

      // Apply sorting
      if (params?.sort) {
        const { field, direction } = params.sort;
        data.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          
          if (aVal < bVal) return direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      if (params?.offset) {
        data = data.slice(params.offset);
      }
      if (params?.limit) {
        data = data.slice(0, params.limit);
      }

      return {
        success: true,
        data: data as T[]
      };
    } catch (error) {
      return this.handleError<T[]>(error, 'Failed to find entities');
    }
  }

  /**
   * Update an entity
   */
  public async update(id: UUID, updates: Partial<T>): Promise<OperationResult<T>> {
    try {
      const db = await this.getDb();
      
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      
      const existing = await store.get(id as StoreKey<Schema, typeof this.storeName>);
      if (!existing) {
        throw new Error(`Entity with id ${id} not found`);
      }

      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      } as T;

      await store.put(updated);
      await tx.done;

      this.notifySubscribers({
        type: DataEventType.UPDATED,
        data: updated,
        timestamp: new Date(),
        source: this.storeName
      });

      return {
        success: true,
        data: updated
      };
    } catch (error) {
      return this.handleError<T>(error, `Failed to update entity with id ${id}`);
    }
  }

  /**
   * Delete an entity
   */
  public async delete(id: UUID): Promise<OperationResult<boolean>> {
    try {
      const db = await this.getDb();
      
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.objectStore(this.storeName).delete(id as StoreKey<Schema, typeof this.storeName>);
      await tx.done;

      // We don't have the data to notify with, so we create a minimal event
      this.notifySubscribers({
        type: DataEventType.DELETED,
        data: { id } as T,
        timestamp: new Date(),
        source: this.storeName
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return this.handleError<boolean>(error, `Failed to delete entity with id ${id}`);
    }
  }

  /**
   * Error handler
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
   */
  public subscribe(callback: (event: DataEvent<T>) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify subscribers of data changes
   */
  protected notifySubscribers(event: DataEvent<T>): void {
    this.subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Subscriber callback failed:', error);
      }
    });
  }
}