import { CatalogProduct } from '../../../types/shopping-list.types';
import { SwipeableGridConfig, SwipeableGridCallbacks } from './swipeable-grid.types';

export class SwipeableGrid {
    private element: HTMLElement;
    private products: CatalogProduct[];
    private config: SwipeableGridConfig;
    private callbacks: SwipeableGridCallbacks;
    private currentPage: number = 0;
    private totalPages: number;
    private startX: number = 0;
    private isSwiping: boolean = false;
    private currentTranslate: number = 0;
    private track!: HTMLElement;
    private dotsContainer!: HTMLElement;

    constructor(
        products: CatalogProduct[],
        callbacks: SwipeableGridCallbacks,
        config: SwipeableGridConfig
    ) {
        this.products = products;
        this.callbacks = callbacks;
        this.config = {
            showDots: true,
            infinite: true,
            swipeThreshold: 50,
            ...config
        };
        this.totalPages = Math.ceil(products.length / this.config.itemsPerPage);
        this.element = this.render();
        this.attachEvents();
    }

    private render(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'swipeable-grid';
        wrapper.style.cssText = `
            width: 100%;
            position: relative;
            overflow: hidden;
            touch-action: pan-y pinch-zoom;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        `;

        // Container with overflow hidden
        const container = document.createElement('div');
        container.style.cssText = `
            width: 100%;
            overflow: hidden;
        `;

        // Track that moves horizontally
        this.track = document.createElement('div');
        this.track.style.cssText = `
            display: flex;
            transition: transform 0.3s ease-out;
            transform: translateX(0);
            will-change: transform;
        `;

        // Create pages (each page is a 2x2 grid)
        for (let i = 0; i < this.totalPages; i++) {
            const page = this.createPage(i);
            this.track.appendChild(page);
        }

        container.appendChild(this.track);
        wrapper.appendChild(container);

        // Dots indicator
        if (this.config.showDots) {
            this.dotsContainer = this.renderDots();
            wrapper.appendChild(this.dotsContainer);
        }

        return wrapper;
    }

    private createPage(pageIndex: number): HTMLElement {
        const page = document.createElement('div');
        page.style.cssText = `
            flex: 0 0 100%;
            display: grid;
            grid-template-columns: repeat(${this.config.columns}, 1fr);
            grid-template-rows: repeat(${this.config.rows}, auto);
            gap: 16px;
            padding: 8px 4px;
            box-sizing: border-box;
        `;

        const startIdx = pageIndex * this.config.itemsPerPage;
        const pageProducts = this.products.slice(startIdx, startIdx + this.config.itemsPerPage);

        // Fill grid with products
        for (let i = 0; i < this.config.itemsPerPage; i++) {
            if (i < pageProducts.length) {
                page.appendChild(this.createProductCard(pageProducts[i]));
            } else {
                // Empty cell for balance
                const empty = document.createElement('div');
                empty.style.visibility = 'hidden';
                page.appendChild(empty);
            }
        }

        return page;
    }

    private createProductCard(product: CatalogProduct): HTMLElement {
        const card = document.createElement('button');
        card.className = 'grid-product-card';
        card.setAttribute('data-product-id', product.id);
        card.setAttribute('data-product-name', product.name);
        card.style.cssText = `
            padding: 20px 12px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 16px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            width: 100%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            -webkit-tap-highlight-color: transparent;
        `;

        card.innerHTML = `
            <span style="font-size: 42px;">${this.getProductEmoji(product)}</span>
            <span style="font-weight: 600; font-size: 15px;">${product.name}</span>
            <span style="font-size: 12px; color: #666; background: #f5f5f5; padding: 4px 10px; border-radius: 20px;">
                ${product.category || ''}
            </span>
        `;

        // Touch feedback
        card.addEventListener('touchstart', () => {
            card.style.transform = 'scale(0.97)';
            card.style.background = '#f8f8f8';
        });

        card.addEventListener('touchend', () => {
            card.style.transform = 'scale(1)';
            card.style.background = 'white';
        });

        card.addEventListener('touchcancel', () => {
            card.style.transform = 'scale(1)';
            card.style.background = 'white';
        });

        return card;
    }

