import 'server-only'
import {
  getCategoriesWithCache,
  getTagsWithCache
} from '@/lib/cache/categories'

/**
 * Data Access Layer for Categories and Tags
 * Provides a clean API for category/tag data access with caching
 * 
 * @example
 * import { getCategories, getTags } from '@/lib/data'
 * 
 * // Get all categories with product counts
 * const categories = await getCategories(userId)
 * 
 * // Get all tags with product counts
 * const tags = await getTags(userId)
 */

/**
 * Get all categories for a user with caching
 * @param userId - The user's ID
 * @returns Promise with array of categories including product counts
 */
export const getCategories = getCategoriesWithCache

/**
 * Get all tags for a user with caching
 * @param userId - The user's ID
 * @returns Promise with array of tags including product counts
 */
export const getTags = getTagsWithCache
