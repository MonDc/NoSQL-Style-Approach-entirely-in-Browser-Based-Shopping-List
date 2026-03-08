import { CatalogProduct } from '../../../types/shopping-list.types';
import { ProductCardConfig } from './swipeable-grid.types';
import { GridStyling } from './swipeable-grid.types';  // Add this import

export class ProductCardFactory {
    private static readonly DEFAULT_EMOJI_MAP: Record<string, string> = {
        // Dairy
        'Milk': '🥛',
        'Eggs': '🥚',
        'Cheese': '🧀',
        'Butter': '🧈',
        'Yogurt': '🥄',
        'Cottage Cheese': '🥣',
        'Sour Cream': '🥛',
        'Cream Cheese': '🧀',
        'Half and Half': '🥛',
        'Whipped Cream': '🍦',

        // Produce - Fruits
        'Apples': '🍎',
        'Bananas': '🍌',
        'Tomatoes': '🍅',
        'Potatoes': '🥔',
        'Onions': '🧅',
        'Watermelon': '🍉',
        'Cantaloupe': '🍈',
        'Honeydew': '🍈',
        'Pineapple': '🍍',
        'Mango': '🥭',
        'Papaya': '🥭',
        'Kiwi': '🥝',
        'Grapes': '🍇',
        'Cherries': '🍒',
        'Peaches': '🍑',
        'Plums': '🍑',
        'Nectarines': '🍑',
        'Apricots': '🍑',
        'Lemons': '🍋',
        'Limes': '🍋',
        'Grapefruit': '🍊',
        'Avocados': '🥑',

        // Produce - Vegetables
        'Broccoli': '🥦',
        'Cauliflower': '🥦',
        'Brussels Sprouts': '🥬',
        'Asparagus': '🥬',
        'Green Beans': '🫘',
        'Peas': '🫛',
        'Corn on the Cob': '🌽',
        'Celery': '🥬',
        'Radishes': '🥬',
        'Zucchini': '🥒',
        'Eggplant': '🍆',
        'Butternut Squash': '🎃',
        'Acorn Squash': '🎃',
        'Pumpkin': '🎃',

        // Meat
        'Chicken Breast': '🍗',
        'Ground Beef': '🥩',
        'Turkey Breast': '🦃',
        'Turkey Slices': '🦃',
        'Ham Slices': '🍖',
        'Roast Beef': '🥩',
        'Salami': '🍖',
        'Pepperoni': '🍕',
        'Prosciutto': '🍖',
        'Bacon': '🥓',
        'Sausage Links': '🌭',
        'Italian Sausage': '🌭',
        'Bratwurst': '🌭',
        'Hot Dogs': '🌭',

        // Seafood
        'Salmon': '🐟',
        'Shrimp': '🦐',
        'Scallops': '🐚',
        'Lobster Tails': '🦞',
        'Crab Legs': '🦀',
        'Clams': '🦪',
        'Mussels': '🦪',
        'Oysters': '🦪',
        'Calamari': '🦑',

        // Bakery
        'Bread': '🍞',
        'Bagels': '🥯',
        'Baguette': '🥖',
        'Ciabatta': '🥖',
        'Focaccia': '🥖',
        'Pita Bread': '🫓',
        'Naan': '🫓',
        'Tortillas': '🫓',
        'Corn Tortillas': '🫓',
        'Croissants': '🥐',
        'Danish': '🥐',
        'Muffins': '🧁',
        'Scones': '🥧',
        'Biscuits': '🥧',

        // Beverages
        'Coffee': '☕',
        'Orange Juice': '🍊',
        'Apple Juice': '🍎',
        'Cranberry Juice': '🍒',
        'Grape Juice': '🍇',
        'Pineapple Juice': '🍍',
        'Tomato Juice': '🍅',
        'Lemonade': '🍋',
        'Iced Tea': '🧋',
        'Sweet Tea': '🧋',
        'Sparkling Water': '💧',
        'Tonic Water': '💧',
        'Ginger Ale': '🥤',
        'Club Soda': '🥤',
        'Energy Drink': '⚡',
        'Sports Drink': '🏃',
        'Coconut Water': '🥥',

        // Snacks
        'Potato Chips': '🥨',
        'Tortilla Chips': '🥨',
        'Pita Chips': '🥨',
        'Pretzels': '🥨',
        'Cheese Puffs': '🧀',
        'Popcorn': '🍿',
        'Crackers': '🍘',
        'Candy': '🍬',
        'Chocolate': '🍫',
        'M and Ms': '🍫',
        'Ice Cream': '🍦',

        // Canned Goods
        'Canned Tuna': '🥫',
        'Canned Salmon': '🥫',
        'Canned Chicken': '🥫',
        'Canned Beans': '🥫',
        'Canned Corn': '🥫',
        'Canned Peas': '🥫',
        'Canned Green Beans': '🥫',
        'Canned Carrots': '🥫',
        'Canned Mushrooms': '🥫',
        'Canned Tomatoes': '🥫',
        'Tomato Paste': '🥫',
        'Tomato Sauce': '🥫',
        'Crushed Tomatoes': '🥫',
        'Canned Chili': '🥫',
        'Canned Stew': '🥫',
        'Canned Pasta': '🥫',
        'Spam': '🥫',
        'Canned Ham': '🥫',

        // Pantry - Grains & Beans
        'Rice': '🍚',
        'Pasta': '🍝',
        'Black Beans': '🫘',
        'Kidney Beans': '🫘',
        'Pinto Beans': '🫘',
        'Chickpeas': '🫘',
        'Lentils': '🫘',
        'Split Peas': '🫛',
        'Quinoa': '🌾',
        'Couscous': '🌾',
        'Barley': '🌾',
        'Oats': '🌾',
        'Cornmeal': '🌽',
        'Flour': '🌾',
        'Whole Wheat Flour': '🌾',
        'Bread Flour': '🌾',
        'Sugar': '🧂',
        'Brown Sugar': '🧂',
        'Powdered Sugar': '🧂',
        'Honey': '🍯',
        'Maple Syrup': '🍁',
        'Corn Syrup': '🌽',
        'Molasses': '🍯',

        // Condiments & Spices
        'Ketchup': '🍅',
        'Mustard': '🟡',
        'Dijon Mustard': '🟡',
        'Mayonnaise': '🥚',
        'Miracle Whip': '🥚',
        'BBQ Sauce': '🍖',
        'Hot Sauce': '🌶️',
        'Sriracha': '🌶️',
        'Soy Sauce': '🥢',
        'Teriyaki Sauce': '🥢',
        'Worcestershire Sauce': '🧂',
        'Fish Sauce': '🐟',
        'Oyster Sauce': '🦪',
        'Vinegar': '🧂',
        'Apple Cider Vinegar': '🍎',
        'Balsamic Vinegar': '🧂',
        'Red Wine Vinegar': '🍷',
        'Rice Vinegar': '🍚',
        'Olive Oil': '🫒',
        'Vegetable Oil': '🌻',
        'Canola Oil': '🌻',
        'Coconut Oil': '🥥',
        'Sesame Oil': '🌰',
        'Salt': '🧂',
        'Sea Salt': '🧂',
        'Kosher Salt': '🧂',
        'Black Pepper': '⚫',
        'White Pepper': '⚪',
        'Garlic Powder': '🧄',
        'Onion Powder': '🧅',
        'Paprika': '🌶️',
        'Cumin': '🌰',
        'Chili Powder': '🌶️',
        'Cayenne Pepper': '🌶️',
        'Red Pepper Flakes': '🌶️',
        'Oregano': '🌿',
        'Basil': '🌿',
        'Thyme': '🌿',
        'Rosemary': '🌿',
        'Sage': '🌿',
        'Bay Leaves': '🌿',
        'Cinnamon': '🟫',
        'Nutmeg': '🟫',
        'Cloves': '🟫',
        'Ginger': '🫚',
        'Allspice': '🟫',
        'Vanilla Extract': '🍦',
        'Almond Extract': '🌰',

        // Household
        'Dish Soap': '🧼',
        'Dishwasher Detergent': '🧼',
        'Laundry Detergent': '🧼',
        'Fabric Softener': '🧴',
        'Bleach': '🧴',
        'All-Purpose Cleaner': '🧹',
        'Glass Cleaner': '🪟',
        'Bathroom Cleaner': '🧽',
        'Trash Bags': '🗑️',
        'Recycling Bags': '♻️',
        'Ziploc Bags': '🛍️',
        'Freezer Bags': '❄️',
        'Plastic Wrap': '🛍️',
        'Aluminum Foil': '🥘',
        'Parchment Paper': '📜',
        'Wax Paper': '📜',
        'Paper Towels': '🧻',
        'Napkins': '🧻',
        'Paper Plates': '🍽️',
        'Plastic Cups': '🥤',
        'Plastic Utensils': '🍴',
        'Straws': '🥤',
        'Batteries': '🔋',
        'Light Bulbs': '💡',

        // Personal Care
        'Shampoo': '🧴',
        'Conditioner': '🧴',
        'Body Wash': '🧴',
        'Bar Soap': '🧼',
        'Deodorant': '🧴',
        'Toothpaste': '🪥',
        'Toothbrush': '🪥',
        'Mouthwash': '🪥',
        'Floss': '🪥',
        'Razor': '🪒',
        'Shaving Cream': '🧴',
        'Lotion': '🧴',
        'Sunscreen': '☀️',
        'Lip Balm': '👄',
        'Tissues': '🧻',
        'Cotton Balls': '🧶',
        'Cotton Swabs': '🪡',
        'Feminine Products': '♀️',
        'First Aid Kit': '🩹',
        'Bandages': '🩹',
        'Pain Reliever': '💊',
        'Allergy Medicine': '💊',
        'Cold Medicine': '💊',

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