import { CatalogProduct } from '../../../types/shopping-list.types';
import { 
    SwipeableGridConfig, 
    SwipeableGridCallbacks, 
    SwipeableGridState, 
    GridStyling
} from './swipeable-grid.types';
import { PageFactory } from './page.factory';
import { DotsIndicator } from './dots-indicator.component';

export class SwipeableGrid {
    private element: HTMLElement;
    private products: CatalogProduct[];
    private config: Required<SwipeableGridConfig>;
    private callbacks: SwipeableGridCallbacks;
    private state: SwipeableGridState;
    private track!: HTMLElement;
    private dotsIndicator: DotsIndicator | null = null;

    private readonly DEFAULT_CONFIG: Required<SwipeableGridConfig> = {
        dimensions: {
            rows: 2,
            columns: 2,
            gap: 16
        },
        behavior: {
            infinite: true,
            swipeThreshold: 50,
            showDots: true,
            transitionDuration: 300
        },
        styling: {
            cardBackground: 'white',
            cardBorder: '1px solid #e0e0e0',
            cardShadow: '0 2px 8px rgba(0,0,0,0.05)',
            cardPadding: '20px 12px',
            cardBorderRadius: '16px',
            cardHoverScale: 1.02,
            cardTapScale: 0.96,
            emojiSize: '42px',
            nameFontSize: '15px',
            categoryFontSize: '12px'
        }
    };

    constructor(
        products: CatalogProduct[],
        callbacks: SwipeableGridCallbacks,
        userConfig: SwipeableGridConfig
    ) {
        this.products = products;
        this.callbacks = callbacks;
        this.config = this.mergeConfig(userConfig);
        
        const itemsPerPage = this.config.dimensions.rows * this.config.dimensions.columns;
        this.state = {
            currentPage: 0,
            totalPages: Math.ceil(products.length / itemsPerPage),
            isSwiping: false,
            startX: 0,
            currentTranslate: 0
        };

        this.element = this.render();
        this.attachEvents();
    }

