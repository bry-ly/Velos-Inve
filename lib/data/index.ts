import 'server-only'

/**
 * Data Access Layer - Barrel Export
 * 
 * Import data access functions from here instead of directly from cache layer.
 * All functions include caching and are server-only.
 * 
 * @example
 * import { 
 *   getProducts, 
 *   getCategories, 
 *   getInventoryAnalytics 
 * } from '@/lib/data'
 */

// Product data access
export { 
  getProducts, 
  getProductById, 
  getLowStockProducts 
} from './products'

// Category and tag data access
export { 
  getCategories, 
  getTags 
} from './categories'

// Analytics data access
export { 
  getInventoryAnalytics, 
  getSalesAnalytics 
} from './analytics'
