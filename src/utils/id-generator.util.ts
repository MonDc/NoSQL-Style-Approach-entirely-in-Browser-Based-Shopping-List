import { UUID } from '../types/shopping-list.types';

/**
 * Utility for generating consistent IDs
 */
export function generateId(): UUID {
  return crypto.randomUUID() as UUID;
}

/**
 * Generate a short ID for display purposes
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}