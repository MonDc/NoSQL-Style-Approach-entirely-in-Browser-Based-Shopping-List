import { IDBPDatabase, openDB } from 'idb';
import { ShoppingListDBSchema } from '../types/shopping-list.types';

// Database name and version
const DB_NAME = 'shopping-list-app';
const DB_VERSION = 8;

/**
 * Service that manages IndexedDB connection and schema
 * Singleton pattern ensures single database connection
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private db: IDBPDatabase<ShoppingListDBSchema> | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection
   * Creates object stores and indexes if they don't exist
   */
  public async initialize(): Promise<void> {
    if (this.db) return;
    
    if (!this.initPromise) {
      this.initPromise = this.createDatabase();
    }
    
    await this.initPromise;
  }

  private async createDatabase(): Promise<void> {
    try {
      this.db = await openDB<ShoppingListDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
          console.log(`Upgrading database from ${oldVersion} to ${newVersion}`);

          // Create shopping lists store
          if (!db.objectStoreNames.contains('shoppingLists')) {
            const listStore = db.createObjectStore('shoppingLists', { 
              keyPath: 'id' 
            });
            
            // Create indexes for efficient querying
            listStore.createIndex('by-name', 'name');
            listStore.createIndex('by-owner', 'ownerId');
            listStore.createIndex('by-created', 'createdAt');
            listStore.createIndex('by-updated', 'updatedAt');
            listStore.createIndex('by-archived', 'isArchived');
          }

          // Create shopping list items store
          if (!db.objectStoreNames.contains('shoppingListItems')) {
            const itemsStore = db.createObjectStore('shoppingListItems', { 
              keyPath: 'id' 
            });
            
            // Create indexes for items
            itemsStore.createIndex('by-list', 'shoppingListId');
            itemsStore.createIndex('by-status', 'status');
            itemsStore.createIndex('by-category', 'category');
            itemsStore.createIndex('by-priority', 'priority');
            itemsStore.createIndex('by-created', 'createdAt');
          }

            // In the upgrade function, add:
          if (!db.objectStoreNames.contains('productCatalog')) {
              const catalogStore = db.createObjectStore('productCatalog', { 
                  keyPath: 'id' 
              });
              
              catalogStore.createIndex('by-name', 'name');
              catalogStore.createIndex('by-category', 'category');
              catalogStore.createIndex('by-popular', 'popular');
              catalogStore.createIndex('by-tags', 'tags', { multiEntry: true });
          }
        },
      });

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  /**
   * Get database instance (ensures initialization)
   */
  public async getDb(): Promise<IDBPDatabase<ShoppingListDBSchema>> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  /**
   * Clear all data (useful for testing)
   */
  public async clearAllData(): Promise<void> {
    const db = await this.getDb();
    const tx = db.transaction(['shoppingLists', 'shoppingListItems'], 'readwrite');
    await tx.objectStore('shoppingLists').clear();
    await tx.objectStore('shoppingListItems').clear();
    await tx.done;
  }
}