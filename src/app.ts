// app.ts
import { DatabaseService } from './db/database.service';
import { ShoppingListService } from './services/shopping-list.service';
import { ShoppingListComponent } from './ui/components/shopping-list.component';
import { ErrorHandler } from './utils/error-handler.util';

/**
 * Main application class
 * Responsible for bootstrapping the app and coordinating top-level initialization
 */
class ShoppingListApp {
  private dbService: DatabaseService;
  private listService: ShoppingListService;
  private errorHandler: ErrorHandler;
  private listComponent: ShoppingListComponent;

  constructor() {
    console.log('🏗️ App constructor starting...'); // BINGO DEBUGO
    // Initialize core services (singletons)
    this.dbService = DatabaseService.getInstance();
    this.listService = new ShoppingListService();
    this.errorHandler = ErrorHandler.getInstance();
    
    // Create main UI component (mounts to #app)
    this.listComponent = new ShoppingListComponent('app');

    // Enable sync - use your Pi's IP
    const PI_IP = '192.168.178.21'; // Your Pi's actual IP
    this.listService.enableSync(`ws://${PI_IP}:8080`);
  }

  /**
   * Initialize the application
   * Sets up database, ensures demo data, and loads initial list
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Shopping List App...');
      
      // Step 1: Initialize database connection
      await this.dbService.initialize();
      this.errorHandler.logInfo('Database initialized successfully');

      // Step 2: Initialize product catalog (loads default products)
      await this.listService.initializeCatalog();
      this.errorHandler.logInfo('Product catalog initialized');

      // Step 3: Ensure at least one shopping list exists
      await this.ensureDemoData();

      // Step 4: Component auto-loads first list via its own initialization
      this.errorHandler.logInfo('App ready');

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to initialize application');
      this.showErrorMessage('Failed to load application. Please refresh the page.');
    }
  }

  /**
   * Ensure demo data exists for first-time users
   * Creates a sample shopping list if none exists
   */
  private async ensureDemoData(): Promise<void> {
    try {
      // Check if user has any lists
      const lists = await this.listService.getUserLists('demo-user');
      
      if (!lists.success) {
        throw new Error(lists.message || 'Failed to fetch user lists');
      }

      // If no lists exist, create a demo one
      if (!lists.data || lists.data.length === 0) {
        this.errorHandler.logInfo('No lists found, creating demo list...');
        
        const newList = await this.listService.createList(
          'My Shopping List',
          'demo-user',
          'Weekly groceries'
        );

        if (newList.success && newList.data) {
          this.errorHandler.logInfo('Demo list created', { listId: newList.data.id });
          
          // Optional: Add some demo items to showcase the app
          await this.addDemoItems(newList.data.id);
        } else {
          throw new Error(newList.message || 'Failed to create demo list');
        }
      } else {
        this.errorHandler.logInfo('Existing lists found', { count: lists.data.length });
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to ensure demo data');
      // Non-critical error - app can still function
    }
  }

  /**
   * Add sample items to demonstrate app functionality
   * @param listId - ID of the list to add items to
   */
  private async addDemoItems(listId: string): Promise<void> {
    try {
      const demoItems = [
        { name: 'Milk', quantity: 2, unit: 'liter', category: 'Dairy' },
        { name: 'Eggs', quantity: 12, unit: 'piece', category: 'Dairy' },
        { name: 'Bread', quantity: 1, unit: 'piece', category: 'Bakery' },
        { name: 'Apples', quantity: 6, unit: 'piece', category: 'Produce' }
      ];

      for (const item of demoItems) {
        await this.listService.addItem(listId as any, {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit as any,
          category: item.category
        });
      }

      this.errorHandler.logInfo('Demo items added', { count: demoItems.length });
    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to add demo items');
      // Non-critical - user can add items manually
    }
  }

  /**
   * Display error message to user
   * @param message - User-friendly error message
   */
  private showErrorMessage(message: string): void {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="
          color: #721c24;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 20px;
          margin: 20px;
          text-align: center;
          font-family: sans-serif;
        ">
          <h2 style="margin-top: 0;">❌ Error</h2>
          <p>${message}</p>
          <button onclick="location.reload()" style="
            background: #721c24;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
          ">
            Refresh Page
          </button>
        </div>
      `;
    }
  }

  /**
   * Clean up resources when app is destroyed
   * Useful for HMR or testing
   */
  public destroy(): void {
    try {
      if (this.listComponent) {
        this.listComponent.destroy();
      }
      this.errorHandler.logInfo('App destroyed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new ShoppingListApp();
  app.initialize().catch(console.error);
  
  // Expose for debugging (optional)
  if (import.meta.env?.DEV) {
    (window as any).__shoppingListApp = app;
  }
});

// Cleanup on hot module replacement (Vite)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if ((window as any).__shoppingListApp) {
      (window as any).__shoppingListApp.destroy();
    }
  });
}