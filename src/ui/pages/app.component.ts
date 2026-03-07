import { DatabaseService } from '../../db/database.service';
import { CatalogRepository } from '../../db/repositories/catalog.repository';
import { ShoppingListRepository } from '../../db/repositories/shopping-list.repository'; // Add this
import { UUID } from '../../types/shopping-list.types';

// Global variables to track current list
let currentListId: UUID | null = null;
let shoppingListRepo: ShoppingListRepository;

async function initApp() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <h1>🛒 Shopping List App</h1>
            <p>Loading your shopping lists...</p>
            <div class="loader">⏳</div>
        </div>
    `;
    
    try {
        // 1. Initialize database
        console.log('📦 Starting database...');
        const dbService = DatabaseService.getInstance();
        await dbService.initialize();
        console.log('✅ Database ready');
        
        // 2. Initialize repositories
        shoppingListRepo = new ShoppingListRepository();
        const catalogRepo = new CatalogRepository();
        
        // 3. Initialize product catalog
        console.log('📋 Checking product catalog...');
        await catalogRepo.initializeCatalog();
        console.log('✅ Catalog ready');
        
        // 4. Create or get today's shopping list
        await getOrCreateTodaysList();
        
        // 5. Show the main UI
        await renderUI();
        
    } catch (error) {
        console.error('❌ Detailed error:', error);
        app.innerHTML = `
            <div style="color: red; text-align: center; padding: 40px;">
                <h1>❌ Error</h1>
                <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
        `;
    }
}

async function getOrCreateTodaysList() {
    // Find or create a list for today
    const lists = await shoppingListRepo.findByOwner('demo-user');
    
    if (lists.success && lists.data && lists.data.length > 0) {
        // Use the first list
        currentListId = lists.data[0].id;
        console.log('📋 Using existing list:', currentListId);
    } else {
        // Create a new list - WITHOUT createdAt/updatedAt (repository adds them)
        const newList = await shoppingListRepo.create({
            name: `Shopping List ${new Date().toLocaleDateString()}`,
            ownerId: 'demo-user',
            items: [],
            isArchived: false
            // REMOVED: createdAt, updatedAt - these are added by the repository
        });
        
        if (newList.success && newList.data) {
            currentListId = newList.data.id;
            console.log('🆕 Created new list:', currentListId);
        }
    }
}

async function renderUI() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="display: flex; align-items: center; gap: 10px;">
                🛒 Shopping List
                <span style="font-size: 14px; color: #666;">(Today)</span>
            </h1>
            
            <!-- Popular Items -->
            <div style="margin: 30px 0;">
                <h3 style="margin-bottom: 10px;">🔥 Popular Items</h3>
                <div id="popular-items" style="display: flex; gap: 10px; flex-wrap: wrap;">
                    Loading...
                </div>
            </div>
            
            <!-- Search -->
            <div style="margin: 30px 0;">
                <h3 style="margin-bottom: 10px;">🔍 Search Catalog</h3>
                <input 
                    type="text" 
                    id="search-input" 
                    placeholder="Type to search (e.g., 'milk', 'cheese', 'bread')..." 
                    style="width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px;"
                />
                <div id="search-results" style="margin-top: 10px;"></div>
            </div>
            
            <!-- My List -->
            <div style="margin: 30px 0;">
                <h3 style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>📝 My List</span>
                    <span id="item-count" style="background: #f0f0f0; padding: 2px 8px; border-radius: 12px;">0</span>
                </h3>
                <div id="my-list" style="background: #f9f9f9; border-radius: 8px; padding: 15px;">
                    <p style="color: #999; text-align: center;">No items yet. Add some from above!</p>
                </div>
            </div>
        </div>
    `;
    
    // Load popular items
    await loadPopularItems();
    
    // Load current list items
    await loadMyList();
    
    // Setup search
    setupSearch();
}

