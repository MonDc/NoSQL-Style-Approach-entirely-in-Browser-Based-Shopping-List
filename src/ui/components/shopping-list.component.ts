import { ShoppingListService } from '../../services/shopping-list.service';
import { ShoppingList, ShoppingListItem, UUID } from '../../types/shopping-list.types';
import { ListItemComponent } from './list-item.component';
import { AddItemFormComponent } from './add-item-form.component';

/**
 * UI Component for displaying and managing a shopping list
 * Follows the Observer pattern to react to data changes
 */
export class ShoppingListComponent {
  private container: HTMLElement;
  private listElement: HTMLElement;
  private service: ShoppingListService;
  private currentListId: UUID | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
    this.service = new ShoppingListService();
    this.render();
  }

  /**
   * Load a specific list
   */
  public async loadList(listId: UUID): Promise<void> {
    this.currentListId = listId;
    
    // Clean up previous subscription
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Subscribe to real-time updates
    this.unsubscribe = this.service.subscribeToList(listId, (list) => {
      this.renderList(list);
    });

    // Initial load
    const result = await this.service.repository.findById(listId);
    if (result.success && result.data) {
      this.renderList(result.data);
    }
  }

  /**
   * Render the component
   */
  private render(): void {
    this.container.innerHTML = `
      <div class="shopping-list-container">
        <header class="list-header">
          <h2 class="list-title">Loading...</h2>
          <div class="list-summary"></div>
        </header>
        
        <div class="add-item-section">
          <!-- Add item form will be mounted here -->
          <div id="add-item-form"></div>
        </div>
        
        <div class="items-section">
          <h3>Items</h3>
          <div class="items-list"></div>
        </div>
        
        <div class="list-actions">
          <button class="btn-archive" id="archive-list">Archive List</button>
          <button class="btn-clear" id="clear-completed">Clear Completed</button>
        </div>
      </div>
    `;

    this.listElement = this.container.querySelector('.items-list')!;
    
    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Render the list content
   */
  private renderList(list: ShoppingList): void {
    // Update header
    const titleElement = this.container.querySelector('.list-title')!;
    titleElement.textContent = list.name;

    // Render summary
    this.renderSummary(list);

    // Render items
    this.listElement.innerHTML = '';
    
    list.items.forEach(item => {
      const itemComponent = new ListItemComponent(item, {
        onToggle: () => this.toggleItem(item.id),
        onEdit: () => this.editItem(item.id),
        onDelete: () => this.deleteItem(item.id)
      });
      this.listElement.appendChild(itemComponent.render());
    });

    // Mount add item form
    const formContainer = document.getElementById('add-item-form')!;
    const formComponent = new AddItemFormComponent({
      onSubmit: (itemData) => this.addItem(itemData)
    });
    formContainer.innerHTML = '';
    formContainer.appendChild(formComponent.render());
  }

  /**
   * Render list summary
   */
  private async renderSummary(list: ShoppingList): Promise<void> {
    const summaryElement = this.container.querySelector('.list-summary')!;
    
    if (this.currentListId) {
      const summary = await this.service.getListSummary(this.currentListId);
      if (summary.success && summary.data) {
        summaryElement.innerHTML = `
          <div class="summary-stats">
            <span>Total: ${summary.data.totalItems}</span>
            <span>Completed: ${summary.data.completedItems}</span>
            <span>Pending: ${summary.data.pendingItems}</span>
            ${summary.data.estimatedTotal ? 
              `<span>Est. Total: $${summary.data.estimatedTotal.toFixed(2)}</span>` : 
              ''}
          </div>
        `;
      }
    }
  }

  /**
   * Add new item
   */
  private async addItem(itemData: any): Promise<void> {
    if (!this.currentListId) return;

    await this.service.addItem(this.currentListId, {
      name: itemData.name,
      quantity: itemData.quantity,
      unit: itemData.unit,
      priority: itemData.priority,
      category: itemData.category,
      notes: itemData.notes
    });
  }

  /**
   * Toggle item status
   */
  private async toggleItem(itemId: UUID): Promise<void> {
    if (!this.currentListId) return;
    await this.service.repository.toggleItemStatus(this.currentListId, itemId);
  }

  /**
   * Edit item
   */
  private async editItem(itemId: UUID): Promise<void> {
    // Implementation for inline editing
    console.log('Edit item:', itemId);
  }

  /**
   * Delete item
   */
  private async deleteItem(itemId: UUID): Promise<void> {
    if (!this.currentListId) return;
    
    if (confirm('Are you sure you want to delete this item?')) {
      await this.service.repository.removeItemFromList(this.currentListId, itemId);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const archiveBtn = document.getElementById('archive-list');
    const clearBtn = document.getElementById('clear-completed');

    archiveBtn?.addEventListener('click', async () => {
      if (!this.currentListId) return;
      
      if (confirm('Archive this list?')) {
        await this.service.archiveList(this.currentListId);
      }
    });

    clearBtn?.addEventListener('click', async () => {
      if (!this.currentListId) return;
      
      // Implementation for clearing completed items
      const result = await this.service.repository.findById(this.currentListId);
      if (result.success && result.data) {
        const pendingItems = result.data.items.filter(i => i.status !== 'completed');
        await this.service.repository.update(this.currentListId, { 
          items: pendingItems 
        });
      }
    });
  }

  /**
   * Clean up on component destroy
   */
  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}