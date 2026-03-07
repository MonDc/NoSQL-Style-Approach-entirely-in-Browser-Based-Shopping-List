import { ShoppingListService } from '../../services/shopping-list.service';
import { CatalogRepository } from '../../db/repositories/catalog.repository';
import { 
    ShoppingList,  
    UUID, 
    Unit,
    CatalogProduct 
} from '../../types/shopping-list.types';
import { ListItemComponent, ListItemCallbacks } from './list-item.component';
import { AddItemFormComponent } from './add-item-form.component';
import { SwipeableGrid } from './swipeable-grid/swipeable-grid.component';

/**
 * Main shopping list component [Manages DOM element references to avoid repeated queries]
 * Orchestrates all UI interactions and data flow
 * UI Component for displaying and managing a shopping list  
 * Follows the Observer pattern to react to data changes
 */
interface DOMElements {
    listTitle: HTMLElement | null;
    listSummary: HTMLElement | null;
    itemsList: HTMLElement | null;
    categoryProducts: HTMLElement | null;
    searchInput: HTMLInputElement | null;
    searchResults: HTMLElement | null;
    itemCount: HTMLElement | null;
    archiveBtn: HTMLElement | null;
    clearBtn: HTMLElement | null;
}

/**
 * Main shopping list component
 * Orchestrates all UI interactions and data flow
 * Follows the Observer pattern to react to data changes
 */
export class ShoppingListComponent {
    // Core dependencies
    private container: HTMLElement;
    private service: ShoppingListService;
    private catalogRepo: CatalogRepository;
    
    // Application state
    private currentListId: UUID | null = null;
    private currentList: ShoppingList | null = null;
    private unsubscribe: (() => void) | null = null;
    
    // Sub-components
    private listItemComponents: Map<UUID, ListItemComponent> = new Map();
    private addItemForm: AddItemFormComponent | null = null;
    private swipeableGrid: SwipeableGrid | null = null;  // ← Add this!
    
    // DOM elements cache
    private elements: DOMElements = {
        listTitle: null,
        listSummary: null,
        itemsList: null,
        categoryProducts: null,
        searchInput: null,
        searchResults: null,
        itemCount: null,
        archiveBtn: null,
        clearBtn: null
    };

    // Constants
    private readonly USER_ID = 'demo-user';
    private readonly DEBOUNCE_DELAY = 150;

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = container;
        this.service = new ShoppingListService();
        this.catalogRepo = new CatalogRepository();
        
