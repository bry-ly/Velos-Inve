import 'server-only'
import { 
  getProductsWithCache, 
  getProductByIdWithCache, 
  getLowStockProductsWithCache 
} from '@/lib/cache/products'

/**
 * Data Access Layer for Products
 * Provides a clean API for product data access with caching
 * 
 * @example
 * import { getProducts, getProductById } from '@/lib/data'
 * 
 * // Get all products for a user
 * const products = await getProducts(userId)
 * 
 * // Get a specific product
 * const product = await getProductById(productId, userId)
 */

/**
 * Get all products for a user with caching
 * @param userId - The user's ID
 * @returns Promise with array of products including category, supplier, and tags
 */
export const getProducts = getProductsWithCache

/**
 * Get a single product by ID with caching
 * @param productId - The product's ID
 * @param userId - The user's ID (for ownership verification)
 * @returns Promise with product including category, supplier, tags, and recent batches
 */
export const getProductById = getProductByIdWithCache

/**
 * Get products with low stock for a user with caching
 * @param userId - The user's ID
 * @returns Promise with array of low stock products
 */
export const getLowStockProducts = getLowStockProductsWithCache
