import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma/prisma'
import { Prisma } from '@/app/generated/prisma/client'
import { CACHE_TAGS, CACHE_REVALIDATE } from './index'

/**
 * Get inventory analytics with caching
 */
export const getInventoryAnalyticsWithCache = unstable_cache(
  async (userId: string) => {
    const [totalStats, lowStockCount, outOfStockCount, categoryStats, categories] =
      await Promise.all([
        // Get total products and total value
        prisma.$queryRaw<Array<{ totalProducts: bigint; totalValue: Prisma.Decimal }>>(
          Prisma.sql`
            SELECT 
              COUNT(*)::bigint as "totalProducts",
              COALESCE(SUM("price" * "quantity"), 0) as "totalValue"
            FROM "Product"
            WHERE "userId" = ${userId}
          `
        ),
        // Get low stock count
        prisma.$queryRaw<Array<{ count: bigint }>>(
          Prisma.sql`
            SELECT COUNT(*)::bigint as count
            FROM "Product"
            WHERE "userId" = ${userId}
              AND "lowStockAt" IS NOT NULL
              AND "quantity" <= "lowStockAt"
          `
        ),
        // Get out of stock count
        prisma.$queryRaw<Array<{ count: bigint }>>(
          Prisma.sql`
            SELECT COUNT(*)::bigint as count
            FROM "Product"
            WHERE "userId" = ${userId}
              AND "quantity" = 0
          `
        ),
        // Get category breakdown
        prisma.$queryRaw<Array<{ categoryId: string | null; totalValue: Prisma.Decimal }>>(
          Prisma.sql`
            SELECT 
              "categoryId",
              COALESCE(SUM("price" * "quantity"), 0) as "totalValue"
            FROM "Product"
            WHERE "userId" = ${userId}
            GROUP BY "categoryId"
          `
        ),
        // Get category names
        prisma.category.findMany({
          where: { userId },
          select: { id: true, name: true },
        }),
      ])

    const totalProducts = Number(totalStats[0]?.totalProducts ?? 0)
    const totalValue = Number(totalStats[0]?.totalValue ?? 0)
    const lowStock = Number(lowStockCount[0]?.count ?? 0)
    const outOfStock = Number(outOfStockCount[0]?.count ?? 0)

    // Create category map
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

    // Build value by category
    const valueByCategory = categoryStats.reduce(
      (acc, stat) => {
        const catName = stat.categoryId
          ? categoryMap.get(stat.categoryId) || 'Uncategorized'
          : 'Uncategorized'
        acc[catName] = Number(stat.totalValue)
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalProducts,
      totalValue,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      valueByCategory,
    }
  },
  ['inventory-analytics'],
  {
    tags: [CACHE_TAGS.analytics, CACHE_TAGS.products],
    revalidate: CACHE_REVALIDATE.analytics,
  }
)

/**
 * Get sales analytics with caching
 */
export const getSalesAnalyticsWithCache = unstable_cache(
  async (userId: string, startDate?: Date, endDate?: Date) => {
    const whereClause = {
      userId,
      ...(startDate && endDate
        ? {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {}),
    }

    const [salesCount, totalRevenue, recentSales] = await Promise.all([
      prisma.sale.count({ where: whereClause }),
      prisma.sale.aggregate({
        where: whereClause,
        _sum: { totalAmount: true },
      }),
      prisma.sale.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customerRecord: true,
          items: true,
        },
      }),
    ])

    return {
      salesCount,
      totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
      recentSales,
    }
  },
  ['sales-analytics'],
  {
    tags: [CACHE_TAGS.analytics, CACHE_TAGS.sales],
    revalidate: CACHE_REVALIDATE.analytics,
  }
)
