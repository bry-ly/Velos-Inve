import 'server-only'
import {
  getInventoryAnalyticsWithCache,
  getSalesAnalyticsWithCache
} from '@/lib/cache/analytics'

/**
 * Data Access Layer for Analytics
 * Provides a clean API for analytics data access with caching
 * 
 * @example
 * import { getInventoryAnalytics, getSalesAnalytics } from '@/lib/data'
 * 
 * // Get inventory stats
 * const stats = await getInventoryAnalytics(userId)
 * 
 * // Get sales analytics for a date range
 * const sales = await getSalesAnalytics(userId, startDate, endDate)
 */

/**
 * Get inventory analytics for a user with caching
 * @param userId - The user's ID
 * @returns Promise with analytics data including total products, value, and category breakdown
 */
export const getInventoryAnalytics = getInventoryAnalyticsWithCache

/**
 * Get sales analytics for a user with caching
 * @param userId - The user's ID
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns Promise with sales analytics including count, revenue, and recent sales
 */
export const getSalesAnalytics = getSalesAnalyticsWithCache