        this.initialize();
    }

    /**
     * Initialize the component
     */
    private async initialize(): Promise<void> {
        try {
            await this.ensureDatabaseReady();
            await this.ensureListExists();
            this.renderLayout();
            this.cacheElements();
            this.setupEventListeners();
            await this.loadInitialData();
        } catch (error) {
            console.error('Failed to initialize shopping list component:', error);
            this.showError('Failed to load shopping list. Please refresh the page.');
        }
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
            throw new Error('Database initialization failed');
        }
    }

    /**
     * Initialize the swipeable grid with all products
     */
    private async initializeSwipeableGrid(): Promise<void> {
        if (!this.elements.categoryProducts) return;
        
        try {
            const result = await this.catalogRepo.findAll();
            
            if (result.success && result.data) {
                this.swipeableGrid = new SwipeableGrid(
                    result.data,
                    {
                        onItemClick: (product) => this.addCatalogItem(product.id, product.name),
                        onPageChange: (page) => console.log('Swiped to page:', page + 1)
                    },
                    {
                        dimensions: {
                            rows: 2,
                            columns: 2,
                            gap: 18
                        },
                        behavior: {
                            infinite: true,
                            swipeThreshold: 50,
                            showDots: false,  // ← This removes the dots
                            transitionDuration: 300
                        },
                        styling: {
                            cardPadding: '24px 12px',
                            emojiSize: '48px',
                            nameFontSize: '16px',
                            cardBorderRadius: '18px'
                        }
                    }
                );
                
                this.elements.categoryProducts.innerHTML = '';
                this.elements.categoryProducts.appendChild(this.swipeableGrid.getElement());
            }
        } catch (error) {
            console.error('Error initializing swipeable grid:', error);
            this.showError('Failed to load products');  // ← Use showError instead
        }
    }
        /**
     * Create or get today's shopping list
     */
    private async ensureListExists(): Promise<void> {
        const lists = await this.service.getUserLists(this.USER_ID);
        
        if (lists.success && lists.data && lists.data.length > 0) {
            this.currentListId = lists.data[0].id;
            this.currentList = lists.data[0];
        } else {
            const newList = await this.service.createList(
                `Shopping List ${new Date().toLocaleDateString()}`,
                this.USER_ID
            );
            
            if (newList.success && newList.data) {
                this.currentListId = newList.data.id;
                this.currentList = newList.data;
            }
        }
    }

    /**
     * Render the main layout structure
     */
    private renderLayout(): void {
        this.container.innerHTML = `
            <div class="shopping-list-app" style="max-width: 600px; margin: 0 auto; padding: 20px;">
                ${this.renderSearchSection()}
                ${this.renderFeaturedSection()}
                ${this.renderListSection()}
                ${this.renderActionsSection()}
            </div>
        `;
    }


    /**
     * Render search section - soft grey focus
     */
    private renderSearchSection(): string {
        return `
            <section style="margin-bottom: 30px;">
                <input 
                    type="text" 
                    class="search-input" 
                    placeholder="🔍" 
                    style="
                        width: 100%; 
                        padding: 14px 16px; 
                        font-size: 16px; 
                        border: 2px solid #e0e0e0; 
                        border-radius: 30px; 
                        box-sizing: border-box; 
                        background: #f8f8f8;
                        outline: none;
                        transition: all 0.3s ease;
                    "
                    onfocus="this.placeholder=''; this.style.borderColor='#B0B0B0'; this.style.background='#FFFFFF'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.05)';"
                    onblur="this.placeholder='🔍'; this.style.borderColor='#e0e0e0'; this.style.background='#f8f8f8'; this.style.boxShadow='none';"
                />
                <div class="search-results" style="margin-top: 12px;"></div>
            </section>
        `;
    }

    /**
     * Render featured items section - no "Featured Items" text
     */
    private renderFeaturedSection(): string {
        return `
            <section style="margin-bottom: 30px;">
                <div class="category-products" style="min-height: 200px;"></div>
            </section>
        `;
    }

    /**
     * Render shopping list section - no text, no count, just the list
     */
    private renderListSection(): string {
        return `
            <section style="margin-bottom: 30px;">
                <div class="items-list" style="background: #f9f9f9; border-radius: 12px; padding: 16px; min-height: 100px;"></div>
            </section>
        `;
    }

    /**
     * Render action buttons section
     */
    private renderActionsSection(): string {
        return `
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="archive-list" style="padding: 8px 16px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Archive
                </button>
                <button class="clear-completed" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Clear
                </button>
            </div>
        `;
    }
        /**
         * Cache DOM elements for faster access
         */
        private cacheElements(): void {
            this.elements = {
                listTitle: this.container.querySelector('.list-title'),
                listSummary: this.container.querySelector('.list-summary'),
                itemsList: this.container.querySelector('.items-list'),
                categoryProducts: this.container.querySelector('.category-products'),
                searchInput: this.container.querySelector('.search-input'),
                searchResults: this.container.querySelector('.search-results'),
                itemCount: this.container.querySelector('.item-count'),
                archiveBtn: this.container.querySelector('.archive-list'),
                clearBtn: this.container.querySelector('.clear-completed')
            };
        }

    /**
     * Setup global event listeners
     */
    private setupEventListeners(): void {
        // Search with debounce - REPLACE YOUR EXISTING SEARCH CODE WITH THIS
        let timeout: number;
        this.elements.searchInput?.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = window.setTimeout(() => {
                const query = (e.target as HTMLInputElement).value;
                if (query.length === 0) {
                    this.clearSearch(); // Restore original order when empty
                } else {
                    this.handleSearch();
                }
            }, this.DEBOUNCE_DELAY);
        });

        // Action buttons
        this.elements.archiveBtn?.addEventListener('click', () => this.archiveList());
        this.elements.clearBtn?.addEventListener('click', () => this.clearCompleted());
    }

    /**
     * Load all initial data
     */
    private async loadInitialData(): Promise<void> {
        await Promise.all([
            this.loadListData(),
            this.initializeSwipeableGrid()
        ]);
        
        // Removed initAddItemForm()
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
        
        // Update title (empty since we only show icon)
        if (this.elements.listTitle) {
            this.elements.listTitle.textContent = '';
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
                // TODO: Implement edit functionality
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
     * Handle search input - matching items appear at top-left of grid
     */
    private async handleSearch(): Promise<void> {
        const query = this.elements.searchInput?.value.trim().toLowerCase() || '';
        console.log('🔍 Searching for:', query);
        
        if (!this.swipeableGrid) {
            console.log('❌ No swipeable grid found');
            return;
        }
        
        if (query.length === 0) {
            await this.clearSearch();
            return;
        }
        
        try {
            const result = await this.catalogRepo.findAll();
            
            if (result.success && result.data) {
                // Split into matching and non-matching
                const matching: CatalogProduct[] = [];
                const nonMatching: CatalogProduct[] = [];
                
                result.data.forEach(product => {
                    if (product.name.toLowerCase().includes(query)) {
                        matching.push(product);
                    } else {
                        nonMatching.push(product);
                    }
                });
                
                // Sort matching items by name (optional)
                matching.sort((a, b) => a.name.localeCompare(b.name));
                
                // Sort non-matching items by name (optional)
                nonMatching.sort((a, b) => a.name.localeCompare(b.name));
                
                // Reorder: matching first (will appear in top-left of page 1), then non-matching
                const reordered = [...matching, ...nonMatching];
                
                console.log(`✅ ${matching.length} matching items will appear at top-left`);
                
                // Update grid with new order
                this.swipeableGrid.updateProducts(reordered);
                
                // Go to first page to show matches at top-left
                if (matching.length > 0) {
                    this.swipeableGrid.goToFirstPage();
                }
            }
        } catch (error) {
            console.error('❌ Error during search reorder:', error);
        }
    }

    /**
     * Clear search and restore original order
     */
    private async clearSearch(): Promise<void> {
        console.log('🧹 Clearing search'); // DEBUG
        
        if (!this.swipeableGrid) {
            console.log('❌ No swipeable grid found'); // DEBUG
            return;
        }
        
        try {
            const result = await this.catalogRepo.findAll();
            console.log('📦 Fetching original order:', result); // DEBUG
            
            if (result.success && result.data) {
                // Restore original order (by name)
                const sorted = [...result.data].sort((a, b) => 
                    a.name.localeCompare(b.name)
                );
                console.log('✅ Restored sorted order:', sorted.length); // DEBUG
                
                this.swipeableGrid.updateProducts(sorted);
                this.swipeableGrid.goToFirstPage();
            }
        } catch (error) {
            console.error('❌ Error clearing search:', error);
        }
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
            await this.service.addItem(this.currentListId, {
                name: productName,
                quantity: 1,
                unit: Unit.PIECE,
                category: 'Groceries'
            });
            
            this.showAddFeedback(productId);
            
        } catch (error) {
            console.error('❌ Error adding item:', error);
            alert(`Failed to add ${productName}. Please try again.`);
        }
    }

    /**
     * Show feedback when item is added
     */
    private showAddFeedback(productId: string): void {
        const buttons = document.querySelectorAll(`[data-product-id="${productId}"]`);
        buttons.forEach(btn => {
            const originalHTML = btn.innerHTML;
            (btn as any)._originalHTML = originalHTML;
            btn.innerHTML = '✅ Added!';
            
            setTimeout(() => {
                btn.innerHTML = (btn as any)._originalHTML || originalHTML;
            }, 1000);
        });
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
            // TODO: Handle post-archive (create new list, redirect, etc.)
        }
    }

    /**
     * Clear completed items
     */
    private async clearCompleted(): Promise<void> {
        if (!this.currentListId) return;
        
        const completedCount = this.currentList?.items.filter(i => i.status === 'completed').length || 0;
        
        if (completedCount === 0) {
            alert('No completed items to clear');
            return;
        }
        
        if (confirm(`Clear ${completedCount} completed item${completedCount > 1 ? 's' : ''}?`)) {
            await this.service.clearCompleted(this.currentListId);
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
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 10px;
            text-align: center;
        `;
        errorDiv.textContent = message;
        this.container.prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
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
        
        // Add this line to clean up the swipeable grid
        if (this.swipeableGrid) {
            this.swipeableGrid.destroy();
        }
        
        this.container.innerHTML = '';
    }
}