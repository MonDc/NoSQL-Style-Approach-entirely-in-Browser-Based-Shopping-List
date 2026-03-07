import { ShoppingListService } from '../../services/shopping-list.service';
import { CatalogRepository } from '../../db/repositories/catalog.repository';
import { 
    ShoppingList, 
    ShoppingListItem, 
    UUID, 
    Unit,
    Priority,
    CatalogProduct 
} from '../../types/shopping-list.types';
import { ListItemComponent, ListItemCallbacks } from './list-item.component';
import { AddItemFormComponent, AddItemFormCallbacks } from './add-item-form.component';

/**
 * Main shopping list component
 * Orchestrates all UI interactions and data flow
 * UI Component for displaying and managing a shopping list  
 * Follows the Observer pattern to react to data changes
 */
export class ShoppingListComponent {
    private container: HTMLElement;
    private service: ShoppingListService;
    private catalogRepo: CatalogRepository;
    
    // State
    private currentListId: UUID | null = null;
    private currentList: ShoppingList | null = null;
    private unsubscribe: (() => void) | null = null;
    
    // Sub-components
    private listItemComponents: Map<UUID, ListItemComponent> = new Map();
    private addItemForm: AddItemFormComponent | null = null;
    
    // DOM elements cache
    private elements: {
        listTitle?: HTMLElement;
        listSummary?: HTMLElement;
        itemsList?: HTMLElement;
        popularItems?: HTMLElement;
        categoryProducts?: HTMLElement;
        searchInput?: HTMLInputElement;
        searchResults?: HTMLElement;
        itemCount?: HTMLElement;
    } = {};

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)!;
        this.service = new ShoppingListService();
        this.catalogRepo = new CatalogRepository();
        
        this.initialize();
    }

    /**
     * Initialize the component
     */
    private async initialize(): Promise<void> {
        await this.ensureDatabaseReady();
        await this.ensureListExists();
        this.render();
        this.cacheElements();
        this.setupEventListeners();
        await this.loadInitialData();
    }

    /**
     * Ensure database is initialized
     */
    private async ensureDatabaseReady(): Promise<void> {
        try {
            await this.service.initializeCatalog();
            console.log('✅ Database ready');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            this.showError('Failed to initialize database');
        }
    }

    /**
     * Create or get today's shopping list
     */
    private async ensureListExists(): Promise<void> {
        const lists = await this.service.getUserLists('demo-user');
        
        if (lists.success && lists.data && lists.data.length > 0) {
            this.currentListId = lists.data[0].id;
            this.currentList = lists.data[0];
        } else {
            const newList = await this.service.createList(
                `Shopping List ${new Date().toLocaleDateString()}`,
                'demo-user'
            );
            
            if (newList.success && newList.data) {
                this.currentListId = newList.data.id;
                this.currentList = newList.data;
            }
        }
    }

    /**
     * Render the main UI
     */
    private render(): void {
        this.container.innerHTML = `
            <div class="shopping-list-app" style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Header -->
                <header style="margin-bottom: 30px;">
                    <h1 style="display: flex; align-items: center; gap: 10px; margin: 0;">
                        🛒 Shopping List
                        <span class="list-title" style="font-size: 16px; color: #666; font-weight: normal;">
                            Loading...
                        </span>
                    </h1>
                    <div class="list-summary" style="margin-top: 10px; font-size: 14px; color: #666;"></div>
                </header>

                <!-- Category Tabs -->
                <div class="category-tabs" style="margin-bottom: 30px;">
                    <div style="display: flex; gap: 10px; overflow-x: auto; padding: 5px 0;">
                        <button class="category-btn active" data-category="all" 
                            style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 20px; cursor: pointer;">
                            All
                        </button>
                        ${this.renderCategoryButtons()}
                    </div>
                </div>

                <!-- Popular Items -->
                <section style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 10px;">🔥 Popular Items</h3>
                    <div class="popular-items" style="display: flex; gap: 10px; flex-wrap: wrap;"></div>
                </section>

                <!-- Search -->
                <section style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 10px;">🔍 Search Catalog</h3>
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="Type to search..." 
                        style="width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px;"
                    />
                    <div class="search-results" style="margin-top: 10px;"></div>
                </section>

                <!-- Category Products -->
                <section style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 10px;">📦 Products by Category</h3>
                    <div class="category-products" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;"></div>
                </section>

                <!-- Add Item Form -->
                <div class="add-form-container" style="margin-bottom: 30px;"></div>

                <!-- My List -->
                <section style="margin-bottom: 30px;">
                    <h3 style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>📝 My List</span>
                        <span class="item-count" style="background: #f0f0f0; padding: 2px 8px; border-radius: 12px;">0</span>
                    </h3>
                    <div class="items-list" style="background: #f9f9f9; border-radius: 8px; padding: 15px;"></div>
                </section>

                <!-- List Actions -->
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="archive-list" style="padding: 8px 16px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Archive List
                    </button>
                    <button class="clear-completed" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Clear Completed
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render category buttons
     */
    private renderCategoryButtons(): string {
        const categories = ['Dairy', 'Produce', 'Meat', 'Bakery', 'Beverages', 'Snacks', 'Canned Goods', 'Household'];
        return categories.map(cat => `
            <button class="category-btn" data-category="${cat}"
                style="padding: 8px 16px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 20px; cursor: pointer;">
                ${this.getCategoryEmoji(cat)} ${cat}
            </button>
        `).join('');
    }

    /**
     * Cache DOM elements for faster access
     */
    private cacheElements(): void {
        this.elements = {
            listTitle: this.container.querySelector('.list-title') as HTMLElement,
            listSummary: this.container.querySelector('.list-summary') as HTMLElement,
            itemsList: this.container.querySelector('.items-list') as HTMLElement,
            popularItems: this.container.querySelector('.popular-items') as HTMLElement,
            categoryProducts: this.container.querySelector('.category-products') as HTMLElement,
            searchInput: this.container.querySelector('.search-input') as HTMLInputElement,
            searchResults: this.container.querySelector('.search-results') as HTMLElement,
            itemCount: this.container.querySelector('.item-count') as HTMLElement
        };
    }

    /**
     * Setup global event listeners
     */
    private setupEventListeners(): void {
        // Category tabs
        this.container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.target as HTMLElement;
                this.container.querySelectorAll('.category-btn').forEach(b => {
                    (b as HTMLElement).style.background = '#f0f0f0';
                    (b as HTMLElement).style.color = '#000';
                });
                target.style.background = '#4CAF50';
                target.style.color = 'white';
                
                const category = target.getAttribute('data-category');
                await this.loadCategoryProducts(category);
            });
        });

        // Search input with debounce
        let timeout: NodeJS.Timeout;
        this.elements.searchInput?.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.handleSearch(), 300);
        });

        // List actions
        this.container.querySelector('.archive-list')?.addEventListener('click', () => this.archiveList());
        this.container.querySelector('.clear-completed')?.addEventListener('click', () => this.clearCompleted());
    }

    /**
     * Load all initial data
     */
    private async loadInitialData(): Promise<void> {
        await Promise.all([
            this.loadListData(),
            this.loadPopularItems(),
            this.loadCategoryProducts('all')
        ]);
        
        this.initAddItemForm();
        this.subscribeToListUpdates();
    }

    /**
     * Load current list data
     */
    private async loadListData(): Promise<void> {
        if (!this.currentListId) return;
        
        const result = await this.service.repository.findById(this.currentListId);
        if (result.success && result.data) {
            this.currentList = result.data;
            this.updateListUI();
        }
    }

    /**
     * Update list UI with current data
     */
    private updateListUI(): void {
        if (!this.currentList) return;
        
        // Update title
        if (this.elements.listTitle) {
            this.elements.listTitle.textContent = this.currentList.name;
        }
        
        // Update item count
        if (this.elements.itemCount) {
            this.elements.itemCount.textContent = this.currentList.items.length.toString();
        }
        
        // Render items
        this.renderItems();
        
        // Update summary
        this.updateSummary();
    }

    /**
     * Render all list items
     */
    private renderItems(): void {
        if (!this.elements.itemsList || !this.currentList) return;
        
        this.elements.itemsList.innerHTML = '';
        this.listItemComponents.clear();
        
        if (this.currentList.items.length === 0) {
            this.elements.itemsList.innerHTML = '<p style="color: #999; text-align: center;">No items yet. Add some from above!</p>';
            return;
        }
        
        this.currentList.items.forEach(item => {
            const component = new ListItemComponent(item, this.getItemCallbacks());
            this.elements.itemsList!.appendChild(component.getElement());
            this.listItemComponents.set(item.id, component);
        });
    }

    /**
     * Get callbacks for list items
     */
    private getItemCallbacks(): ListItemCallbacks {
        return {
            onToggle: async (itemId: UUID) => {
                if (!this.currentListId) return;
                await this.service.repository.toggleItemStatus(this.currentListId, itemId);
            },
            onEdit: (itemId: UUID) => {
                console.log('Edit item:', itemId);
                // Implement edit functionality
            },
            onDelete: async (itemId: UUID) => {
                if (!this.currentListId) return;
                await this.service.repository.removeItemFromList(this.currentListId, itemId);
            }
        };
    }

    /**
     * Update list summary
     */
    private async updateSummary(): Promise<void> {
        if (!this.currentListId || !this.elements.listSummary) return;
        
        const summary = await this.service.getListSummary(this.currentListId);
        if (summary.success && summary.data) {
            this.elements.listSummary.innerHTML = `
                <span>Total: ${summary.data.totalItems}</span> |
                <span>✅ Completed: ${summary.data.completedItems}</span> |
                <span>⏳ Pending: ${summary.data.pendingItems}</span>
            `;
        }
    }

    /**
     * Load popular items
     */
    private async loadPopularItems(): Promise<void> {
        if (!this.elements.popularItems) return;
        
        const result = await this.service.getPopularProducts();
        
        if (result.success && result.data) {
            this.elements.popularItems.innerHTML = result.data.map(product => `
                <button class="add-popular" data-product-id="${product.id}" data-product-name="${product.name}"
                    style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 20px; cursor: pointer;">
                    ➕ ${product.name}
                </button>
            `).join('');
            
            this.elements.popularItems.querySelectorAll('.add-popular').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const productId = target.getAttribute('data-product-id');
                    const productName = target.getAttribute('data-product-name');
                    if (productId && productName) {
                        this.addCatalogItem(productId, productName);
                    }
                });
            });
        }
    }

    /**
     * Load products by category
     */
    private async loadCategoryProducts(category: string | null): Promise<void> {
        if (!this.elements.categoryProducts) return;
        
        this.elements.categoryProducts.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Loading...</div>';
        
        try {
            let result;
            if (category === 'all' || !category) {
                result = await this.catalogRepo.findAll();
            } else {
                result = await this.catalogRepo.getByCategory(category);
            }
            
            if (!result.success || !result.data) {
                this.elements.categoryProducts.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Error loading products</div>';
                return;
            }
            
            const products = result.data;
            
            if (products.length === 0) {
                this.elements.categoryProducts.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999;">No products in this category</div>';
                return;
            }
            
            this.elements.categoryProducts.innerHTML = products.map(product => `
                <button class="add-category-item" data-product-id="${product.id}" data-product-name="${product.name}"
                    style="padding: 12px; background: white; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">${this.getCategoryEmoji(product.category)}</div>
                    <div style="font-weight: bold;">${product.name}</div>
                </button>
            `).join('');
            
            this.elements.categoryProducts.querySelectorAll('.add-category-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const productId = target.getAttribute('data-product-id');
                    const productName = target.getAttribute('data-product-name');
                    if (productId && productName) {
                        this.addCatalogItem(productId, productName);
                    }
                });
            });
            
        } catch (error) {
            console.error('Error loading category products:', error);
            this.elements.categoryProducts.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Error loading products</div>';
        }
    }

    /**
     * Handle search input
     */
    private async handleSearch(): Promise<void> {
        const query = this.elements.searchInput?.value.trim() || '';
        
        if (!this.elements.searchResults) return;
        
        if (query.length < 2) {
            this.elements.searchResults.innerHTML = '';
            return;
        }
        
        this.elements.searchResults.innerHTML = '<div style="text-align: center;">Searching...</div>';
        
        const results = await this.service.searchProducts(query);
        
        if (results.success && results.data) {
            if (results.data.length === 0) {
                this.elements.searchResults.innerHTML = '<div style="text-align: center; color: #999;">No products found</div>';
                return;
            }
            
            this.elements.searchResults.innerHTML = results.data.map(product => `
                <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                    <span>
                        <strong>${product.name}</strong>
                        <span style="color: #666; margin-left: 8px;">${product.category}</span>
                    </span>
                    <button class="add-search" data-product-id="${product.id}" data-product-name="${product.name}"
                        style="background: #4CAF50; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer;">
                        Add
                    </button>
                </div>
            `).join('');
            
            this.elements.searchResults.querySelectorAll('.add-search').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const productId = target.getAttribute('data-product-id');
                    const productName = target.getAttribute('data-product-name');
                    if (productId && productName) {
                        this.addCatalogItem(productId, productName);
                        this.elements.searchInput!.value = '';
                        this.elements.searchResults!.innerHTML = '';
                    }
                });
            });
        }
    }

    /**
     * Initialize the add item form
     */
    private initAddItemForm(): void {
        const container = this.container.querySelector('.add-form-container');
        if (!container) return;
        
        const callbacks: AddItemFormCallbacks = {
            onSubmit: async (itemData) => {
                if (!this.currentListId) return;
                await this.service.addItem(this.currentListId, itemData);
            }
        };
        
        this.addItemForm = new AddItemFormComponent(callbacks);
        container.appendChild(this.addItemForm.getElement());
    }

    /**
     * Add item from catalog to list
     */
    private async addCatalogItem(productId: string, productName: string): Promise<void> {
        if (!this.currentListId) {
            alert('No active shopping list');
            return;
        }
        
        try {
            await this.service.addCatalogItemToList(
                this.currentListId,
                productId as UUID,
                1 // default quantity
            );
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item');
        }
    }

    /**
     * Subscribe to real-time list updates
     */
    private subscribeToListUpdates(): void {
        if (!this.currentListId) return;
        
        this.unsubscribe = this.service.subscribeToList(this.currentListId, (updatedList) => {
            this.currentList = updatedList;
            this.updateListUI();
        });
    }

    /**
     * Archive current list
     */
    private async archiveList(): Promise<void> {
        if (!this.currentListId) return;
        
        if (confirm('Archive this list?')) {
            await this.service.archiveList(this.currentListId);
            // Optionally create new list or redirect
        }
    }

    /**
     * Clear completed items
     */
    private async clearCompleted(): Promise<void> {
        if (!this.currentListId || !this.currentList) return;
        
        if (confirm('Clear all completed items?')) {
            const pendingItems = this.currentList.items.filter(i => i.status !== 'completed');
            await this.service.repository.update(this.currentListId, { items: pendingItems });
        }
    }

    /**
     * Show error message to user
     */
    private showError(message: string): void {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
        `;
        errorDiv.textContent = message;
        this.container.prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    /**
     * Get emoji for category
     */
    private getCategoryEmoji(category: string): string {
        const emojis: Record<string, string> = {
            'Dairy': '🥛',
            'Produce': '🥬',
            'Meat': '🥩',
            'Bakery': '🍞',
            'Beverages': '☕',
            'Snacks': '🍫',
            'Canned Goods': '🥫',
            'Household': '🧻',
            'Pantry': '🍚'
        };
        return emojis[category] || '📦';
    }

    /**
     * Clean up resources
     */
    public destroy(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        
        this.listItemComponents.clear();
        
        if (this.addItemForm) {
            this.addItemForm.destroy();
        }
        
        this.container.innerHTML = '';
    }
}