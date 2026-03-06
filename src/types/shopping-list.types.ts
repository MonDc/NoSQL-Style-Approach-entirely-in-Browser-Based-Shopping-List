/**
 * Core data models with robust TypeScript interfaces
 * All interfaces are designed to be extensible and type-safe
 */

// UUID type for better type safety
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

// Enum for item status to prevent magic strings
export enum ItemStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

// Enum for priority levels
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Enum for units of measurement
export enum Unit {
  PIECE = 'piece',
  KILOGRAM = 'kg',
  GRAM = 'g',
  LITER = 'l',
  MILLILITER = 'ml',
  PACK = 'pack',
  BUNCH = 'bunch'
}

// Main shopping list item interface
export interface ShoppingListItem {
  id: UUID;
  name: string;
  quantity: number;
  unit: Unit;
  notes?: string;
  category?: string;
  priority: Priority;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  price?: number;
  store?: string;
  tags?: string[];
}

// Shopping list interface (multiple lists support)
export interface ShoppingList {
  id: UUID;
  name: string;
  description?: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  sharedWith?: string[];
  isArchived: boolean;
  store?: string;
  estimatedTotal?: number;
  tags?: string[];
}

// Database schema for IndexedDB
export interface ShoppingListDBSchema {
  shoppingLists: {
    key: UUID;
    value: ShoppingList;
    indexes: {
      'by-name': string;
      'by-owner': string;
      'by-created': Date;
      'by-updated': Date;
      'by-archived': boolean;
    };
  };
  shoppingListItems: {
    key: UUID;
    value: ShoppingListItem;
    indexes: {
      'by-list': UUID;
      'by-status': ItemStatus;
      'by-category': string;
      'by-priority': Priority;
      'by-created': Date;
    };
  };
}

// Repository operation result
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  message?: string;
}

// Query parameters for filtering
export interface QueryParams<T> {
  filter?: Partial<T>;
  sort?: {
    field: keyof T;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

// Event types for reactive updates
export enum DataEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  SYNCED = 'synced'
}

export interface DataEvent<T> {
  type: DataEventType;
  data: T;
  timestamp: Date;
  source: string;
}