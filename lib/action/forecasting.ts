"use server";

import { prisma } from "@/lib/prisma/prisma";
import { requireAuthedUser } from "@/lib/server/action-utils";

export interface ForecastData {
  productId: string;
  productName: string;
  currentStock: number;
  averageDailySales: number;
  estimatedStockoutDate: Date | null;
  daysUntilStockout: number | null;
  recommendedReorderPoint: number;
  recommendedReorderQuantity: number;
  trend: "increasing" | "decreasing" | "stable";
}

/**
 * Calculate inventory forecast based on historical sales data
 * This helps predict when products will run out and when to reorder
 */
export async function getInventoryForecast(
  daysToAnalyze: number = 30,
  daysToForecast: number = 30
): Promise<{
  success: boolean;
  data: ForecastData[];
  message?: string;
}> {
  try {
    const user = await requireAuthedUser();

    // Get date range for analysis
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysToAnalyze);

    // Get sales data for the analysis period
    const sales = await prisma.sale.findMany({
      where: {
        userId: user.id,
        status: "completed",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
          },
        },
      },
    });

    // Aggregate sales by product
    const salesByProduct = new Map<
      string,
      {
        productId: string;
        productName: string;
        totalQuantitySold: number;
        salesCount: number;
      }
    >();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!item.productId) return;

        const existing = salesByProduct.get(item.productId);
        if (existing) {
          existing.totalQuantitySold += item.quantity;
          existing.salesCount += 1;
        } else {
          salesByProduct.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            totalQuantitySold: item.quantity,
            salesCount: 1,
          });
        }
      });
    });

    // Get current product data
    const productIds = Array.from(salesByProduct.keys());
    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        lowStockAt: true,
      },
    });

    // Calculate forecasts
    const forecasts: ForecastData[] = products.map((product) => {
      const salesData = salesByProduct.get(product.id);
      const totalQuantitySold = salesData?.totalQuantitySold || 0;
      const averageDailySales = totalQuantitySold / daysToAnalyze;

      // Calculate when product will run out
      let estimatedStockoutDate: Date | null = null;
      let daysUntilStockout: number | null = null;

      if (averageDailySales > 0 && product.quantity > 0) {
        daysUntilStockout = Math.floor(product.quantity / averageDailySales);
        estimatedStockoutDate = new Date();
        estimatedStockoutDate.setDate(
          estimatedStockoutDate.getDate() + daysUntilStockout
        );
      } else if (product.quantity === 0) {
        daysUntilStockout = 0;
        estimatedStockoutDate = new Date();
      }

      // Calculate recommended reorder point and quantity
      // Reorder point: enough to last until next reorder arrives (assume 7 days lead time)
      const leadTimeDays = 7;
      const recommendedReorderPoint = Math.ceil(
        averageDailySales * (leadTimeDays + 7) // 7 days buffer
      );

      // Reorder quantity: enough to last for the forecast period
      const recommendedReorderQuantity = Math.max(
        Math.ceil(averageDailySales * daysToForecast),
        product.lowStockAt || 10 // Use low stock threshold or minimum 10
      );

      // Determine trend based on recent vs older sales
      const midpoint = Math.floor(daysToAnalyze / 2);
      const recentStart = new Date();
      recentStart.setDate(endDate.getDate() - midpoint);

      const recentSales = sales.filter(
        (sale) => new Date(sale.createdAt) >= recentStart
      );
      const recentQuantity = recentSales.reduce((sum, sale) => {
        return (
          sum +
          sale.items
            .filter((item) => item.productId === product.id)
            .reduce((itemSum, item) => itemSum + item.quantity, 0)
        );
      }, 0);

      const olderQuantity = totalQuantitySold - recentQuantity;
      const recentAvg = recentQuantity / midpoint;
      const olderAvg = olderQuantity / midpoint;

      let trend: ForecastData["trend"] = "stable";
      if (recentAvg > olderAvg * 1.2) {
        trend = "increasing";
      } else if (recentAvg < olderAvg * 0.8) {
        trend = "decreasing";
      }

      return {
        productId: product.id,
        productName: product.name,
        currentStock: product.quantity,
        averageDailySales: Number(averageDailySales.toFixed(2)),
        estimatedStockoutDate,
        daysUntilStockout,
        recommendedReorderPoint,
        recommendedReorderQuantity,
        trend,
      };
    });

    // Sort by urgency (soonest stockout first)
    forecasts.sort((a, b) => {
      if (a.daysUntilStockout === null) return 1;
      if (b.daysUntilStockout === null) return -1;
      return a.daysUntilStockout - b.daysUntilStockout;
    });

    return {
      success: true,
      data: forecasts,
    };
  } catch (error) {
    console.error("Error calculating inventory forecast:", error);
    return {
      success: false,
      data: [],
      message: "Failed to calculate inventory forecast",
    };
  }
}

