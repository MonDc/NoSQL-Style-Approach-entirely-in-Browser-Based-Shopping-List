import { CatalogProduct, Unit, UUID } from '../types/shopping-list.types';

export const PRODUCT_CATALOG: CatalogProduct[] = [
    // Dairy
    {
        id: crypto.randomUUID() as UUID,
        name: "Milk",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Dairy",
        popular: true,
        tags: ["breakfast", "baking", "coffee"],
        commonNames: ["whole milk", "2% milk", "skim milk"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Eggs",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 12,
        category: "Dairy",
        popular: true,
        tags: ["breakfast", "baking", "protein"],
        commonNames: ["dozen eggs"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cheese",
        defaultUnit: Unit.GRAM,
        defaultQuantity: 200,
        category: "Dairy",
        popular: true,
        tags: ["snack", "lunch", "dinner"],
        commonNames: ["cheddar", "mozzarella", "parmesan"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Butter",
        defaultUnit: Unit.GRAM,
        defaultQuantity: 250,
        category: "Dairy",
        popular: true,
        tags: ["baking", "cooking"],
        commonNames: ["salted butter", "unsalted butter"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Yogurt",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Dairy",
        popular: true,
        tags: ["breakfast", "snack"],
        commonNames: ["greek yogurt", "plain yogurt"]
    },
    
    // Produce
    {
        id: crypto.randomUUID() as UUID,
        name: "Apples",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 6,
        category: "Produce",
        popular: true,
        tags: ["fruit", "snack"],
        commonNames: ["gala apples", "honeycrisp", "granny smith"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bananas",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 5,
        category: "Produce",
        popular: true,
        tags: ["fruit", "breakfast"],
        commonNames: ["banana"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Tomatoes",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "salad", "cooking"],
        commonNames: ["roma tomatoes", "cherry tomatoes"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Potatoes",
        defaultUnit: Unit.KILOGRAM,
        defaultQuantity: 2,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "cooking"],
        commonNames: ["russet potatoes", "red potatoes"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Onions",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 3,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "cooking"],
        commonNames: ["yellow onion", "red onion"]
    },
    
    // Meat & Seafood
    {
        id: crypto.randomUUID() as UUID,
        name: "Chicken Breast",
        defaultUnit: Unit.KILOGRAM,
        defaultQuantity: 1,
        category: "Meat",
        popular: true,
        tags: ["protein", "dinner", "grill"],
        commonNames: ["boneless chicken", "chicken fillet"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Ground Beef",
        defaultUnit: Unit.KILOGRAM,
        defaultQuantity: 0.5,
        category: "Meat",
        popular: true,
        tags: ["protein", "dinner", "burgers"],
        commonNames: ["minced beef", "hamburger meat"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Salmon",
        defaultUnit: Unit.GRAM,
        defaultQuantity: 400,
        category: "Seafood",
        popular: true,
        tags: ["fish", "protein", "dinner"],
        commonNames: ["fresh salmon", "salmon fillet"]
    },
    
    // Bakery
    {
        id: crypto.randomUUID() as UUID,
        name: "Bread",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Bakery",
        popular: true,
        tags: ["breakfast", "lunch", "sandwich"],
        commonNames: ["white bread", "whole wheat bread", "sourdough"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bagels",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 6,
        category: "Bakery",
        popular: false,
        tags: ["breakfast"],
        commonNames: ["plain bagels", "sesame bagels"]
    },
    
    // Beverages
    {
        id: crypto.randomUUID() as UUID,
        name: "Orange Juice",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: true,
        tags: ["breakfast", "drink"],
        commonNames: ["oj", "fresh juice"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Coffee",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Beverages",
        popular: true,
        tags: ["breakfast", "caffeine"],
        commonNames: ["coffee beans", "ground coffee"]
    },
    
    // Pantry
    {
        id: crypto.randomUUID() as UUID,
        name: "Rice",
        defaultUnit: Unit.KILOGRAM,
        defaultQuantity: 2,
        category: "Pantry",
        popular: true,
        tags: ["grain", "dinner", "side"],
        commonNames: ["white rice", "brown rice", "jasmine rice"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Pasta",
        defaultUnit: Unit.GRAM,
        defaultQuantity: 500,
        category: "Pantry",
        popular: true,
        tags: ["grain", "dinner"],
        commonNames: ["spaghetti", "penne", "macaroni"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Olive Oil",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["cooking", "oil", "salad"],
        commonNames: ["extra virgin olive oil"]
    },
    
    // Canned Goods
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Tuna",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["protein", "lunch", "quick"],
        commonNames: ["tuna fish", "canned fish"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Beans",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["protein", "soup", "chili"],
        commonNames: ["black beans", "kidney beans"]
    },
    
    // Snacks
    {
        id: crypto.randomUUID() as UUID,
        name: "Chips",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Snacks",
        popular: true,
        tags: ["snack", "party"],
        commonNames: ["potato chips", "tortilla chips"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Chocolate",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Snacks",
        popular: true,
        tags: ["sweet", "snack"],
        commonNames: ["dark chocolate", "milk chocolate"]
    },
    
    // Household
    {
        id: crypto.randomUUID() as UUID,
        name: "Paper Towels",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["cleaning", "kitchen"],
        commonNames: ["paper rolls"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Toilet Paper",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 12,
        category: "Household",
        popular: true,
        tags: ["bathroom", "essential"],
        commonNames: ["tp", "bathroom tissue"]
    },
    
    // Add more as needed - you can easily expand to 200 items!
];

// Helper to get products by category
export const getProductsByCategory = (category: string) => {
    return PRODUCT_CATALOG.filter(p => p.category === category);
};

// Helper to get popular products
export const getPopularProducts = () => {
    return PRODUCT_CATALOG.filter(p => p.popular);
};

// Helper to search products
export const searchProducts = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return PRODUCT_CATALOG.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.commonNames?.some(name => name.toLowerCase().includes(lowerQuery)) ||
        p.tags.some(tag => tag.includes(lowerQuery))
    );
};