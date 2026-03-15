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
import { generateStableUUID } from '../../utils/id-generator.util';
import { SwipeableLetterStrip } from './swipeable-letter-strip/swipeable-letter-strip.component';
import { ASSETS } from '../../config/assets.config';
import { BackgroundLogo } from './background-logo.component';

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
    private currentSearchLetter: string = '';
    
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
    private letterStrip: SwipeableLetterStrip | null = null;

    // Background logo instance
    private backgroundLogo: BackgroundLogo | null = null;

    // Initialize the component with container ID and service instance
    private initLetterStrip(): void {
    const container = document.getElementById('tomato-strip-container');
    if (container && !this.letterStrip) {
        this.letterStrip = new SwipeableLetterStrip('tomato-strip-container', {
            onLetterSelect: (letter) => {
                this.currentSearchLetter = letter.toLowerCase();
                this.handleSearch();
            }
        });
    }
}

    constructor(containerId: string, service: ShoppingListService) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = container;
        this.service = service;                 // 👈 use passed service
        this.catalogRepo = new CatalogRepository(); // catalog repo can stay separate
        this.initialize();
    }










    /**
     * Initialize the component
     */
    // private async initialize(): Promise<void> {
    //     try {
    //         await this.ensureDatabaseReady();
    //         await this.ensureListExists();

    // // Get the current list ID after it's created/loaded
    // const listId = this.service.currentListId;
    // console.log('📋 Current shopping list ID:', listId);
    //         this.renderLayout();
    //         this.cacheElements();
    //         this.setupEventListeners();
    //         await this.loadInitialData();
    //     } catch (error) {
    //         console.error('Failed to initialize shopping list component:', error);
    //         this.showError('Failed to load shopping list. Please refresh the page.');
    //     }
    // }

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

private async loadInitialData(): Promise<void> {
    try {
        await Promise.all([
            this.loadListData(),
            this.initializeSwipeableGrid()
        ]);
        
        this.subscribeToListUpdates();
        this.initLetterStrip();
        
        // Initialize background logo
        this.backgroundLogo = new BackgroundLogo('search-section-container', 0.04);
        
    } catch (error) {
        console.error('Failed to load initial data:', error);
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
    const stableId = generateStableUUID('demo-user:shared-shopping-list');
    
    // Try to get the stable list
    const listResult = await this.service.getList(stableId as UUID);
    
    if (listResult.success && listResult.data) {
        this.currentListId = stableId as UUID;
        this.currentList = listResult.data;
        this.service.setCurrentList(this.currentListId);
        console.log('📋 Using stable shared list:', this.currentListId);
    } else {
        // Create new list with stable ID
        const newList = await this.service.createList(
        'Shared Shopping List',
        'demo-user'
        );
        
        if (newList.success && newList.data) {
        this.currentListId = newList.data.id;
        this.currentList = newList.data;
        console.log('🆕 Created stable shared list:', this.currentListId);
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
    private readonly SVG_PATTERN = ASSETS.SHOPPING_CART_SVG;

    /**
     * Render search section with SVG background
     */
    private renderSearchSection(): string {
        return `
            <div id="search-section-container" style="position: relative; margin-bottom: 24px;">
                <!-- Background will be injected here via BackgroundLogo component -->
                
                <!-- Letter strip container -->
                <div id="tomato-strip-container" style="
                    width: 100%;
                    height: 80px;
                    margin: 0 0 15px 0;
                    position: relative;
                    z-index: 1;
                "></div>
                
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

    // Letter strip swipe logic
    const strip = this.container.querySelector('.letter-strip') as HTMLElement;
    const container = this.container.querySelector('.letter-strip-container') as HTMLElement;
    // const dotsContainer = this.container.querySelector('.letter-dots') as HTMLElement;
    
    if (strip && container) {

       
this.initLetterStrip();

        // Letter click handlers
        this.container.querySelectorAll('.letter-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.currentTarget as HTMLElement;
                const letter = button.getAttribute('data-letter') || '';
                
                // Update search input
                if (this.elements.searchInput) {
                    this.elements.searchInput.value = letter;
                    this.elements.searchInput.placeholder = '';
                    this.elements.searchInput.focus();
                }
                
                // Trigger search
                await this.handleSearch();
            });
        });

// Letter click handlers - now directly search without touching input
this.container.querySelectorAll('.letter-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const button = e.currentTarget as HTMLElement;
        const letter = button.getAttribute('data-letter') || '';
        
        // Store letter in a data attribute or state for search
        this.currentSearchLetter = letter; // Add this property to your class
        
        // Trigger search directly
        await this.handleSearch();
    });
});
    }
    }

    /**
     * Load all initial data
     */
// private async loadInitialData(): Promise<void> {
//     await Promise.all([
//         this.loadListData(),
//         this.initializeSwipeableGrid()
//     ]);
    
//     this.subscribeToListUpdates();
    
//     // Initialize canvas here - DOM is stable
//     setTimeout(() => this.initLetterStrip(), 100);
// }

// private initLetterStrip(): void {
//     const container = document.getElementById('tomato-strip-container');
//     if (container && !this.letterStrip) {
//         this.letterStrip = new SwipeableLetterStrip('tomato-strip-container', {
//             onLetterSelect: (letter) => {
//                 this.currentSearchLetter = letter.toLowerCase();
//                 this.handleSearch();
//             },
//             onPageChange: (page) => console.log('Letter strip page:', page)
//         });
//     }
// }




// private async loadInitialData(): Promise<void> {
//     await Promise.all([
//         this.loadListData(),
//         this.initializeSwipeableGrid()
//     ]);
    
//     this.subscribeToListUpdates();
//     this.initLetterStrip();
    
//     // Initialize background logo
//     this.backgroundLogo = new BackgroundLogo('search-section-container', 0.1);
// }


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
        console.log('🔄 updateListUI called', { currentList: this.currentList });
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
            },
            onUpdate: async (itemId: UUID, newName: string) => {
                if (!this.currentListId || !this.currentList) return;
                
                // Find and update the item
                const item = this.currentList.items.find(i => i.id === itemId);
                if (item) {
                    item.name = newName;
                    item.updatedAt = new Date();
                    
                    // Save to repository
                    await this.service.repository.update(this.currentListId, {
                        items: this.currentList.items
                    });
                }
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
        const query = this.currentSearchLetter || '';  // ← Use the letter state
        console.log('🔍 Searching for letter:', query);
        
        if (!this.swipeableGrid) {
            console.log('❌ No swipeable grid found');
            return;
        }
        
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
        console.log('🔔 Subscribing to list updates for', this.currentListId);
        this.unsubscribe = this.service.subscribeToList(this.currentListId, (updatedList) => {
            console.log('📢 List updated via subscription!', updatedList);
            try {
                this.currentList = updatedList;
                this.updateListUI();
            } catch (error) {
                console.error('❌ Error updating UI after subscription:', error);
            }
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

            if (this.backgroundLogo) {
        this.backgroundLogo.destroy();
    }
    if (this.letterStrip) {
        this.letterStrip.destroy();
    }

        if (this.letterStrip) {
            this.letterStrip.destroy();
        }
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