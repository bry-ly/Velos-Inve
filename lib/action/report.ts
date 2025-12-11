"use server";

import { prisma } from "@/lib/prisma/prisma";
import { requireAuthedUser } from "@/lib/server/action-utils";

interface DateRangeProps {
  startDate?: string;
  endDate?: string;
}

/**
 * Get Profit & Loss Summary
 * Calculates Revenue, COGS, Gross Profit, and Net Profit
 */
export async function getProfitLossSummary({
  startDate,
  endDate,
}: DateRangeProps) {
  try {
    const user = await requireAuthedUser();

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(end.getDate() - 30));

    // Ensure dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        success: false,
        message: "Invalid date range",
      };
    }

    // Adjust end date to end of day
    end.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        userId: user.id,
        status: "completed",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true,
      },
    });

    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    sales.forEach((sale) => {
      totalRevenue += Number(sale.totalAmount) - Number(sale.tax); // Net revenue (excl tax)
      totalDiscount += Number(sale.discount);
      totalTax += Number(sale.tax);

      sale.items.forEach((item) => {
        const quantity = item.quantity;
        const costPrice = Number(item.costPrice || 0);
        totalCOGS += costPrice * quantity;
      });
    });

    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      success: true,
      data: {
        revenue: totalRevenue,
        cogs: totalCOGS,
        grossProfit,
        grossMargin,
        netProfit: grossProfit, // For now, net profit = gross profit (until we add expenses)
        totalDiscount,
        totalTax,
        transactionCount: sales.length,
      },
    };
  } catch (error) {
    console.error("Failed to calculate P&L:", error);
    return {
      success: false,
      message: "Failed to calculate profit and loss",
    };
  }
}

/**
 * Get Sales Performance Over Time
 * Returns daily data for charts
 */
export async function getSalesPerformance({
  startDate,
  endDate,
}: DateRangeProps) {
  try {
    const user = await requireAuthedUser();

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(end.getDate() - 30));

    end.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        userId: user.id,
        status: "completed",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const dailyData: Record<
      string,
      { date: string; revenue: number; profit: number; count: number }
    > = {};

    // Initialize all days in range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      dailyData[dateStr] = { date: dateStr, revenue: 0, profit: 0, count: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    sales.forEach((sale) => {
      const dateStr = sale.createdAt.toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        const revenue = Number(sale.totalAmount) - Number(sale.tax);
        let cogs = 0;
        sale.items.forEach((item) => {
          cogs += Number(item.costPrice || 0) * item.quantity;
        });

        dailyData[dateStr].revenue += revenue;
        dailyData[dateStr].profit += revenue - cogs;
        dailyData[dateStr].count += 1;
      }
    });

    return {
      success: true,
      data: Object.values(dailyData),
    };
  } catch (error) {
    console.error("Failed to get sales performance:", error);
    return {
      success: false,
      data: [],
    };
  }
}

/**
 * Get Product Performance
 * Top products by profit margin
 */
export async function getProductPerformance(limit: number = 10) {
  try {
    const user = await requireAuthedUser();

    // Get verified completed sales
    const sales = await prisma.sale.findMany({
      where: {
        userId: user.id,
        status: "completed",
      },
      include: {
        items: true,
      },
    });

    const productStats: Record<
      string,
      {
        id: string;
        name: string;
        revenue: number;
        cost: number;
        profit: number;
        unitsSold: number;
      }
    > = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!item.productId) return;

        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            id: item.productId,
            name: item.productName,
            revenue: 0,
            cost: 0,
            profit: 0,
            unitsSold: 0,
          };
        }

        const stats = productStats[item.productId];
        const itemRevenue = Number(item.totalPrice); // Using totalPrice as revenue contribution
        const itemCost = Number(item.costPrice || 0) * item.quantity;

        stats.revenue += itemRevenue;
        stats.cost += itemCost;
        stats.profit += itemRevenue - itemCost;
        stats.unitsSold += item.quantity;
      });
    });

    const rankedProducts = Object.values(productStats)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit)
      .map((p) => ({
        ...p,
        margin: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0,
      }));

    return {
      success: true,
      data: rankedProducts,
    };
  } catch (error) {
    console.error("Failed to get product performance:", error);
    return {
      success: false,
      data: [],
    };
  }
}
