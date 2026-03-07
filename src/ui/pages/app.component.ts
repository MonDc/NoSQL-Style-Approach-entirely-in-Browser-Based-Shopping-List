/// <reference types="vite/client" />

import { ShoppingListComponent } from '../components/shopping-list.component';

/**
 * Main application entry point
 * Just initializes the shopping list component
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 Starting Shopping List App...');
        
        // Create and mount the shopping list component
        const shoppingList = new ShoppingListComponent('app');
        
        // For cleanup if needed (e.g., HMR)
        (window as any).__shoppingListApp = shoppingList;
        
    } catch (error) {
        console.error('❌ Failed to start app:', error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="color: red; text-align: center; padding: 40px;">
                    <h1>❌ Error</h1>
                    <p>Failed to start application. Please refresh the page.</p>
                </div>
            `;
        }
    }
});

// Cleanup on hot module replacement
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        if ((window as any).__shoppingListApp) {
            (window as any).__shoppingListApp.destroy();
        }
    });
}