import { Priority, Unit } from '../../types/shopping-list.types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validator for shopping list business rules
 * Ensures data integrity before passing to repositories
 */
export class ShoppingListValidator {
    
    /**
     * Validate new list creation
     * @param name List name
     * @param ownerId Owner ID
     * @returns ValidationResult with errors if any
     * @example
     * const validation = validator.validateNewList('My List', 'user123');
     * if (!validation.isValid) throw new Error(validation.errors.join(', '));
     */
    public validateNewList(name: string, ownerId: string): ValidationResult {
        const errors: string[] = [];

        // Name validation
        if (!name || name.trim().length === 0) {
            errors.push('List name is required');
        } else if (name.trim().length < 3) {
            errors.push('List name must be at least 3 characters long');
        } else if (name.trim().length > 50) {
            errors.push('List name cannot exceed 50 characters');
        }

        // Owner validation
        if (!ownerId || ownerId.trim().length === 0) {
            errors.push('Owner ID is required');
        } else if (!this.isValidUUID(ownerId) && ownerId !== 'demo-user') {
            // Allow demo-user for testing, otherwise validate UUID format
            errors.push('Owner ID must be a valid UUID');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate new item before adding to list
     * @param itemData Item data to validate
     * @returns ValidationResult with errors if any
     * @example
     * const validation = validator.validateNewItem({
     *   name: 'Milk',
     *   quantity: 2,
     *   unit: Unit.LITER
     * });
     */
    public validateNewItem(itemData: {
        name: string;
        quantity: number;
        unit: Unit;
        priority?: Priority;
        category?: string;
        notes?: string;
    }): ValidationResult {
        const errors: string[] = [];

        // Name validation
        if (!itemData.name || itemData.name.trim().length === 0) {
            errors.push('Item name is required');
        } else if (itemData.name.trim().length > 100) {
            errors.push('Item name cannot exceed 100 characters');
        }

        // Quantity validation
        if (itemData.quantity === undefined || itemData.quantity === null) {
            errors.push('Quantity is required');
        } else if (itemData.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        } else if (itemData.quantity > 1000) {
            errors.push('Quantity cannot exceed 1000');
        }

        // Unit validation
        if (!itemData.unit) {
            errors.push('Unit is required');
        } else if (!Object.values(Unit).includes(itemData.unit)) {
            errors.push('Invalid unit specified');
        }

        // Priority validation (if provided)
        if (itemData.priority && !Object.values(Priority).includes(itemData.priority)) {
            errors.push('Invalid priority specified');
        }

        // Category validation (if provided)
        if (itemData.category && itemData.category.trim().length > 50) {
            errors.push('Category cannot exceed 50 characters');
        }

        // Notes validation (if provided)
        if (itemData.notes && itemData.notes.trim().length > 500) {
            errors.push('Notes cannot exceed 500 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate list update operation
     * @param updates Partial list updates
     * @returns ValidationResult with errors if any
     */
    public validateListUpdate(updates: Partial<{ name: string; description: string; isArchived: boolean }>): ValidationResult {
        const errors: string[] = [];

        if (updates.name !== undefined) {
            if (updates.name.trim().length === 0) {
                errors.push('List name cannot be empty');
            } else if (updates.name.trim().length > 50) {
                errors.push('List name cannot exceed 50 characters');
            }
        }

        if (updates.description !== undefined && updates.description.trim().length > 200) {
            errors.push('Description cannot exceed 200 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate quantity update for an item
     * @param quantity New quantity value
     * @returns ValidationResult with errors if any
     */
    public validateQuantity(quantity: number): ValidationResult {
        const errors: string[] = [];

        if (quantity === undefined || quantity === null) {
            errors.push('Quantity is required');
        } else if (quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        } else if (quantity > 1000) {
            errors.push('Quantity cannot exceed 1000');
        } else if (!Number.isInteger(quantity) && ![Unit.KILOGRAM, Unit.GRAM, Unit.LITER, Unit.MILLILITER].includes(quantity as any)) {
            // Allow decimals for weight/volume units only
            errors.push('Quantity must be a whole number for this unit type');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate search query
     * @param query Search string
     * @returns ValidationResult with errors if any
     */
    public validateSearchQuery(query: string): ValidationResult {
        const errors: string[] = [];

        if (!query || query.trim().length === 0) {
            errors.push('Search query cannot be empty');
        } else if (query.trim().length < 2) {
            errors.push('Search query must be at least 2 characters');
        } else if (query.trim().length > 50) {
            errors.push('Search query cannot exceed 50 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate user ID
     * @param userId User ID to validate
     * @returns ValidationResult with errors if any
     */
    public validateUserId(userId: string): ValidationResult {
        const errors: string[] = [];

        if (!userId || userId.trim().length === 0) {
            errors.push('User ID is required');
        } else if (!this.isValidUUID(userId) && userId !== 'demo-user') {
            errors.push('User ID must be a valid UUID');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate list ID
     * @param listId List ID to validate
     * @returns ValidationResult with errors if any
     */
    public validateListId(listId: string): ValidationResult {
        const errors: string[] = [];

        if (!listId || listId.trim().length === 0) {
            errors.push('List ID is required');
        } else if (!this.isValidUUID(listId)) {
            errors.push('List ID must be a valid UUID');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate catalog product ID
     * @param productId Product ID to validate
     * @returns ValidationResult with errors if any
     */
    public validateProductId(productId: string): ValidationResult {
        const errors: string[] = [];

        if (!productId || productId.trim().length === 0) {
            errors.push('Product ID is required');
        } else if (!this.isValidUUID(productId)) {
            errors.push('Product ID must be a valid UUID');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Helper method to validate UUID format
     * @param uuid String to check
     * @returns boolean indicating if string is valid UUID
     */
    private isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    /**
     * Sanitize input string (remove dangerous characters)
     * @param input Raw input string
     * @returns Sanitized string
     */
    public sanitizeString(input: string): string {
        if (!input) return '';
        // Remove any HTML tags and trim
        return input.replace(/<[^>]*>/g, '').trim();
    }

    /**
     * Validate and sanitize item name
     * @param name Raw item name
     * @returns Sanitized name or throws error
     */
    public validateAndSanitizeName(name: string): string {
        const sanitized = this.sanitizeString(name);
        
        if (sanitized.length === 0) {
            throw new Error('Item name cannot be empty');
        }
        if (sanitized.length > 100) {
            throw new Error('Item name cannot exceed 100 characters');
        }
        
        return sanitized;
    }

    /**
     * Validate and sanitize notes
     * @param notes Raw notes
     * @returns Sanitized notes or empty string
     */
    public validateAndSanitizeNotes(notes?: string): string {
        if (!notes) return '';
        
        const sanitized = this.sanitizeString(notes);
        if (sanitized.length > 500) {
            throw new Error('Notes cannot exceed 500 characters');
        }
        
        return sanitized;
    }
}