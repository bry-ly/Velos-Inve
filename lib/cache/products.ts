import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma/prisma'
import { CACHE_TAGS, CACHE_REVALIDATE } from './index'

/**
 * Get all products for a user with caching
 */
export const getProductsWithCache = unstable_cache(
  async (userId: string) => {
    return prisma.product.findMany({
      where: { userId },
      include: {
        category: true,
        supplier: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },
  ['products-list'],
  {
    tags: [CACHE_TAGS.products],
    revalidate: CACHE_REVALIDATE.products,
  }
)

/**
 * Get a single product by ID with caching
 */
export const getProductByIdWithCache = unstable_cache(
  async (productId: string, userId: string) => {
    return prisma.product.findFirst({
      where: { id: productId, userId },
      include: {
        category: true,
        supplier: true,
        tags: {
          include: {
            tag: true,
          },
        },
        batches: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
  },
  ['product-detail'],
  {
    tags: [CACHE_TAGS.products],
    revalidate: CACHE_REVALIDATE.products,
  }
)

/**
 * Get low stock products with caching
 */
export const getLowStockProductsWithCache = unstable_cache(
  async (userId: string) => {
    return prisma.product.findMany({
      where: {
        userId,
        lowStockAt: { not: null },
        quantity: { lte: prisma.product.fields.lowStockAt },
      },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { quantity: 'asc' },
    })
  },
  ['low-stock-products'],
  {
    tags: [CACHE_TAGS.products, CACHE_TAGS.analytics],
    revalidate: CACHE_REVALIDATE.analytics,
  }
)