    private mergeConfig(userConfig: SwipeableGridConfig): Required<SwipeableGridConfig> {
        return {
            dimensions: { ...this.DEFAULT_CONFIG.dimensions, ...userConfig.dimensions },
            behavior: { ...this.DEFAULT_CONFIG.behavior, ...userConfig.behavior },
            styling: { ...this.DEFAULT_CONFIG.styling, ...userConfig.styling }
        };
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

        wrapper.appendChild(this.createTrack());
        
        if (this.config.behavior.showDots) {
            wrapper.appendChild(this.createDotsIndicator());
        }

        return wrapper;
    }

private createTrack(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
        width: 100%;
        overflow: hidden;
    `;

    this.track = document.createElement('div');
    this.track.style.cssText = `
        display: flex;
        transition: transform ${this.config.behavior.transitionDuration}ms ease-out;
        transform: translateX(0);
        will-change: transform;
    `;

    // Create complete styling object with all required properties
    const completeStyling: Required<GridStyling> = {
        cardBackground: this.config.styling.cardBackground || '#ffffff',
        cardBorder: this.config.styling.cardBorder || '1px solid #e0e0e0',
        cardShadow: this.config.styling.cardShadow || '0 2px 8px rgba(0,0,0,0.05)',
        cardPadding: this.config.styling.cardPadding || '20px 12px',
        cardBorderRadius: this.config.styling.cardBorderRadius || '16px',
        cardHoverScale: this.config.styling.cardHoverScale || 1.02,
        cardTapScale: this.config.styling.cardTapScale || 0.96,
        emojiSize: this.config.styling.emojiSize || '42px',
        nameFontSize: this.config.styling.nameFontSize || '15px',
        categoryFontSize: this.config.styling.categoryFontSize || '12px',
        dotActiveColor: this.config.styling.dotActiveColor || '#4CAF50',
        dotInactiveColor: this.config.styling.dotInactiveColor || '#ccc'
    };

    // Create all pages
    for (let i = 0; i < this.state.totalPages; i++) {
        const page = PageFactory.createPage(
            this.products,
            i,
            {
                dimensions: this.config.dimensions,
                styling: completeStyling,  // Now using complete styling
                onProductClick: (product) => this.callbacks.onItemClick(product)
            }
        );
        this.track.appendChild(page);
    }

    container.appendChild(this.track);
    return container;
}
    private createDotsIndicator(): HTMLElement {
        this.dotsIndicator = new DotsIndicator({
            totalPages: this.state.totalPages,
            currentPage: this.state.currentPage,
            onDotClick: (page) => this.goToPage(page)
        });
        
        return this.dotsIndicator.getElement();
    }

    private attachEvents(): void {
        // Touch events
        this.track.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.track.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.track.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Prevent default drag behavior
        this.track.addEventListener('dragstart', (e) => e.preventDefault());
    }

    private handleTouchStart(e: TouchEvent): void {
        this.state.startX = e.touches[0].clientX;
        this.state.isSwiping = true;
        this.track.style.transition = 'none';
        this.callbacks.onSwipeStart?.();
    }

    private handleTouchMove(e: TouchEvent): void {
        if (!this.state.isSwiping) return;
        e.preventDefault();

        const currentX = e.touches[0].clientX;
        const diff = currentX - this.state.startX;

        // Apply resistance at edges if not infinite
        if (!this.config.behavior.infinite) {
            if (this.state.currentPage === 0 && diff > 0) {
                this.state.currentTranslate = diff * 0.3;
            } else if (this.state.currentPage === this.state.totalPages - 1 && diff < 0) {
                this.state.currentTranslate = diff * 0.3;
            } else {
                this.state.currentTranslate = diff;
            }
        } else {
            this.state.currentTranslate = diff;
        }

        this.updateTrackPosition();
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (!this.state.isSwiping) return;

        const endX = e.changedTouches[0].clientX;
        const diff = endX - this.state.startX;
        const threshold = this.config.behavior.swipeThreshold;

        this.track.style.transition = `transform ${this.config.behavior.transitionDuration}ms ease-out`;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.goToPage(this.state.currentPage - 1);
            } else {
                this.goToPage(this.state.currentPage + 1);
            }
        } else {
            this.goToPage(this.state.currentPage);
        }

        this.state.isSwiping = false;
        this.callbacks.onSwipeEnd?.();
    }

    private updateTrackPosition(): void {
        const containerWidth = this.track.parentElement!.offsetWidth;
        const baseTransform = -this.state.currentPage * 100;
        const newTransform = baseTransform + (this.state.currentTranslate / containerWidth) * 100;
        this.track.style.transform = `translateX(${newTransform}%)`;
    }

/**
 * Update the grid with new product order
 */
public updateProducts(newProducts: CatalogProduct[]): void {
    this.products = newProducts;
    const itemsPerPage = this.config.dimensions.rows * this.config.dimensions.columns;
    this.state.totalPages = Math.ceil(newProducts.length / itemsPerPage);
    this.state.currentPage = 0;
    
    // Store the parent container
    const parentContainer = this.track.parentElement;
    
    if (!parentContainer) return;
    
    // Create new track
    const newTrack = document.createElement('div');
    newTrack.style.cssText = this.track.style.cssText;
    
    // Create all pages for the new track
    for (let i = 0; i < this.state.totalPages; i++) {
        const page = PageFactory.createPage(
            this.products,
            i,
            {
                dimensions: this.config.dimensions,
                styling: this.getCompleteStyling(),
                onProductClick: (product) => this.callbacks.onItemClick(product)
            }
        );
        newTrack.appendChild(page);
    }
    
    // Replace old track with new one
    parentContainer.replaceChild(newTrack, this.track);
    this.track = newTrack;
    
    // Re-attach touch events to new track
    this.attachTrackEvents();
    
    // Update dots
    if (this.dotsIndicator) {
        this.dotsIndicator.setActivePage(0);
    }
}

/**
 * Get complete styling object with defaults
 */
private getCompleteStyling(): Required<GridStyling> {
    return {
        cardBackground: this.config.styling.cardBackground || '#ffffff',
        cardBorder: this.config.styling.cardBorder || '1px solid #e0e0e0',
        cardShadow: this.config.styling.cardShadow || '0 2px 8px rgba(0,0,0,0.05)',
        cardPadding: this.config.styling.cardPadding || '20px 12px',
        cardBorderRadius: this.config.styling.cardBorderRadius || '16px',
        cardHoverScale: this.config.styling.cardHoverScale || 1.02,
        cardTapScale: this.config.styling.cardTapScale || 0.96,
        emojiSize: this.config.styling.emojiSize || '42px',
        nameFontSize: this.config.styling.nameFontSize || '15px',
        categoryFontSize: this.config.styling.categoryFontSize || '12px',
        dotActiveColor: this.config.styling.dotActiveColor || '#4CAF50',
        dotInactiveColor: this.config.styling.dotInactiveColor || '#ccc'
    };
}

/**
 * Attach touch events to track
 */
private attachTrackEvents(): void {
    this.track.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.track.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.track.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.track.addEventListener('dragstart', (e) => e.preventDefault());
}

    private goToPage(page: number): void {
        let newPage = page;

        if (this.config.behavior.infinite) {
            if (page < 0) {
                newPage = this.state.totalPages - 1;
            } else if (page >= this.state.totalPages) {
                newPage = 0;
            }
        } else {
            newPage = Math.max(0, Math.min(page, this.state.totalPages - 1));
        }

        if (newPage !== this.state.currentPage) {
            this.state.currentPage = newPage;
            this.dotsIndicator?.setActivePage(newPage);
            this.callbacks.onPageChange?.(newPage);
        }

        this.track.style.transform = `translateX(-${this.state.currentPage * 100}%)`;
    }

    public goToFirstPage(): void {
        this.goToPage(0);
    }

    public goToLastPage(): void {
        this.goToPage(this.state.totalPages - 1);
    }

    public getCurrentPage(): number {
        return this.state.currentPage;
    }

    public getTotalPages(): number {
        return this.state.totalPages;
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public destroy(): void {
        this.element.remove();
    }
}