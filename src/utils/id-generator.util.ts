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

/**
 * Generate a deterministic UUID v4-compatible string from an input string.
 * Same input always produces the same UUID.
 */
export function generateStableUUID(input: string): UUID {
  // Simple but effective hash to spread bits
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }

  // Convert to hex and format as UUID v4
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0,8)}-${hex.slice(0,4)}-4${hex.slice(1,4)}-${hex.slice(0,4)}-${hex.slice(0,12)}` as UUID;
}