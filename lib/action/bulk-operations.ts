"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import {
  requireAuthedUser,
  successResult,
  failureResult,
  ActionResult,
} from "@/lib/server/action-utils";
import { logActivity } from "@/lib/logger/logger";

/**
 * Bulk update products
 * Allows updating multiple products at once with the same field values
 */
export async function bulkUpdateProducts(
  productIds: string[],
  updates: {
    categoryId?: string;
    condition?: string;
    location?: string;
    manufacturer?: string;
    lowStockAt?: number;
  }
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    if (!productIds || productIds.length === 0) {
      return failureResult("No products selected for update.");
    }

    // Verify all products belong to the user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId: user.id,
      },
    });

    if (products.length !== productIds.length) {
      return failureResult("Some products not found or access denied.");
    }

    // Perform bulk update in transaction
    await prisma.$transaction(async (tx) => {
      // Update products
      await tx.product.updateMany({
        where: {
          id: { in: productIds },
          userId: user.id,
        },
        data: updates,
      });

      // Log activity
      await logActivity({
        userId: user.id,
        actorId: user.id,
        entityType: "product",
        entityId: productIds[0], // Log first product ID as reference
        action: "update",
        changes: {
          operation: "bulk_update",
          productIds,
          updates,
          count: productIds.length,
        },
        note: `Bulk updated ${productIds.length} products`,
        tx,
      });
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return successResult(`Successfully updated ${productIds.length} products.`);
  } catch (error) {
    console.error("Bulk update error:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    return failureResult("Failed to update products.");
  }
}

/**
 * Bulk delete products
 * Allows deleting multiple products at once
 */
export async function bulkDeleteProducts(
  productIds: string[]
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    if (!productIds || productIds.length === 0) {
      return failureResult("No products selected for deletion.");
    }

    // Verify all products belong to the user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (products.length !== productIds.length) {
      return failureResult("Some products not found or access denied.");
    }

    // Perform bulk delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete products
      await tx.product.deleteMany({
        where: {
          id: { in: productIds },
          userId: user.id,
        },
      });

      // Log activity
      await logActivity({
        userId: user.id,
        actorId: user.id,
        entityType: "product",
        entityId: productIds[0], // Log first product ID as reference
        action: "delete",
        changes: {
          operation: "bulk_delete",
          productIds,
          productNames: products.map((p) => p.name),
          count: productIds.length,
        },
        note: `Bulk deleted ${productIds.length} products`,
        tx,
      });
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return successResult(`Successfully deleted ${productIds.length} products.`);
  } catch (error) {
    console.error("Bulk delete error:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    return failureResult("Failed to delete products.");
  }
}

/**
 * Bulk adjust stock for multiple products
 * Allows adjusting stock for multiple products at once
 */
