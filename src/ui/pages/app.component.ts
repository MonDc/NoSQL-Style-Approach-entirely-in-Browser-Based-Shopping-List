import { DatabaseService } from '../../db/database.service';
import { CatalogRepository } from '../../db/repositories/catalog.repository';

/**
 * Main application component
 */
async function initApp() {
    const app = document.getElementById('app');
    if (!app) return;
    
    // Show loading state
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
        
        // 2. Initialize product catalog (your 200 items)
        console.log('📋 Checking product catalog...');
        const catalogRepo = new CatalogRepository();
        await catalogRepo.initializeCatalog();
        console.log('✅ Catalog ready');
        
        // 3. Show the main UI
        app.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto;">
                <h1>🛒 Shopping List</h1>
                
                <!-- Quick add popular items -->
                <div style="margin: 20px 0;">
                    <h3>Popular Items</h3>
                    <div id="popular-items" style="display: flex; gap: 10px; flex-wrap: wrap;">
                        Loading...
                    </div>
                </div>
                
                <!-- Search catalog -->
                <div style="margin: 20px 0;">
                    <input 
                        type="text" 
                        id="search-input" 
                        placeholder="Search for items..." 
                        style="width: 100%; padding: 10px; font-size: 16px;"
                    />
                    <div id="search-results" style="margin-top: 10px;"></div>
                </div>
                
                <!-- My current list -->
                <div style="margin: 20px 0;">
                    <h3>My List</h3>
                    <div id="my-list">
                        <p>No items yet. Add some from above!</p>
                    </div>
                </div>
            </div>
        `;
        
        // 4. Load popular items
        await loadPopularItems();
        
        // 5. Setup search
        setupSearch();
        
    } catch (error) {
        console.error('❌ Failed to start app:', error);
        app.innerHTML = `
            <div style="color: red; text-align: center; padding: 40px;">
                <h1>❌ Error</h1>
                <p>Failed to load app. Check console for details.</p>
            </div>
        `;
    }
}

async function loadPopularItems() {
    const catalogRepo = new CatalogRepository();
    const popular = await catalogRepo.getPopularProducts();
    
    if (popular.success && popular.data) {
        const container = document.getElementById('popular-items');
        if (container) {
            container.innerHTML = popular.data.map(product => `
                <button 
                    class="popular-item" 
                    data-id="${product.id}"
                    style="padding: 8px 16px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 20px; cursor: pointer;"
                >
                    ${product.name}
                </button>
            `).join('');
            
            // Add click handlers
            container.querySelectorAll('.popular-item').forEach(btn => {
                btn.addEventListener('click', () => addToMyList(btn.getAttribute('data-id')!));
            });
        }
    }
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
                    <div style="padding: 8px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                        <span>${product.name} (${product.category})</span>
                        <button 
                            class="add-search-item" 
                            data-id="${product.id}"
                            style="background: #4CAF50; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer;"
                        >
                            Add
                        </button>
                    </div>
                `).join('');
                
                resultsDiv!.querySelectorAll('.add-search-item').forEach(btn => {
                    btn.addEventListener('click', () => addToMyList(btn.getAttribute('data-id')!));
                });
            }
        }, 300);
    });
}

async function addToMyList(productId: string) {
    console.log('Adding product:', productId);
    // We'll implement this next!
    alert('Add to list - will implement next!');
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);