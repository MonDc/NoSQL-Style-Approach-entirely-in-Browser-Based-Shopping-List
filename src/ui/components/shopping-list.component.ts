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

    // Get the current list ID after it's created/loaded
    const listId = this.service.currentListId;
    console.log('📋 Current shopping list ID:', listId);
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
    const lists = await this.service.getUserLists('demo-user');
    console.log('📋 User lists:', lists); // ADD THIS
    
    if (lists.success && lists.data && lists.data.length > 0) {
        this.currentListId = lists.data[0].id;
        this.currentList = lists.data[0];
        // Tell the service about this list ID
        this.service.setCurrentList(this.currentListId); // ADD THIS
        console.log('📋 Using existing list:', this.currentListId);
    } else {
        const newList = await this.service.createList(
            `Shopping List ${new Date().toLocaleDateString()}`,
            'demo-user'
        );
        
        if (newList.success && newList.data) {
            this.currentListId = newList.data.id;
            this.currentList = newList.data;
            // createList should already set it, but just in case
            this.service.setCurrentList(this.currentListId); // ADD THIS
            console.log('🆕 Created new list:', this.currentListId);
        }
    }
}

    /**
 * Render the main layout structure - NO BOTTOM BUTTONS
 */
    private renderLayout(): void {
        this.container.innerHTML = `
            <div class="shopping-list-app" style="max-width: 600px; margin: 0 auto; padding: 20px;">
                ${this.renderSearchSection()}
                ${this.renderFeaturedSection()}
                ${this.renderListSection()}
                <!-- BOTTOM BUTTONS REMOVED - no Archive or Clear buttons -->
            </div>
        `;
    }

    // SVG background pattern (add this at the top of your component class or as a constant)
    private readonly SVG_PATTERN = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="135" height="135" viewBox="0 0 512 512">
    <image xlink:href="data:image/png;base64,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lHFZV6vheSRAAiRAAiTQHQIUAN2h151zzVQRuvHd7lTBc0mABEiABOJOoOv5UwB0nR3PJAESIAESIIHQEqAACG3TMXASIAESIIG4E+hO/hQA3aHHc0mABEiABEggpAQoAELacAybBEiABEgg7gS6lz8FQPf48WwSIAESIAESCCUBCoBQNhuDJgESIAESiDuB7uZPAdBdgjyfBEiABEiABEJIgAIghI3GkEmABEiABOJOoPv5UwB0nyFrIAESIAESIIHQEaAACF2TMWASIAESIIG4E3AifwoAJyiyDhIgARIgARIIGQEKgJA1GMMlARIgARKIOwFn8qcAcIYjayEBEiABEiCBUBGgAAhVczFYEiABEiCBuBNwKn8KAKdIsh4SIAESIAESCBEBCoAQNRZDJQESIAESiDsB5/KnAHCOJWsiARIgARIggdAQoAAITVMxUBIgARIggbgTcDJ/CgAnabIuEiABEiABEggJAQqAkDQUwyQBEiABEog7AWfzpwBwlidrIwESIAESIIFQEKAACEUzMUgSIAESIIG4E3A6fwoAp4myPhIgARIgARIIAQEKgBA0EkMkARIgARKIOwHn86cAcJ4payQBEiABEiCBwBOgAAh8EzFAEiABEiCBuBNwI38KADeosk4SIAESIAESCDgBCoCANxDDIwESIAESiDsBd/KnAHCHK2slARIgARIggUAToAAIdPMwOBIgARIggbgTcCt/CgC3yLJeEiABEiABEggwAQqAADcOQyMBEiABEog7AffypwBwjy1rJgESIAESIIHAEqAACGzTMDASIAESIIG4E3AzfwoAN+mybhIgARIgARIIKAEKgIA2DMMiARIgARKIOwF386cAcJcvaycBEiABEiCBQBKgAAhkszAoEiABEiCBuBNwO38KALcJB61+pdYKWkiMhwRIgARIwHsCFADeM/fXY6N+Bcncd0jWvYjyuslI1V2C1PiT5XFfJGsHAlr5GyC9kwAJkAAJAO4zoABwn3EQPawtH/Q7w9Ll0Po86OLf5fEJQH0qwmA+huVeF0Fwl1itiISz5PG3Ig62xOBsGbiQAAmQAAlEggAFQCSa0dEk+kBhkAiCIWIZEQnXyOODgJqJ9fsvRDL3vgiCf6C8/lp5rEIqd6Ss74DDJ/QFFxIgARIgAUcIeFEJBYAXlKPjw+4B+KkIggNgWWfK4zho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" x="0" y="0" width="512" height="512"/>
    </svg>
    `;

    /**
     * Render search section with SVG background
     */
    private renderSearchSection(): string {
        
        return `
            <div style="position: relative; margin-bottom: 24px;">
                <!-- SVG Background - half opacity behind search, full outside -->
                <div style="
                    position: absolute;
                    top: -40px;
                    left: -20px;
                    right: -20px;
                    bottom: -40px;
                    z-index: 0;
                    pointer-events: none;
                    opacity: 0.1;
                ">
                    <!-- Grandpa div - centers everything -->
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                        opacity: 0.5;
                    ">
                        <!-- Parent div - controls size - ADD THIS BACK -->
                        <div style="
                            width: 120px;
                            height: 120px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            ${this.SVG_PATTERN}
                        </div>
                    </div>
                </div>
                
                <!-- Search input (stays above SVG) -->
                <div style="position: relative; z-index: 1;">
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
                            background: rgba(255,255,255,0.9);
                            outline: none;
                            transition: all 0.3s ease;
                            backdrop-filter: blur(2px);
                            line-height: normal;
                            vertical-align: middle;
                        "
                        onfocus="this.placeholder=''; this.style.borderColor='#B0B0B0'; this.style.background='#FFFFFF'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.05)';"
                        onblur="this.placeholder='🔍'; this.style.borderColor='#e0e0e0'; this.style.background='rgba(255,255,255,0.9)'; this.style.boxShadow='none';"
                    />
                </div>
                <div class="search-results" style="position: relative; z-index: 1; margin-top: 12px;"></div>
            </div>
        `;
    }
    /**
     * Render featured items section - swipeable grid
     */
    private renderFeaturedSection(): string {
        return `
            <section style="margin-bottom: 24px;">
                <div class="category-products" style="min-height: 240px;"></div>
            </section>
        `;
    }

    /**
     * Render shopping list section - with swipeable items
     */
    /**
     * Render shopping list section - just the container
     */
    private renderListSection(): string {
        return `
            <section style="margin-bottom: 24px;">
                <div class="items-list" style="
                    background: #f9f9f9; 
                    border-radius: 16px; 
                    padding: 16px; 
                    min-height: 100px;
                "></div>
            </section>
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
            // Show ONLY the SVG logo, no text
            this.elements.itemsList.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 120px;
                    opacity: 0.2;
                ">
                    ${this.SVG_PATTERN}
                </div>
            `;
            return;
        }
        
        
        // Rest of the code to render actual items...

            
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
     * Handle search input - reorder grid items based on search
     */
    private async handleSearch(): Promise<void> {
        const query = this.elements.searchInput?.value.trim().toLowerCase() || '';
        console.log('🔍 Searching for:', query);
        
        if (!this.swipeableGrid) {
            console.log('❌ No swipeable grid found');
            return;
        }
        
        try {
            const result = await this.catalogRepo.findAll();
            
            if (result.success && result.data) {
                if (query.length === 0) {
                    // Restore original order when search is empty
                    const sorted = [...result.data].sort((a, b) => a.name.localeCompare(b.name));
                    this.swipeableGrid.updateProducts(sorted);
                    this.swipeableGrid.goToFirstPage();
                    return;
                }
                
                // Split into matching and non-matching
                const matching: CatalogProduct[] = [];
                const nonMatching: CatalogProduct[] = [];
                
                result.data.forEach(product => {
                    // Check if product name starts with the query (case insensitive)
                    if (product.name.toLowerCase().startsWith(query)) {
                        matching.push(product);
                    } 
                    // Also check if it contains the query (for partial matches)
                    else if (product.name.toLowerCase().includes(query)) {
                        matching.push(product); // Push contains matches after startsWith
                    }
                    else {
                        nonMatching.push(product);
                    }
                });
                
                // Sort matching items (startsWith first, then contains)
                matching.sort((a, b) => {
                    const aStarts = a.name.toLowerCase().startsWith(query);
                    const bStarts = b.name.toLowerCase().startsWith(query);
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;
                    return a.name.localeCompare(b.name);
                });
                
                // Sort non-matching items alphabetically
                nonMatching.sort((a, b) => a.name.localeCompare(b.name));
                
                // Reorder: matching first (prioritizing startsWith), then non-matching
                const reordered = [...matching, ...nonMatching];
                
                console.log(`✅ ${matching.length} matching items found`);
                
                // Update grid with new order
                this.swipeableGrid.updateProducts(reordered);
                this.swipeableGrid.goToFirstPage();
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
     * Add item from catalog to list with beautiful green flash animation
     */
    private async addCatalogItem(productId: string, productName: string): Promise<void> {
        if (!this.currentListId) {
            alert('No active shopping list');
            return;
        }
        
        // Find the clicked card element
        const card = document.querySelector(`[data-product-id="${productId}"]`) as HTMLElement;
        if (!card) return;
        
        // Store original card styles and content
        const originalHTML = card.innerHTML;
        const originalBackground = card.style.background;
        const originalBorder = card.style.border;
        const originalTransition = card.style.transition;
        const originalOpacity = card.style.opacity;
        
        // Disable ALL cards to prevent multiple clicks
        const allCards = document.querySelectorAll('.product-card, .add-category-item, .grid-product-card');
        allCards.forEach(c => {
            (c as HTMLElement).style.pointerEvents = 'none';
            (c as HTMLElement).style.opacity = '1';
        });
        
        try {
            // Clear card content and make it white
            card.innerHTML = '';
            card.style.background = 'white';
            card.style.opacity = '1';
            card.style.transition = 'all 0.3s ease';
            
            // Create and animate the green tick
            const tick = document.createElement('div');
            tick.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: tickPop 0.8s ease-out;
            `;
            
            const tickSpan = document.createElement('span');
            tickSpan.style.cssText = `
                color: #4CAF50;
                font-size: 120px;
                font-weight: bold;
                text-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                animation: tickScale 0.5s ease-out;
                line-height: 1;
            `;
            tickSpan.innerHTML = '✓';
            
            tick.appendChild(tickSpan);
            card.appendChild(tick);
            
            // Add keyframe animations to document if not present
            if (!document.getElementById('tick-animations')) {
                const style = document.createElement('style');
                style.id = 'tick-animations';
                style.innerHTML = `
                    @keyframes tickPop {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes tickScale {
                        0% { transform: scale(0); }
                        60% { transform: scale(1.3); }
                        100% { transform: scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Add the item to database
            await this.service.addItem(this.currentListId, {
                name: productName,
                quantity: 1,
                unit: Unit.PIECE,
                category: 'Groceries'
            });
            
            // Wait 2/3 second before restoring
            setTimeout(() => {
                // Restore original card content and styles
                card.innerHTML = originalHTML;
                card.style.background = originalBackground;
                card.style.border = originalBorder;
                card.style.transition = originalTransition;
                card.style.opacity = originalOpacity;
                
                // Re-enable all cards and restore their opacity
                allCards.forEach(c => {
                    (c as HTMLElement).style.pointerEvents = 'auto';
                    (c as HTMLElement).style.opacity = '1';
                });
                
            }, 666); // 2/3 of a second (666ms)
            
        } catch (error) {
            console.error('❌ Error adding item:', error);
            
            // Show error state
            card.innerHTML = '';
            card.style.background = '#fff1f0';
            card.style.opacity = '1';
            
            const errorTick = document.createElement('div');
            errorTick.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const xSpan = document.createElement('span');
            xSpan.style.cssText = `
                color: #ff4444;
                font-size: 120px;
                font-weight: bold;
                animation: tickPop 0.5s ease-out;
            `;
            xSpan.innerHTML = '✗';
            
            errorTick.appendChild(xSpan);
            card.appendChild(errorTick);
            
            // Restore after error
            setTimeout(() => {
                card.innerHTML = originalHTML;
                card.style.background = originalBackground;
                card.style.border = originalBorder;
                card.style.transition = originalTransition;
                card.style.opacity = originalOpacity;
                
                allCards.forEach(c => {
                    (c as HTMLElement).style.pointerEvents = 'auto';
                    (c as HTMLElement).style.opacity = '1';
                });
            }, 666);
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