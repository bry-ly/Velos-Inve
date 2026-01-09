import 'server-only'

/**
 * Cache tags for revalidation
 * Use with revalidateTag() to invalidate specific caches
 */
export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  suppliers: 'suppliers',
  customers: 'customers',
  sales: 'sales',
  analytics: 'analytics',
  locations: 'locations',
  batches: 'batches',
  purchaseOrders: 'purchase-orders',
  tags: 'tags',
  activityLog: 'activity-log',
} as const

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS]

/**
 * Default revalidation times in seconds
 */
export const CACHE_REVALIDATE = {
  products: 60, // 1 minute
  categories: 300, // 5 minutes
  suppliers: 300, // 5 minutes
  customers: 300, // 5 minutes
  analytics: 120, // 2 minutes
  locations: 600, // 10 minutes
  tags: 300, // 5 minutes
  activityLog: 30, // 30 seconds
} as const

/**
 * Helper to generate cache key parts
 */
export function getCacheKey(prefix: string, ...parts: string[]): string[] {
  return [prefix, ...parts]
}