export async function bulkAdjustStock(
  adjustments: Array<{
    productId: string;
    adjustment: number;
  }>
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    if (!adjustments || adjustments.length === 0) {
      return failureResult("No stock adjustments provided.");
    }

    const productIds = adjustments.map((a) => a.productId);

    // Verify all products belong to the user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        quantity: true,
      },
    });

    if (products.length !== productIds.length) {
      return failureResult("Some products not found or access denied.");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate adjustments won't result in negative stock
    for (const adj of adjustments) {
      const product = productMap.get(adj.productId);
      if (!product) continue;
      
      const newQuantity = product.quantity + adj.adjustment;
      if (newQuantity < 0) {
        return failureResult(
          `Cannot adjust stock below zero for product: ${product.name}`
        );
      }
    }

    // Perform bulk stock adjustment in transaction
    await prisma.$transaction(async (tx) => {
      // Update each product's stock
      for (const adj of adjustments) {
        const product = productMap.get(adj.productId);
        if (!product) continue;

        await tx.product.update({
          where: { id: adj.productId },
          data: {
            quantity: {
              increment: adj.adjustment,
            },
          },
        });
      }

      // Log activity
      await logActivity({
        userId: user.id,
        actorId: user.id,
        entityType: "product",
        entityId: adjustments[0].productId, // Log first product ID as reference
        action: "stock_adjustment",
        changes: {
          operation: "bulk_stock_adjustment",
          adjustments: adjustments.map((adj) => ({
            productId: adj.productId,
            productName: productMap.get(adj.productId)?.name,
            adjustment: adj.adjustment,
            previousQuantity: productMap.get(adj.productId)?.quantity,
            newQuantity:
              (productMap.get(adj.productId)?.quantity || 0) + adj.adjustment,
          })),
          count: adjustments.length,
        },
        note: `Bulk adjusted stock for ${adjustments.length} products`,
        tx,
      });
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return successResult(
      `Successfully adjusted stock for ${adjustments.length} products.`
    );
  } catch (error) {
    console.error("Bulk stock adjustment error:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    return failureResult("Failed to adjust stock.");
  }
}

/**
 * Bulk import products from CSV/Excel data
 * Allows importing multiple products at once
 */
export async function bulkImportProducts(
  productsData: Array<{
    name: string;
    manufacturer: string;
    sku?: string;
    model?: string;
    quantity?: number;
    price?: number;
    condition?: string;
    location?: string;
    categoryName?: string;
    lowStockAt?: number;
    supplier?: string;
    warrantyMonths?: number;
    specs?: string;
    compatibility?: string;
    notes?: string;
  }>
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    if (!productsData || productsData.length === 0) {
      return failureResult("No product data provided for import.");
    }

    // Validate required fields
    const errors: string[] = [];
    productsData.forEach((product, index) => {
      if (!product.name?.trim()) {
        errors.push(`Row ${index + 1}: Product name is required`);
      }
      if (!product.manufacturer?.trim()) {
        errors.push(`Row ${index + 1}: Manufacturer is required`);
      }
    });

    if (errors.length > 0) {
      return failureResult("Validation errors in import data.", {
        import: errors,
      });
    }

    // Get or create categories
    const categoryNames = [
      ...new Set(
        productsData
          .map((p) => p.categoryName?.trim())
          .filter((c): c is string => !!c)
      ),
    ];

    const existingCategories = await prisma.category.findMany({
      where: {
        userId: user.id,
        name: { in: categoryNames },
      },
    });

    const categoryMap = new Map(
      existingCategories.map((c) => [c.name, c.id])
    );

    // Create new categories if needed
    const newCategories = categoryNames.filter((name) => !categoryMap.has(name));
    if (newCategories.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const name of newCategories) {
          const category = await tx.category.create({
            data: {
              userId: user.id,
              name,
            },
          });
          categoryMap.set(name, category.id);
        }
      });
    }

    // Import products in transaction
    let firstProductId: string | null = null;
    const importedCount = await prisma.$transaction(async (tx) => {
      let count = 0;

      for (const productData of productsData) {
        const categoryId = productData.categoryName
          ? categoryMap.get(productData.categoryName.trim())
          : null;

        const product = await tx.product.create({
          data: {
            userId: user.id,
            name: productData.name.trim(),
            manufacturer: productData.manufacturer.trim(),
            sku: productData.sku?.trim() || null,
            model: productData.model?.trim() || null,
            quantity: productData.quantity || 0,
            price: productData.price || 0,
            condition: productData.condition?.trim() || "new",
            location: productData.location?.trim() || null,
            categoryId: categoryId || null,
            lowStockAt: productData.lowStockAt || null,
            supplier: productData.supplier?.trim() || null,
            warrantyMonths: productData.warrantyMonths || null,
            specs: productData.specs?.trim() || null,
            compatibility: productData.compatibility?.trim() || null,
            notes: productData.notes?.trim() || null,
          },
        });

        if (count === 0) {
          firstProductId = product.id; // Store first product ID for logging
        }

        count++;
      }

      // Log activity
      await logActivity({
        userId: user.id,
        actorId: user.id,
        entityType: "product",
        entityId: firstProductId || "unknown",
        action: "create",
        changes: {
          operation: "bulk_import",
          count,
          categories: categoryNames,
        },
        note: `Bulk imported ${count} products`,
        tx,
      });

      return count;
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return successResult(
      `Successfully imported ${importedCount} products.`,
      { importedCount }
    );
  } catch (error) {
    console.error("Bulk import error:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    // Don't expose detailed error messages in production
    const errorMessage = process.env.NODE_ENV === "development" 
      ? (error instanceof Error ? error.message : "Unknown error")
      : "An error occurred during import";
    return failureResult("Failed to import products. " + errorMessage);
  }
}