async function loadPopularItems() {
    const catalogRepo = new CatalogRepository();
    const popular = await catalogRepo.getPopularProducts();
    
    const container = document.getElementById('popular-items');
    if (!container) return;
    
    if (popular.success && popular.data) {
        container.innerHTML = popular.data.map(product => `
            <button 
                class="add-item-btn" 
                data-product-id="${product.id}"
                data-product-name="${product.name}"
                style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 14px;"
            >
                ➕ ${product.name}
            </button>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.add-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.getAttribute('data-product-id');
                const productName = btn.getAttribute('data-product-name');
                if (productId) addToMyList(productId, productName!);
            });
        });
    }
}

async function loadMyList() {
    if (!currentListId || !shoppingListRepo) return;
    
    const listResult = await shoppingListRepo.findById(currentListId);
    const container = document.getElementById('my-list');
    const countSpan = document.getElementById('item-count');
    
    if (!container) return;
    
    if (listResult.success && listResult.data) {
        const items = listResult.data.items;
        
        if (countSpan) {
            countSpan.textContent = items.length.toString();
        }
        
        if (items.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center;">No items yet. Add some from above!</p>';
        } else {
            container.innerHTML = items.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 18px;">${item.status === 'completed' ? '✅' : '🟢'}</span>
                        <span style="${item.status === 'completed' ? 'text-decoration: line-through; color: #999;' : ''}">
                            ${item.name}
                        </span>
                        <span style="color: #666; font-size: 14px;">
                            ${item.quantity} ${item.unit}
                        </span>
                    </div>
                    <button 
                        class="toggle-item" 
                        data-item-id="${item.id}"
                        style="background: none; border: 1px solid #ddd; border-radius: 4px; padding: 4px 8px; cursor: pointer;"
                    >
                        ${item.status === 'completed' ? 'Undo' : 'Done'}
                    </button>
                </div>
            `).join('');
            
            // Add toggle handlers
            container.querySelectorAll('.toggle-item').forEach(btn => {
                btn.addEventListener('click', () => toggleItem(btn.getAttribute('data-item-id')!));
            });
        }
    }
}

async function addToMyList(productId: string, productName: string) {
    if (!currentListId || !shoppingListRepo) {
        alert('No active shopping list!');
        return;
    }
    
    try {
        console.log(`➕ Adding ${productName} to list...`);
        
        // Create a shopping list item from the product
        const newItem = {
            id: crypto.randomUUID() as UUID,
            catalogProductId: productId as UUID,
            name: productName,
            quantity: 1,
            unit: 'piece' as any, // You'll want to get this from the catalog product
            priority: 'medium' as any,
            status: 'pending' as any,
            category: 'Groceries',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: []
        };
        
        // Add to list
        const result = await shoppingListRepo.addItemToList(currentListId, newItem);
        
        if (result.success) {
            console.log('✅ Item added successfully');
            // Refresh the list display
            await loadMyList();
        } else {
            alert('Failed to add item');
        }
    } catch (error) {
        console.error('❌ Error adding item:', error);
        alert('Error adding item');
    }
}

async function toggleItem(itemId: string) {
    if (!currentListId || !shoppingListRepo) return;
    
    await shoppingListRepo.toggleItemStatus(currentListId, itemId as UUID);
    await loadMyList(); // Refresh
}

function setupSearch() {
    const input = document.getElementById('search-input') as HTMLInputElement;
    const resultsDiv = document.getElementById('search-results');
    
    let timeout: NodeJS.Timeout;
    input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            const query = input.value.trim();
            if (query.length < 2) {
                resultsDiv!.innerHTML = '';
                return;
            }
            
            const catalogRepo = new CatalogRepository();
            const results = await catalogRepo.searchProducts(query);
            
            if (results.success && results.data) {
                resultsDiv!.innerHTML = results.data.map(product => `
                    <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${product.name}</strong>
                            <span style="color: #666; font-size: 12px; margin-left: 8px;">${product.category}</span>
                        </div>
                        <button 
                            class="add-search-item" 
                            data-product-id="${product.id}"
                            data-product-name="${product.name}"
                            style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;"
                        >
                            Add
                        </button>
                    </div>
                `).join('');
                
                resultsDiv!.querySelectorAll('.add-search-item').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const productId = btn.getAttribute('data-product-id');
                        const productName = btn.getAttribute('data-product-name');
                        if (productId) {
                            addToMyList(productId, productName!);
                            input.value = ''; // Clear search
                            resultsDiv!.innerHTML = ''; // Clear results
                        }
                    });
                });
            }
        }, 300);
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);