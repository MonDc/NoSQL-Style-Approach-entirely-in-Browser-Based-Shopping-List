// app.ts
import { DatabaseService } from './db/database.service';
import { ShoppingListService } from './services/shopping-list.service';
import { ShoppingListComponent } from './ui/components/shopping-list.component';
import { ErrorHandler } from './utils/error-handler.util';

/**
 * Main application class
 */
class ShoppingListApp {
  private dbService: DatabaseService;
  private listService: ShoppingListService;
  private errorHandler: ErrorHandler;
  private listComponent: ShoppingListComponent;

  constructor() {
    this.dbService = DatabaseService.getInstance();
    this.listService = new ShoppingListService();
    this.errorHandler = ErrorHandler.getInstance();
    this.listComponent = new ShoppingListComponent('app');
  }

  /**
   * Initialize the application
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize database
      await this.dbService.initialize();
      this.errorHandler.logInfo('Database initialized');

      // Create a demo list if none exists
      await this.ensureDemoData();

      // Load the first list
      await this.loadFirstList();

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to initialize application');
      this.showErrorMessage('Failed to load application. Please refresh the page.');
    }
  }

  /**
   * Ensure demo data exists
   */
  private async ensureDemoData(): Promise<void> {
    const lists = await this.listService.getUserLists('demo-user');
    
    if (!lists.data || lists.data.length === 0) {
      // Create demo list
      const newList = await this.listService.createList(
        'My Shopping List',
        'demo-user',
        'Weekly groceries'
      );

      if (newList.success && newList.data) {
        // Add demo