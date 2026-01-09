import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma/prisma'
import { CACHE_TAGS, CACHE_REVALIDATE } from './index'

/**
 * Get all categories for a user with caching
 */
export const getCategoriesWithCache = unstable_cache(
  async (userId: string) => {
    return prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  },
  ['categories-list'],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: CACHE_REVALIDATE.categories,
  }
)

/**
 * Get all tags for a user with caching
 */
export const getTagsWithCache = unstable_cache(
  async (userId: string) => {
    return prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  },
  ['tags-list'],
  {
    tags: [CACHE_TAGS.tags],
    revalidate: CACHE_REVALIDATE.tags,
  }
)