/**
 * Get demand forecast for a specific product
 * Provides detailed analysis for a single product
 */
export async function getProductDemandForecast(
  productId: string,
  daysToAnalyze: number = 90
): Promise<{
  success: boolean;
  data: {
    productId: string;
    productName: string;
    currentStock: number;
    totalSales: number;
    averageDailySales: number;
    averageWeeklySales: number;
    averageMonthlySales: number;
    salesByWeek: Array<{
      weekStart: string;
      weekEnd: string;
      quantitySold: number;
    }>;
    trend: "increasing" | "decreasing" | "stable";
    seasonality: {
      hasSeasonality: boolean;
      peakPeriod?: string;
    };
  } | null;
  message?: string;
}> {
  try {
    const user = await requireAuthedUser();

    // Verify product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: user.id,
      },
    });

    if (!product) {
      return {
        success: false,
        data: null,
        message: "Product not found",
      };
    }

    // Get sales data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysToAnalyze);

    const sales = await prisma.sale.findMany({
      where: {
        userId: user.id,
        status: "completed",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          where: {
            productId,
          },
          select: {
            quantity: true,
          },
        },
      },
    });

    // Calculate total sales
    const totalSales = sales.reduce((sum, sale) => {
      return (
        sum +
        sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
      );
    }, 0);

    const averageDailySales = totalSales / daysToAnalyze;
    const averageWeeklySales = averageDailySales * 7;
    const averageMonthlySales = averageDailySales * 30;

    // Calculate sales by week
    const salesByWeek: Array<{
      weekStart: string;
      weekEnd: string;
      quantitySold: number;
    }> = [];

    const weeks = Math.ceil(daysToAnalyze / 7);
    for (let i = 0; i < weeks; i++) {
      const weekEnd = new Date(endDate);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const weekSales = sales
        .filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekStart && saleDate <= weekEnd;
        })
        .reduce((sum, sale) => {
          return (
            sum +
            sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
          );
        }, 0);

      salesByWeek.unshift({
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        quantitySold: weekSales,
      });
    }

    // Determine trend
    const firstHalfWeeks = salesByWeek.slice(0, Math.floor(weeks / 2));
    const secondHalfWeeks = salesByWeek.slice(Math.floor(weeks / 2));

    const firstHalfAvg =
      firstHalfWeeks.reduce((sum, w) => sum + w.quantitySold, 0) /
      firstHalfWeeks.length;
    const secondHalfAvg =
      secondHalfWeeks.reduce((sum, w) => sum + w.quantitySold, 0) /
      secondHalfWeeks.length;

    let trend: "increasing" | "decreasing" | "stable" = "stable";
    if (secondHalfAvg > firstHalfAvg * 1.2) {
      trend = "increasing";
    } else if (secondHalfAvg < firstHalfAvg * 0.8) {
      trend = "decreasing";
    }

    // Basic seasonality detection
    // Find peak week
    const peakWeek = salesByWeek.reduce((max, week) =>
      week.quantitySold > max.quantitySold ? week : max
    );
    const avgSales =
      salesByWeek.reduce((sum, w) => sum + w.quantitySold, 0) /
      salesByWeek.length;
    const hasSeasonality = peakWeek.quantitySold > avgSales * 1.5;

    return {
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        currentStock: product.quantity,
        totalSales,
        averageDailySales: Number(averageDailySales.toFixed(2)),
        averageWeeklySales: Number(averageWeeklySales.toFixed(2)),
        averageMonthlySales: Number(averageMonthlySales.toFixed(2)),
        salesByWeek,
        trend,
        seasonality: {
          hasSeasonality,
          peakPeriod: hasSeasonality
            ? `${peakWeek.weekStart} to ${peakWeek.weekEnd}`
            : undefined,
        },
      },
    };
  } catch (error) {
    console.error("Error calculating product demand forecast:", error);
    return {
      success: false,
      data: null,
      message: "Failed to calculate demand forecast",
    };
  }
}
