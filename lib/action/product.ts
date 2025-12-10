"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import {
  requireAuthedUser,
  successResult,
  failureResult,
  ActionResult,
} from "@/lib/server/action-utils";
import { parseProductFromFormData } from "@/lib/server/product-mapper";
import {
  upsertProductTransaction,
  deleteProductTransaction,
  adjustStockTransaction,
} from "@/lib/server/product-helpers";
import { cache, cacheKeys, cacheTTL, invalidateUserCache } from "@/lib/utils/cache";
import { measurePerformance } from "@/lib/utils/performance";

/**
 * Create a new product
 */
export async function createProduct(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    // Parse and validate
    const parsed = parseProductFromFormData(formData);
    if (!parsed.success) {
      return failureResult(
        "Validation failed. Please check the form for errors.",
        parsed.errors
      );
    }

    // Create product in transaction
    const result = await upsertProductTransaction({
      userId: user.id,
      productData: parsed.data,
    });

    if (!result.success) {
      return failureResult(result.error, {
        categoryId: [result.error],
      });
    }

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    
    // Invalidate cache after product creation
    invalidateUserCache(user.id);

    return successResult("Product added successfully!");
  } catch (error) {
    console.error("Create product error:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.", {
        user: ["User not found"],
      });
    }
    return failureResult("Failed to create product.", {
      server: ["Failed to create product."],
    });
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    // Extract product ID
    const id = String(formData.get("id") || "").trim();
    if (!id) {
      return failureResult("Product identifier missing.", {
        id: ["Product identifier is required."],
      });
    }

    // Parse and validate
    const parsed = parseProductFromFormData(formData);
    if (!parsed.success) {
      return failureResult(
        "Validation failed. Please check the form for errors.",
        parsed.errors
      );
    }

    // Check if product exists and belongs to user
    const existing = await prisma.product.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return failureResult("Product not found or access denied.", {
        id: ["Product not found or access denied."],
      });
    }

    // Update product in transaction
    const result = await upsertProductTransaction({
      productId: id,
      userId: user.id,
      productData: parsed.data,
      existingProduct: existing,
    });

    if (!result.success) {
      return failureResult(result.error, {
        categoryId: [result.error],
      });
    }

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    
    // Invalidate cache after product update
    invalidateUserCache(user.id);

    return successResult("Product updated successfully.");
  } catch (error) {
    console.error("Update product error:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.", {
        user: ["User not found"],
      });
    }
    return failureResult("Failed to update product.", {
      server: ["Failed to update product."],
    });
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const id = String(formData.get("id") || "").trim();
    if (!id) {
      return failureResult("Product identifier missing.");
    }

    const existing = await prisma.product.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return failureResult("Product not found or access denied.");
    }

    await deleteProductTransaction({
      productId: id,
      userId: user.id,
      productName: existing.name,
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    
    // Invalidate cache after product deletion
    invalidateUserCache(user.id);

    return successResult("Product deleted successfully.");
  } catch (error) {
    console.error("Delete product error:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    return failureResult("Failed to delete product.");
  }
}

/**
 * Adjust stock quantity for a product
 */
export async function adjustStock(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const id = String(formData.get("id") || "").trim();
    if (!id) {
      return failureResult("Product identifier missing.", {
        id: ["Product identifier is required."],
      });
    }

    const adjustment = formData.get("adjustment");
    if (!adjustment) {
      return failureResult("Stock adjustment value is required.", {
        adjustment: ["Stock adjustment is required."],
      });
    }

    const adjustmentValue = Number(adjustment);
    if (isNaN(adjustmentValue)) {
      return failureResult("Invalid adjustment value.", {
        adjustment: ["Adjustment must be a number."],
      });
    }

    const existing = await prisma.product.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return failureResult("Product not found or access denied.", {
        id: ["Product not found or access denied."],
      });
    }

    const result = await adjustStockTransaction({
      productId: id,
      userId: user.id,
      currentQuantity: existing.quantity,
      adjustment: adjustmentValue,
      productName: existing.name,
    });

    if (!result.success) {
      return failureResult("Cannot adjust stock below zero.", {
        adjustment: [result.error],
      });
    }

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    
    // Invalidate cache after stock adjustment
    invalidateUserCache(user.id);

    return successResult(
      `Stock adjusted successfully. New quantity: ${result.newQuantity}`
    );
  } catch (error) {
    console.error("Error adjusting stock:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.", {
        user: ["User not found"],
      });
    }
    return failureResult("Failed to adjust stock.", {
      server: ["Failed to adjust stock."],
    });
  }
}

