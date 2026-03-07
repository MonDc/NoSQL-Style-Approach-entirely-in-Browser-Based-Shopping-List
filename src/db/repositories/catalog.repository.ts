import { BaseRepository } from './base.repository';
import { CatalogProduct, UUID, OperationResult } from '../../types/shopping-list.types';
import { ShoppingListDBSchema } from '../../types/shopping-list.types';
import { PRODUCT_CATALOG } from '../../data/product-catalog';

export class CatalogRepository extends BaseRepository<CatalogProduct, ShoppingListDBSchema> {
    protected storeName = 'productCatalog' as const;

    /**
     * Initialize catalog with default products
     */
    public async initializeCatalog(): Promise<void> {
        const db = await this.getDb();
        const count = await db.count(this.storeName);
        
        if (count === 0) {
            console.log('📦 Initializing product catalog with', PRODUCT_CATALOG.length, 'items');
            
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            
            for (const product of PRODUCT_CATALOG) {
                await store.add(product);
            }
            
            await tx.done;
            console.log('✅ Product catalog initialized');
        }
    }

    /**
     * Search products by name or tags
     */
    public async searchProducts(query: string): Promise<OperationResult<CatalogProduct[]>> {
        try {
            const all = await this.findAll();
            if (!all.success || !all.data) {
                return { success: true, data: [] };
            }

            const lowerQuery = query.toLowerCase();
            const results = all.data.filter(p => 
                p.name.toLowerCase().includes(lowerQuery) ||
                p.commonNames?.some(name => name.toLowerCase().includes(lowerQuery)) ||
                p.tags.some(tag => tag.includes(lowerQuery))
            );

            return {
                success: true,
                data: results
            };
        } catch (error) {
            return this.handleError(error, 'Failed to search products');
        }
    }

    /**
     * Get products by category
     */
    public async getByCategory(category: string): Promise<OperationResult<CatalogProduct[]>> {
        try {
            const db = await this.getDb();
            const index = db.transaction(this.storeName).store.index('by-category');
            const products = await index.getAll(category);

            return {
                success: true,
                data: products
            };
        } catch (error) {
            return this.handleError(error, `Failed to get products for category ${category}`);
        }
    }

    /**
     * Get popular products
     */
    public async getPopularProducts(): Promise<OperationResult<CatalogProduct[]>> {
        try {
            const db = await this.getDb();
            
            // Check if the index exists first
            const store = db.transaction(this.storeName).store;
            
            if (!store.indexNames.contains('by-popular')) {
                console.warn('⚠️ by-popular index not found, returning all products');
                // Fallback: return all products and filter manually
                const all = await this.findAll();
                if (all.success && all.data) {
                    const popular = all.data.filter(p => p.popular === true);
                    return {
                        success: true,
                        data: popular
                    };
                }
                return all;
            }
            
            // For boolean indexes, we need to pass the boolean value
            // TypeScript expects IDBKeyRange or IDBValidKey, but boolean works at runtime
            const index = store.index('by-popular');
            const products = await index.getAll(IDBKeyRange.only(true));

            return {
                success: true,
                data: products
            };
        } catch (error) {
            console.error('Error in getPopularProducts:', error);
            return this.handleError(error, 'Failed to get popular products');
        }
    }
}