import { CatalogProduct } from '../../../types/shopping-list.types';
import { GridDimensions, GridStyling } from './swipeable-grid.types';
import { ProductCardFactory } from './product-card.factory';

export interface PageFactoryConfig {
    dimensions: GridDimensions;
    styling: Required<GridStyling>;
    onProductClick: (product: CatalogProduct) => void;
}

export class PageFactory {
    public static createPage(
        products: CatalogProduct[],
        pageIndex: number,
        config: PageFactoryConfig
    ): HTMLElement {
        const { dimensions, styling, onProductClick } = config;
        const itemsPerPage = dimensions.rows * dimensions.columns;
        const startIdx = pageIndex * itemsPerPage;
        const pageProducts = products.slice(startIdx, startIdx + itemsPerPage);

        const page = document.createElement('div');
        this.applyPageStyles(page, dimensions);

        // Fill grid with products
        for (let i = 0; i < itemsPerPage; i++) {
            if (i < pageProducts.length) {
                const card = ProductCardFactory.createCard({
                    product: pageProducts[i],
                    styling,
                    callbacks: {
                        onClick: onProductClick
                    }
                });
                page.appendChild(card);
            } else {
                page.appendChild(this.createEmptyCell());
            }
        }

        return page;
    }

    private static applyPageStyles(page: HTMLElement, dimensions: GridDimensions): void {
        page.style.cssText = `
            flex: 0 0 100%;
            display: grid;
            grid-template-columns: repeat(${dimensions.columns}, 1fr);
            grid-template-rows: repeat(${dimensions.rows}, auto);
            gap: ${dimensions.gap || 16}px;
            padding: 8px 4px;
            box-sizing: border-box;
        `;
    }

    private static createEmptyCell(): HTMLElement {
        const empty = document.createElement('div');
        empty.style.visibility = 'hidden';
        empty.style.pointerEvents = 'none';
        return empty;
    }
}