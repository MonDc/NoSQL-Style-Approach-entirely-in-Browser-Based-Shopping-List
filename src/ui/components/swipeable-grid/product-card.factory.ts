import { CatalogProduct } from '../../../types/shopping-list.types';
import { ProductCardConfig } from './swipeable-grid.types';
import { GridStyling } from './swipeable-grid.types';  // Add this import

export class ProductCardFactory {
    private static readonly DEFAULT_EMOJI_MAP: Record<string, string> = {
        // Dairy
        'Milk': '🥛', 'Eggs': '🥚', 'Cheese': '🧀', 'Butter': '🧈', 'Yogurt': '🥄',
        
        // Produce
        'Apples': '🍎', 'Bananas': '🍌', 'Tomatoes': '🍅', 'Potatoes': '🥔',
        'Onions': '🧅', 'Lettuce': '🥬', 'Carrots': '🥕', 'Cucumber': '🥒',
        'Broccoli': '🥦', 'Garlic': '🧄', 'Peppers': '🫑', 'Corn': '🌽',
        
        // Meat
        'Chicken Breast': '🍗', 'Ground Beef': '🥩', 'Salmon': '🐟', 'Shrimp': '🦐',
        
        // Bakery
        'Bread': '🍞', 'Bagels': '🥯', 'Croissant': '🥐', 'Cookies': '🍪',
        
        // Beverages
        'Coffee': '☕', 'Orange Juice': '🧃', 'Soda': '🥤', 'Water': '💧',
        
        // Snacks
        'Chocolate': '🍫', 'Chips': '🥨', 'Candy': '🍬', 'Ice Cream': '🍦',
        
        // Canned
        'Canned Tuna': '🥫', 'Canned Beans': '🥫', 'Soup': '🍲',
        
        // Pantry
        'Rice': '🍚', 'Pasta': '🍝', 'Olive Oil': '🫒',
        
        // Default
        'default': '📦'
    };

    public static createCard(config: ProductCardConfig): HTMLElement {
        const { product, styling, callbacks } = config;
        const card = document.createElement('button');
        
        this.applyCardStyles(card, styling);
        this.setCardAttributes(card, product);
        this.setCardContent(card, product, styling);
        this.attachCardEvents(card, product, callbacks);
        
        return card;
    }

    private static applyCardStyles(card: HTMLElement, styling: Required<GridStyling>): void {
        card.style.cssText = `
            padding: ${styling.cardPadding};
            background: ${styling.cardBackground};
            border: ${styling.cardBorder};
            border-radius: ${styling.cardBorderRadius};
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            width: 100%;
            box-shadow: ${styling.cardShadow};
            -webkit-tap-highlight-color: transparent;
            user-select: none;
            font-family: inherit;
        `;
    }

    private static setCardAttributes(card: HTMLElement, product: CatalogProduct): void {
        card.className = 'grid-product-card';
        card.setAttribute('data-product-id', product.id);
        card.setAttribute('data-product-name', product.name);
    }

    private static setCardContent(
        card: HTMLElement, 
        product: CatalogProduct, 
        styling: Required<GridStyling>
    ): void {
        const emoji = this.getEmojiForProduct(product);
        
        card.innerHTML = `
            <span style="font-size: ${styling.emojiSize};">${emoji}</span>
            <span style="font-weight: 600; font-size: ${styling.nameFontSize};">${product.name}</span>
            <span style="
                font-size: ${styling.categoryFontSize}; 
                color: #666; 
                background: #f5f5f5; 
                padding: 4px 12px; 
                border-radius: 20px;
            ">
                ${product.category || ''}
            </span>
        `;
    }

    private static attachCardEvents(
        card: HTMLElement, 
        product: CatalogProduct, 
        callbacks: ProductCardConfig['callbacks']
    ): void {
        card.addEventListener('click', () => callbacks.onClick(product));
        
        card.addEventListener('touchstart', () => {
            card.style.transform = `scale(${0.96})`;
            card.style.background = '#f8f8f8';
            callbacks.onTouchStart?.();
        });

        card.addEventListener('touchend', () => {
            card.style.transform = 'scale(1)';
            card.style.background = 'white';
            callbacks.onTouchEnd?.();
        });

        card.addEventListener('touchcancel', () => {
            card.style.transform = 'scale(1)';
            card.style.background = 'white';
        });
    }

    private static getEmojiForProduct(product: CatalogProduct): string {
        return this.DEFAULT_EMOJI_MAP[product.name] || this.DEFAULT_EMOJI_MAP.default;
    }

    public static registerCustomEmoji(productName: string, emoji: string): void {
        this.DEFAULT_EMOJI_MAP[productName] = emoji;
    }
}