/**
 * Get low stock products for the current user
 * Optimized: Use database filtering instead of in-memory filtering
 * With caching support
 */
export async function getLowStockProducts() {
  try {
    const user = await requireAuthedUser();
    
    // Try to get from cache first
    const cacheKey = cacheKeys.lowStockProducts(user.id);
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Use Prisma's raw SQL for efficient comparison between columns
    // This avoids fetching all products and filtering in memory
    const lowStockProducts = await measurePerformance(
      "getLowStockProducts",
      async () => {
        return await prisma.$queryRaw`
          SELECT * FROM "Product"
          WHERE "userId" = ${user.id}
            AND "lowStockAt" IS NOT NULL
            AND "quantity" <= "lowStockAt"
          ORDER BY "quantity" ASC
        `;
      }
    );

    const result = {
      success: true,
      data: lowStockProducts,
    };
    
    // Cache the result
    cache.set(cacheKey, result, cacheTTL.lowStock);
    
    return result;
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return {
      success: false,
      message: "Failed to fetch low stock products",
      data: [],
    };
  }
}

/**
 * Get inventory analytics for the current user
 * Optimized: Use database aggregation instead of fetching all records
 * With caching support
 */
export async function getInventoryAnalytics() {
  try {
    const user = await requireAuthedUser();
    
    // Try to get from cache first
    const cacheKey = cacheKeys.analytics(user.id);
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const analyticsData = await measurePerformance(
      "getInventoryAnalytics",
      async () => {
        // Use aggregation for counts and calculations
        const [
          totalProducts,
          totalValueResult,
          lowStockCountResult,
          outOfStockCount,
          categoryStats,
        ] = await Promise.all([
          // Total product count
          prisma.product.count({
            where: { userId: user.id },
          }),
          
          // Total inventory value using aggregate
          prisma.product.aggregate({
            where: { userId: user.id },
            _sum: {
              quantity: true,
            },
          }),
          
          // Low stock count using raw query for efficiency
          prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*)::int as count
            FROM "Product"
            WHERE "userId" = ${user.id}
              AND "lowStockAt" IS NOT NULL
              AND "quantity" <= "lowStockAt"
          `,
          
          // Out of stock count
          prisma.product.count({
            where: {
              userId: user.id,
              quantity: 0,
            },
          }),
          
          // Category-wise aggregation
          prisma.product.groupBy({
            by: ['categoryId'],
            where: { userId: user.id },
            _count: {
              id: true,
            },
          }),
        ]);

        // Fetch products with categories for value calculation
        // Only fetch what we need for category breakdown
        const products = await prisma.product.findMany({
          where: { userId: user.id },
          select: {
            price: true,
            quantity: true,
            categoryId: true,
          },
        });

        const totalValue = products.reduce(
          (sum, product) => sum + Number(product.price) * product.quantity,
          0
        );

        // Get category names efficiently
        const categoryIds = [...new Set(products.map((p) => p.categoryId).filter(Boolean))];
        const categories = await prisma.category.findMany({
          where: {
            id: { in: categoryIds as string[] },
          },
          select: {
            id: true,
            name: true,
          },
        });

        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

        // Calculate value by category
        const valueByCategory = products.reduce(
          (acc, product) => {
            const catName = product.categoryId
              ? categoryMap.get(product.categoryId) || "Uncategorized"
              : "Uncategorized";
            acc[catName] =
              (acc[catName] || 0) + Number(product.price) * product.quantity;
            return acc;
          },
          {} as Record<string, number>
        );

        const lowStockCount = Number(lowStockCountResult[0]?.count || 0);

        return {
          totalProducts,
          totalValue,
          lowStockCount,
          outOfStockCount,
          valueByCategory,
        };
      }
    );

    const result = {
      success: true,
      data: analyticsData,
    };
    
    // Cache the result
    cache.set(cacheKey, result, cacheTTL.analytics);
    
    return result;
  } catch (error) {
    console.error("Error fetching inventory analytics:", error);
    return {
      success: false,
      message: "Failed to fetch inventory analytics",
      data: null,
    };
  }
}

/**
 * Get all products for the current user
 */
export async function getProducts() {
  try {
    const user = await requireAuthedUser();

    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedProducts = products.map((p) => ({
      ...p,
      price: p.price.toNumber(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedProducts,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      message: "Failed to fetch products",
      data: [],
    };
  }
}