    private renderDots(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 20px;
            margin-bottom: 8px;
        `;

        for (let i = 0; i < this.totalPages; i++) {
            const dot = document.createElement('span');
            dot.style.cssText = `
                width: ${i === this.currentPage ? '10px' : '8px'};
                height: ${i === this.currentPage ? '10px' : '8px'};
                border-radius: 50%;
                background: ${i === this.currentPage ? '#4CAF50' : '#ccc'};
                transition: all 0.3s ease;
                cursor: pointer;
            `;
            dot.addEventListener('click', () => this.goToPage(i));
            container.appendChild(dot);
        }

        return container;
    }

    private attachEvents(): void {
        // Touch events
        this.track.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.track.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.track.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Click events for product cards
        this.element.querySelectorAll('.grid-product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const productId = target.getAttribute('data-product-id');
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    this.callbacks.onItemClick(product);
                }
            });
        });
    }

    private handleTouchStart(e: TouchEvent): void {
        this.startX = e.touches[0].clientX;
        this.isSwiping = true;
        this.track.style.transition = 'none';
    }

    private handleTouchMove(e: TouchEvent): void {
        if (!this.isSwiping) return;
        e.preventDefault();

        const currentX = e.touches[0].clientX;
        const diff = currentX - this.startX;

        // Add resistance at edges if not infinite
        if (!this.config.infinite) {
            if (this.currentPage === 0 && diff > 0) {
                this.currentTranslate = diff * 0.3;
            } else if (this.currentPage === this.totalPages - 1 && diff < 0) {
                this.currentTranslate = diff * 0.3;
            } else {
                this.currentTranslate = diff;
            }
        } else {
            this.currentTranslate = diff;
        }

        const baseTransform = -this.currentPage * 100;
        const newTransform = baseTransform + (this.currentTranslate / this.track.parentElement!.offsetWidth) * 100;
        this.track.style.transform = `translateX(${newTransform}%)`;
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (!this.isSwiping) return;

        const endX = e.changedTouches[0].clientX;
        const diff = endX - this.startX;
        const threshold = this.config.swipeThreshold || 50;

        this.track.style.transition = 'transform 0.3s ease-out';

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.goToPage(this.currentPage - 1);
            } else {
                this.goToPage(this.currentPage + 1);
            }
        } else {
            this.goToPage(this.currentPage);
        }

        this.isSwiping = false;
    }

    private goToPage(page: number): void {
        let newPage = page;

        if (this.config.infinite) {
            if (page < 0) {
                newPage = this.totalPages - 1;
            } else if (page >= this.totalPages) {
                newPage = 0;
            }
        } else {
            newPage = Math.max(0, Math.min(page, this.totalPages - 1));
        }

        if (newPage !== this.currentPage) {
            this.currentPage = newPage;
            this.updateDots();
            if (this.callbacks.onPageChange) {
                this.callbacks.onPageChange(newPage);
            }
        }

        this.track.style.transform = `translateX(-${this.currentPage * 100}%)`;
    }

    private updateDots(): void {
        if (!this.dotsContainer) return;

        const dots = this.dotsContainer.children;
        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i] as HTMLElement;
            dot.style.width = i === this.currentPage ? '10px' : '8px';
            dot.style.height = i === this.currentPage ? '10px' : '8px';
            dot.style.background = i === this.currentPage ? '#4CAF50' : '#ccc';
        }
    }

    private getProductEmoji(product: CatalogProduct): string {
        const emojiMap: Record<string, string> = {
            'Salmon': '🐟',
            'Onions': '🧅',
            'Eggs': '🥚',
            'Canned Tuna': '🥫',
            'Ground Beef': '🥩',
            'Chips': '🥨',
            'Milk': '🥛',
            'Coffee': '☕',
            'Bread': '🍞',
            'Cheese': '🧀',
            'Butter': '🧈',
            'Apples': '🍎',
            'Bananas': '🍌',
            'Tomatoes': '🍅',
            'Potatoes': '🥔',
            'Chicken': '🍗',
            'Rice': '🍚',
            'Pasta': '🍝'
        };
        return emojiMap[product.name] || '📦';
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public destroy(): void {
        this.element.remove();
    }
}