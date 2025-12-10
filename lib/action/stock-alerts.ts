"use server";

import { prisma } from "@/lib/prisma/prisma";
import { requireAuthedUser, ActionResult, successResult, failureResult } from "@/lib/server/action-utils";

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  lowStockThreshold: number | null;
  alertType: "low_stock" | "out_of_stock" | "restock_needed";
  severity: "critical" | "warning" | "info";
  message: string;
  createdAt: Date;
}

/**
 * Get active stock alerts for the user
 * Returns products that are out of stock or below their low stock threshold
 */
export async function getStockAlerts(): Promise<{
  success: boolean;
  data: StockAlert[];
  message?: string;
}> {
  try {
    const user = await requireAuthedUser();

    // Get products with stock issues
    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
        OR: [
          // Out of stock
          { quantity: 0 },
          // Low stock (quantity <= lowStockAt)
          {
            AND: [
              { lowStockAt: { not: null } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        lowStockAt: true,
        createdAt: true,
        manufacturer: true,
        sku: true,
      },
      orderBy: [
        { quantity: "asc" },
        { name: "asc" },
      ],
    });

    // Filter and transform to alerts
    const alerts: StockAlert[] = products
      .filter((p) => {
        // Include if out of stock or below threshold
        return p.quantity === 0 || (p.lowStockAt !== null && p.quantity <= p.lowStockAt);
      })
      .map((product) => {
        let alertType: StockAlert["alertType"];
        let severity: StockAlert["severity"];
        let message: string;

        if (product.quantity === 0) {
          alertType = "out_of_stock";
          severity = "critical";
          message = `${product.name} is out of stock`;
        } else if (product.lowStockAt !== null && product.quantity <= product.lowStockAt) {
          const percentageRemaining = product.lowStockAt > 0 
            ? (product.quantity / product.lowStockAt) * 100 
            : 0;
          
          alertType = "low_stock";
          severity = percentageRemaining <= 25 ? "critical" : "warning";
          message = `${product.name} is running low (${product.quantity} remaining, threshold: ${product.lowStockAt})`;
        } else {
          alertType = "restock_needed";
          severity = "info";
          message = `${product.name} may need restocking soon`;
        }

        return {
          id: product.id,
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          lowStockThreshold: product.lowStockAt,
          alertType,
          severity,
          message,
          createdAt: product.createdAt,
        };
      });

    return {
      success: true,
      data: alerts,
    };
  } catch (error) {
    console.error("Error fetching stock alerts:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch stock alerts",
    };
  }
}

/**
 * Get stock alert summary statistics
 */
export async function getStockAlertSummary(): Promise<{
  success: boolean;
  data: {
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    outOfStock: number;
    lowStock: number;
  } | null;
  message?: string;
}> {
  try {
    const user = await requireAuthedUser();

    // Get counts efficiently
    const [outOfStockCount, lowStockProducts] = await Promise.all([
      prisma.product.count({
        where: {
          userId: user.id,
          quantity: 0,
        },
      }),
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::int as count
        FROM "Product"
        WHERE "userId" = ${user.id}
          AND "lowStockAt" IS NOT NULL
          AND "quantity" > 0
          AND "quantity" <= "lowStockAt"
      `,
    ]);

    const lowStockCount = Number(lowStockProducts[0]?.count || 0);
    const totalAlerts = outOfStockCount + lowStockCount;

    // Critical alerts are out of stock or very low stock (below 50% of threshold)
    const criticalProducts = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::int as count
      FROM "Product"
      WHERE "userId" = ${user.id}
        AND (
          "quantity" = 0
          OR (
            "lowStockAt" IS NOT NULL
            AND "quantity" > 0
            AND "quantity" <= ("lowStockAt" * 0.5)
          )
        )
    `;

    const criticalAlerts = Number(criticalProducts[0]?.count || 0);
    const warningAlerts = totalAlerts - criticalAlerts;

    return {
      success: true,
      data: {
        totalAlerts,
        criticalAlerts,
        warningAlerts,
        outOfStock: outOfStockCount,
        lowStock: lowStockCount,
      },
    };
  } catch (error) {
    console.error("Error fetching stock alert summary:", error);
    return {
      success: false,
      data: null,
      message: "Failed to fetch stock alert summary",
    };
  }
}

/**
 * Get products that need reordering based on configurable thresholds
 * This helps with inventory forecasting
 */
export async function getReorderRecommendations(
  daysOfStock: number = 30
): Promise<{
  success: boolean;
  data: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    recommendedOrderQuantity: number;
    estimatedDaysRemaining: number;
  }>;
  message?: string;
}> {
  try {
    const user = await requireAuthedUser();

    // Get products with low stock or at risk
    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
        OR: [
          { quantity: 0 },
          {
            AND: [
              { lowStockAt: { not: null } },
              { quantity: { lte: prisma.product.fields.lowStockAt } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        lowStockAt: true,
      },
    });

    // Calculate reorder recommendations
    const recommendations = products
      .filter((p) => p.quantity === 0 || (p.lowStockAt !== null && p.quantity <= p.lowStockAt))
      .map((product) => {
        // Simple calculation: recommend ordering enough to reach 2x the low stock threshold
        // or a minimum of 10 units if no threshold is set
        const targetStock = product.lowStockAt 
          ? product.lowStockAt * 2 
          : 10;
        
        const recommendedOrderQuantity = Math.max(
          targetStock - product.quantity,
          product.lowStockAt || 5 // Minimum order quantity
        );

        // Estimate days remaining based on threshold
        let estimatedDaysRemaining = 0;
        if (product.quantity > 0 && product.lowStockAt) {
          // Simple estimation: if at threshold, assume 7 days, scale proportionally
          const stockRatio = product.quantity / product.lowStockAt;
          estimatedDaysRemaining = Math.floor(stockRatio * 7);
        }

        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          recommendedOrderQuantity,
          estimatedDaysRemaining,
        };
      })
      .sort((a, b) => a.estimatedDaysRemaining - b.estimatedDaysRemaining);

    return {
      success: true,
      data: recommendations,
    };
  } catch (error) {
    console.error("Error getting reorder recommendations:", error);
    return {
      success: false,
      data: [],
      message: "Failed to get reorder recommendations",
    };
  }
}

/**
 * Set custom alert thresholds for specific products
 */
export async function setProductAlertThreshold(
  productId: string,
  lowStockThreshold: number | null
): Promise<ActionResult> {
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
      return failureResult("Product not found or access denied.");
    }

    // Update threshold
    await prisma.product.update({
      where: { id: productId },
      data: { lowStockAt: lowStockThreshold },
    });

    return successResult(
      lowStockThreshold !== null
        ? `Alert threshold set to ${lowStockThreshold} for ${product.name}`
        : `Alert threshold removed for ${product.name}`
    );
  } catch (error) {
    console.error("Error setting alert threshold:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    return failureResult("Failed to set alert threshold.");
  }
}
