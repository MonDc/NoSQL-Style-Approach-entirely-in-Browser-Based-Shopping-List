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
    // Dairy
    {
        id: crypto.randomUUID() as UUID,
        name: "Cottage Cheese",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Dairy",
        popular: false,
        tags: ["cheese", "protein", "breakfast"],
        commonNames: ["cottage cheese"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sour Cream",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Dairy",
        popular: true,
        tags: ["dip", "topping", "mexican"],
        commonNames: ["sour cream"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cream Cheese",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Dairy",
        popular: true,
        tags: ["spread", "bagel", "baking"],
        commonNames: ["cream cheese"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Half and Half",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Dairy",
        popular: true,
        tags: ["coffee", "cream"],
        commonNames: ["half and half"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Whipped Cream",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Dairy",
        popular: false,
        tags: ["dessert", "topping"],
        commonNames: ["whipped cream"]
    },
    
    // Produce - Fruits
    {
        id: crypto.randomUUID() as UUID,
        name: "Watermelon",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["fruit", "summer", "fresh"],
        commonNames: ["watermelon"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cantaloupe",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["fruit", "melon", "breakfast"],
        commonNames: ["cantaloupe", "rockmelon"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Honeydew",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: false,
        tags: ["fruit", "melon"],
        commonNames: ["honeydew"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Pineapple",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["fruit", "tropical", "fresh"],
        commonNames: ["pineapple"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Mango",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Produce",
        popular: true,
        tags: ["fruit", "tropical", "fresh"],
        commonNames: ["mango"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Papaya",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: false,
        tags: ["fruit", "tropical"],
        commonNames: ["papaya"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Kiwi",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Produce",
        popular: true,
        tags: ["fruit", "fresh"],
        commonNames: ["kiwi"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Grapes",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["fruit", "snack"],
        commonNames: ["grapes", "red grapes", "green grapes"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cherries",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["fruit", "summer"],
        commonNames: ["cherries"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Peaches",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Produce",
        popular: true,
        tags: ["fruit", "summer"],
        commonNames: ["peaches"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Plums",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Produce",
        popular: false,
        tags: ["fruit"],
        commonNames: ["plums"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Nectarines",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Produce",
        popular: false,
        tags: ["fruit"],
        commonNames: ["nectarines"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Apricots",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 6,
        category: "Produce",
        popular: false,
        tags: ["fruit"],
        commonNames: ["apricots"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Lemons",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 3,
        category: "Produce",
        popular: true,
        tags: ["citrus", "cooking"],
        commonNames: ["lemons"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Limes",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 3,
        category: "Produce",
        popular: true,
        tags: ["citrus", "cooking", "mexican"],
        commonNames: ["limes"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Grapefruit",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Produce",
        popular: false,
        tags: ["citrus", "breakfast"],
        commonNames: ["grapefruit"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Avocados",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 3,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "healthy", "mexican"],
        commonNames: ["avocados", "avocado"]
    },
    
    // Produce - Vegetables
    {
        id: crypto.randomUUID() as UUID,
        name: "Broccoli",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "healthy"],
        commonNames: ["broccoli"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cauliflower",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "healthy"],
        commonNames: ["cauliflower"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Brussels Sprouts",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: false,
        tags: ["vegetable", "healthy"],
        commonNames: ["brussels sprouts"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Asparagus",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "healthy"],
        commonNames: ["asparagus"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Green Beans",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "healthy"],
        commonNames: ["green beans"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Peas",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: false,
        tags: ["vegetable"],
        commonNames: ["peas"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Corn on the Cob",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "summer"],
        commonNames: ["corn"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Celery",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "snack"],
        commonNames: ["celery"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Radishes",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: false,
        tags: ["vegetable"],
        commonNames: ["radishes"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Zucchini",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 3,
        category: "Produce",
        popular: true,
        tags: ["vegetable", "cooking"],
        commonNames: ["zucchini"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Eggplant",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Produce",
        popular: false,
        tags: ["vegetable", "cooking"],
        commonNames: ["eggplant"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Butternut Squash",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: false,
        tags: ["vegetable", "winter"],
        commonNames: ["butternut squash"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Acorn Squash",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: false,
        tags: ["vegetable", "winter"],
        commonNames: ["acorn squash"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Pumpkin",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Produce",
        popular: false,
        tags: ["vegetable", "fall"],
        commonNames: ["pumpkin"]
    },
    
    // Meat & Seafood
    {
        id: crypto.randomUUID() as UUID,
        name: "Turkey Breast",
        defaultUnit: Unit.KILOGRAM,
        defaultQuantity: 1,
        category: "Meat",
        popular: true,
        tags: ["protein", "lunch", "lean"],
        commonNames: ["turkey breast"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Turkey Slices",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Meat",
        popular: true,
        tags: ["protein", "lunch", "deli"],
        commonNames: ["turkey slices", "deli turkey"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Ham Slices",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Meat",
        popular: true,
        tags: ["protein", "lunch", "deli"],
        commonNames: ["ham slices", "deli ham"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Roast Beef",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Meat",
        popular: false,
        tags: ["protein", "lunch", "deli"],
        commonNames: ["roast beef"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Salami",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Meat",
        popular: false,
        tags: ["protein", "lunch", "italian"],
        commonNames: ["salami"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Pepperoni",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Meat",
        popular: true,
        tags: ["protein", "pizza", "italian"],
        commonNames: ["pepperoni"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Prosciutto",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Meat",
        popular: false,
        tags: ["protein", "italian", "fancy"],
        commonNames: ["prosciutto"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bacon",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Meat",
        popular: true,
        tags: ["protein", "breakfast"],
        commonNames: ["bacon"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sausage Links",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Meat",
        popular: true,
        tags: ["protein", "breakfast"],
        commonNames: ["sausage"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Italian Sausage",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Meat",
        popular: true,
        tags: ["protein", "italian", "dinner"],
        commonNames: ["italian sausage"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bratwurst",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Meat",
        popular: false,
        tags: ["protein", "german", "grill"],
        commonNames: ["bratwurst"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Hot Dogs",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 8,
        category: "Meat",
        popular: true,
        tags: ["protein", "grill", "kids"],
        commonNames: ["hot dogs"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Shrimp",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Seafood",
        popular: true,
        tags: ["seafood", "protein"],
        commonNames: ["shrimp"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Scallops",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Seafood",
        popular: false,
        tags: ["seafood", "protein"],
        commonNames: ["scallops"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Lobster Tails",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Seafood",
        popular: false,
        tags: ["seafood", "fancy"],
        commonNames: ["lobster"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Crab Legs",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Seafood",
        popular: false,
        tags: ["seafood"],
        commonNames: ["crab"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Clams",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 12,
        category: "Seafood",
        popular: false,
        tags: ["seafood"],
        commonNames: ["clams"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Mussels",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 12,
        category: "Seafood",
        popular: false,
        tags: ["seafood"],
        commonNames: ["mussels"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Oysters",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 12,
        category: "Seafood",
        popular: false,
        tags: ["seafood"],
        commonNames: ["oysters"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Calamari",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Seafood",
        popular: false,
        tags: ["seafood"],
        commonNames: ["calamari"]
    },
    
    // Bakery
    {
        id: crypto.randomUUID() as UUID,
        name: "Baguette",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Bakery",
        popular: true,
        tags: ["bread", "french"],
        commonNames: ["baguette"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Ciabatta",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Bakery",
        popular: false,
        tags: ["bread", "italian"],
        commonNames: ["ciabatta"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Focaccia",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Bakery",
        popular: false,
        tags: ["bread", "italian"],
        commonNames: ["focaccia"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Pita Bread",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 6,
        category: "Bakery",
        popular: true,
        tags: ["bread", "mediterranean"],
        commonNames: ["pita"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Naan",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Bakery",
        popular: true,
        tags: ["bread", "indian"],
        commonNames: ["naan"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Tortillas",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 12,
        category: "Bakery",
        popular: true,
        tags: ["bread", "mexican"],
        commonNames: ["tortillas", "flour tortillas"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Corn Tortillas",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 12,
        category: "Bakery",
        popular: true,
        tags: ["bread", "mexican"],
        commonNames: ["corn tortillas"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Croissants",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Bakery",
        popular: true,
        tags: ["pastry", "breakfast"],
        commonNames: ["croissants"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Danish",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Bakery",
        popular: false,
        tags: ["pastry", "breakfast"],
        commonNames: ["danish"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Muffins",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Bakery",
        popular: true,
        tags: ["breakfast"],
        commonNames: ["muffins"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Scones",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Bakery",
        popular: false,
        tags: ["breakfast"],
        commonNames: ["scones"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Biscuits",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Bakery",
        popular: true,
        tags: ["breakfast"],
        commonNames: ["biscuits"]
    },
    
    // Beverages
    {
        id: crypto.randomUUID() as UUID,
        name: "Apple Juice",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: true,
        tags: ["drink", "kids"],
        commonNames: ["apple juice"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cranberry Juice",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: false,
        tags: ["drink"],
        commonNames: ["cranberry juice"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Grape Juice",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: false,
        tags: ["drink"],
        commonNames: ["grape juice"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Pineapple Juice",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: false,
        tags: ["drink", "tropical"],
        commonNames: ["pineapple juice"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Tomato Juice",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: false,
        tags: ["drink"],
        commonNames: ["tomato juice"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Lemonade",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: true,
        tags: ["drink", "summer"],
        commonNames: ["lemonade"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Iced Tea",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: true,
        tags: ["drink"],
        commonNames: ["iced tea"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sweet Tea",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: false,
        tags: ["drink", "southern"],
        commonNames: ["sweet tea"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sparkling Water",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: true,
        tags: ["drink", "healthy"],
        commonNames: ["sparkling water"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Tonic Water",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: false,
        tags: ["drink", "cocktails"],
        commonNames: ["tonic water"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Ginger Ale",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: true,
        tags: ["drink", "soda"],
        commonNames: ["ginger ale"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Club Soda",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Beverages",
        popular: false,
        tags: ["drink", "cocktails"],
        commonNames: ["club soda"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Energy Drink",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Beverages",
        popular: true,
        tags: ["drink", "energy"],
        commonNames: ["energy drink"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sports Drink",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Beverages",
        popular: true,
        tags: ["drink", "sports"],
        commonNames: ["sports drink", "gatorade"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Coconut Water",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 4,
        category: "Beverages",
        popular: false,
        tags: ["drink", "healthy"],
        commonNames: ["coconut water"]
    },
    
    // Pantry - Grains & Beans
    {
        id: crypto.randomUUID() as UUID,
        name: "Black Beans",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Pantry",
        popular: true,
        tags: ["beans", "mexican", "protein"],
        commonNames: ["black beans"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Kidney Beans",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Pantry",
        popular: true,
        tags: ["beans", "chili"],
        commonNames: ["kidney beans"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Pinto Beans",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Pantry",
        popular: true,
        tags: ["beans", "mexican"],
        commonNames: ["pinto beans"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Chickpeas",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Pantry",
        popular: true,
        tags: ["beans", "hummus"],
        commonNames: ["chickpeas", "garbanzo beans"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Lentils",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["beans", "soup"],
        commonNames: ["lentils"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Split Peas",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["beans", "soup"],
        commonNames: ["split peas"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Quinoa",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["grain", "healthy"],
        commonNames: ["quinoa"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Couscous",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["grain"],
        commonNames: ["couscous"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Barley",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["grain", "soup"],
        commonNames: ["barley"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Oats",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["grain", "breakfast"],
        commonNames: ["oats", "oatmeal"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cornmeal",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["grain", "baking"],
        commonNames: ["cornmeal"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Flour",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["baking"],
        commonNames: ["flour", "all purpose flour"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Whole Wheat Flour",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["baking", "healthy"],
        commonNames: ["whole wheat flour"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bread Flour",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["baking"],
        commonNames: ["bread flour"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sugar",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["baking", "sweetener"],
        commonNames: ["sugar", "white sugar"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Brown Sugar",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["baking", "sweetener"],
        commonNames: ["brown sugar"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Powdered Sugar",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["baking", "sweetener"],
        commonNames: ["powdered sugar", "confectioners sugar"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Honey",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["sweetener", "natural"],
        commonNames: ["honey"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Maple Syrup",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: true,
        tags: ["sweetener", "breakfast"],
        commonNames: ["maple syrup"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Corn Syrup",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["sweetener", "baking"],
        commonNames: ["corn syrup"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Molasses",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Pantry",
        popular: false,
        tags: ["sweetener", "baking"],
        commonNames: ["molasses"]
    },
    
    // Canned Goods
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Corn",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["canned", "vegetable"],
        commonNames: ["canned corn"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Peas",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["canned", "vegetable"],
        commonNames: ["canned peas"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Green Beans",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["canned", "vegetable"],
        commonNames: ["canned green beans"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Carrots",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: false,
        tags: ["canned", "vegetable"],
        commonNames: ["canned carrots"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Mushrooms",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: false,
        tags: ["canned", "vegetable"],
        commonNames: ["canned mushrooms"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Tomatoes",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["canned", "cooking"],
        commonNames: ["canned tomatoes"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Tomato Paste",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Canned Goods",
        popular: true,
        tags: ["canned", "cooking"],
        commonNames: ["tomato paste"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Tomato Sauce",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["canned", "cooking"],
        commonNames: ["tomato sauce"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Crushed Tomatoes",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["canned", "cooking"],
        commonNames: ["crushed tomatoes"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Chili",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: true,
        tags: ["canned", "meal"],
        commonNames: ["canned chili"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Stew",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: false,
        tags: ["canned", "meal"],
        commonNames: ["canned stew"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Pasta",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 2,
        category: "Canned Goods",
        popular: false,
        tags: ["canned", "kids"],
        commonNames: ["canned pasta"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Spam",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Canned Goods",
        popular: false,
        tags: ["canned", "meat"],
        commonNames: ["spam"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Ham",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Canned Goods",
        popular: false,
        tags: ["canned", "meat"],
        commonNames: ["canned ham"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canned Chicken",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Canned Goods",
        popular: false,
        tags: ["canned", "meat"],
        commonNames: ["canned chicken"]
    },
    
    // Condiments & Spices
    {
        id: crypto.randomUUID() as UUID,
        name: "Ketchup",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["condiment"],
        commonNames: ["ketchup"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Mustard",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["condiment"],
        commonNames: ["mustard", "yellow mustard"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Dijon Mustard",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["condiment"],
        commonNames: ["dijon mustard"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Mayonnaise",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["condiment"],
        commonNames: ["mayo", "mayonnaise"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Miracle Whip",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["condiment"],
        commonNames: ["miracle whip"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "BBQ Sauce",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["sauce", "grill"],
        commonNames: ["bbq sauce"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Hot Sauce",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["sauce", "spicy"],
        commonNames: ["hot sauce", "tabasco"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sriracha",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["sauce", "spicy"],
        commonNames: ["sriracha"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Soy Sauce",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["sauce", "asian"],
        commonNames: ["soy sauce"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Teriyaki Sauce",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["sauce", "asian"],
        commonNames: ["teriyaki sauce"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Worcestershire Sauce",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["sauce"],
        commonNames: ["worcestershire"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Fish Sauce",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["sauce", "asian"],
        commonNames: ["fish sauce"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Oyster Sauce",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["sauce", "asian"],
        commonNames: ["oyster sauce"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Vinegar",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["cooking"],
        commonNames: ["vinegar", "white vinegar"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Apple Cider Vinegar",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["cooking", "healthy"],
        commonNames: ["apple cider vinegar"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Balsamic Vinegar",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["cooking", "salad"],
        commonNames: ["balsamic vinegar"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Red Wine Vinegar",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["cooking"],
        commonNames: ["red wine vinegar"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Rice Vinegar",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["cooking", "asian"],
        commonNames: ["rice vinegar"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Olive Oil",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["oil", "cooking"],
        commonNames: ["olive oil", "extra virgin olive oil"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Vegetable Oil",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["oil", "cooking"],
        commonNames: ["vegetable oil"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Canola Oil",
        defaultUnit: Unit.LITER,
        defaultQuantity: 1,
        category: "Condiments",
        popular: true,
        tags: ["oil", "cooking"],
        commonNames: ["canola oil"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Coconut Oil",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["oil", "cooking"],
        commonNames: ["coconut oil"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sesame Oil",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Condiments",
        popular: false,
        tags: ["oil", "asian"],
        commonNames: ["sesame oil"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Salt",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice"],
        commonNames: ["salt", "table salt"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sea Salt",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["spice"],
        commonNames: ["sea salt"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Kosher Salt",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["spice", "cooking"],
        commonNames: ["kosher salt"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Black Pepper",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice"],
        commonNames: ["black pepper", "pepper"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "White Pepper",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["spice"],
        commonNames: ["white pepper"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Garlic Powder",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice"],
        commonNames: ["garlic powder"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Onion Powder",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice"],
        commonNames: ["onion powder"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Paprika",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice"],
        commonNames: ["paprika"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cumin",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice", "mexican"],
        commonNames: ["cumin"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Chili Powder",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice", "mexican"],
        commonNames: ["chili powder"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cayenne Pepper",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["spice", "spicy"],
        commonNames: ["cayenne"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Red Pepper Flakes",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice", "spicy"],
        commonNames: ["red pepper flakes"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Oregano",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["herb", "italian"],
        commonNames: ["oregano"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Basil",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["herb", "italian"],
        commonNames: ["basil"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Thyme",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["herb"],
        commonNames: ["thyme"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Rosemary",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["herb"],
        commonNames: ["rosemary"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sage",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["herb"],
        commonNames: ["sage"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bay Leaves",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["herb"],
        commonNames: ["bay leaves"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cinnamon",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice", "baking"],
        commonNames: ["cinnamon"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Nutmeg",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["spice", "baking"],
        commonNames: ["nutmeg"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cloves",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["spice", "baking"],
        commonNames: ["cloves"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Ginger",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["spice", "baking"],
        commonNames: ["ginger", "ground ginger"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Allspice",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["spice", "baking"],
        commonNames: ["allspice"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Vanilla Extract",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: true,
        tags: ["baking"],
        commonNames: ["vanilla"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Almond Extract",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Spices",
        popular: false,
        tags: ["baking"],
        commonNames: ["almond extract"]
    },
    
    // Household
    {
        id: crypto.randomUUID() as UUID,
        name: "Dish Soap",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["cleaning"],
        commonNames: ["dish soap"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Dishwasher Detergent",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["cleaning"],
        commonNames: ["dishwasher detergent"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Laundry Detergent",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["laundry"],
        commonNames: ["laundry detergent"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Fabric Softener",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["laundry"],
        commonNames: ["fabric softener"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bleach",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["cleaning"],
        commonNames: ["bleach"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "All-Purpose Cleaner",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["cleaning"],
        commonNames: ["all-purpose cleaner"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Glass Cleaner",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["cleaning"],
        commonNames: ["glass cleaner"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bathroom Cleaner",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["cleaning"],
        commonNames: ["bathroom cleaner"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Trash Bags",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["trash"],
        commonNames: ["trash bags"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Recycling Bags",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: false,
        tags: ["trash"],
        commonNames: ["recycling bags"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Ziploc Bags",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["storage"],
        commonNames: ["ziploc bags", "sandwich bags"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Freezer Bags",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: false,
        tags: ["storage", "freezer"],
        commonNames: ["freezer bags"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Plastic Wrap",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["storage"],
        commonNames: ["plastic wrap"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Aluminum Foil",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["storage", "cooking"],
        commonNames: ["aluminum foil"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Parchment Paper",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["baking"],
        commonNames: ["parchment paper"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Wax Paper",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: false,
        tags: ["storage"],
        commonNames: ["wax paper"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Paper Towels",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["paper"],
        commonNames: ["paper towels"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Napkins",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["paper"],
        commonNames: ["napkins"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Paper Plates",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["paper", "disposable"],
        commonNames: ["paper plates"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Plastic Cups",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["disposable"],
        commonNames: ["plastic cups"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Plastic Utensils",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["disposable"],
        commonNames: ["plastic utensils"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Straws",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: false,
        tags: ["disposable"],
        commonNames: ["straws"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Batteries",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["electronics"],
        commonNames: ["batteries"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Light Bulbs",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Household",
        popular: true,
        tags: ["lighting"],
        commonNames: ["light bulbs"]
    },
    
    // Personal Care
    {
        id: crypto.randomUUID() as UUID,
        name: "Shampoo",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["hair"],
        commonNames: ["shampoo"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Conditioner",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["hair"],
        commonNames: ["conditioner"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Body Wash",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["bath"],
        commonNames: ["body wash"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bar Soap",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["bath"],
        commonNames: ["bar soap"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Deodorant",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["hygiene"],
        commonNames: ["deodorant"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Toothpaste",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["oral"],
        commonNames: ["toothpaste"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Toothbrush",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["oral"],
        commonNames: ["toothbrush"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Mouthwash",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["oral"],
        commonNames: ["mouthwash"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Floss",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["oral"],
        commonNames: ["floss"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Razor",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["grooming"],
        commonNames: ["razor"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Shaving Cream",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["grooming"],
        commonNames: ["shaving cream"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Lotion",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["skin"],
        commonNames: ["lotion"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Sunscreen",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["sun", "skin"],
        commonNames: ["sunscreen"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Lip Balm",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["lips"],
        commonNames: ["lip balm"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Tissues",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["cold"],
        commonNames: ["tissues"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cotton Balls",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: false,
        tags: ["hygiene"],
        commonNames: ["cotton balls"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cotton Swabs",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["hygiene"],
        commonNames: ["cotton swabs"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Feminine Products",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["feminine"],
        commonNames: ["feminine products"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "First Aid Kit",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: false,
        tags: ["medical"],
        commonNames: ["first aid kit"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Bandages",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["medical"],
        commonNames: ["bandages"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Pain Reliever",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["medicine"],
        commonNames: ["pain reliever"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Allergy Medicine",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["medicine"],
        commonNames: ["allergy medicine"]
    },
    {
        id: crypto.randomUUID() as UUID,
        name: "Cold Medicine",
        defaultUnit: Unit.PIECE,
        defaultQuantity: 1,
        category: "Personal Care",
        popular: true,
        tags: ["medicine"],
        commonNames: ["cold medicine"]
    }
]

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