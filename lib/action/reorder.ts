"use server";

import { prisma } from "@/lib/prisma/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/logger/logger";

// ====================
// Types
// ====================

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  supplierId: string | null;
  supplierName: string | null;
  ruleId: string | null;
  isAutomatic: boolean;
  urgency: "critical" | "warning" | "normal";
}

export interface ReorderRuleRecord {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  reorderPoint: number;
  reorderQuantity: number;
  supplierId: string | null;
  supplierName: string | null;
  isActive: boolean;
  createdAt: string;
}

// ====================
// Validation Schemas
// ====================

const ReorderRuleCreateSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  reorderPoint: z.coerce
    .number()
    .int()
    .min(0, "Reorder point must be 0 or greater"),
  reorderQuantity: z.coerce
    .number()
    .int()
    .min(1, "Reorder quantity must be at least 1"),
  supplierId: z.string().optional(),
  isActive: z.coerce.boolean().optional().default(true),
});

const ReorderRuleUpdateSchema = ReorderRuleCreateSchema.extend({
  id: z.string().min(1, "Rule ID is required"),
});

// ====================
// Helper Functions
// ====================

function calculateUrgency(
  current: number,
  reorderPoint: number
): "critical" | "warning" | "normal" {
  if (current === 0) return "critical";
  const ratio = current / reorderPoint;
  if (ratio <= 0.5) return "critical";
  if (ratio <= 1) return "warning";
  return "normal";
}

// ====================
// Server Actions
// ====================

/**
 * Get all reorder suggestions based on active rules and current stock levels
 */
export async function getReorderSuggestions(): Promise<{
  success: boolean;
  data?: ReorderSuggestion[];
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    // Fetch all active reorder rules with product and supplier info
    const rules = await prisma.reorderRule.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            lowStockAt: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Also get products with lowStockAt but no reorder rule
    const productsWithoutRules = await prisma.product.findMany({
      where: {
        userId: session.user.id,
        lowStockAt: { not: null },
        reorderRule: null,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        lowStockAt: true,
        supplierId: true,
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const suggestions: ReorderSuggestion[] = [];

    // Process rules-based suggestions
    for (const rule of rules) {
      if (rule.product.quantity <= rule.reorderPoint) {
        suggestions.push({
          productId: rule.product.id,
          productName: rule.product.name,
          sku: rule.product.sku,
          currentStock: rule.product.quantity,
          reorderPoint: rule.reorderPoint,
          suggestedQuantity: rule.reorderQuantity,
          supplierId: rule.supplier?.id ?? null,
          supplierName: rule.supplier?.name ?? null,
          ruleId: rule.id,
          isAutomatic: false, // Simplified for now
          urgency: calculateUrgency(rule.product.quantity, rule.reorderPoint),
        });
      }
    }

    // Process products with lowStockAt but no custom rule
    for (const product of productsWithoutRules) {
      if (product.lowStockAt && product.quantity <= product.lowStockAt) {
        suggestions.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: product.quantity,
          reorderPoint: product.lowStockAt,
          suggestedQuantity: Math.max(10, product.lowStockAt * 2), // Default: 2x threshold
          supplierId: product.supplier?.id ?? null,
          supplierName: product.supplier?.name ?? null,
          ruleId: null,
          isAutomatic: false,
          urgency: calculateUrgency(product.quantity, product.lowStockAt),
        });
      }
    }

    // Sort by urgency (critical first)
    const urgencyOrder = { critical: 0, warning: 1, normal: 2 };
    suggestions.sort(
      (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    );

    return { success: true, data: suggestions };
  } catch (error) {
    console.error("Error getting reorder suggestions:", error);
    return { success: false, message: "Failed to get reorder suggestions" };
  }
}

/**
 * Get all reorder rules for the current user
 */
export async function getReorderRules(): Promise<{
  success: boolean;
  data?: ReorderRuleRecord[];
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const rules = await prisma.reorderRule.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data: ReorderRuleRecord[] = rules.map((rule) => ({
      id: rule.id,
      productId: rule.productId,
      productName: rule.product.name,
      productSku: rule.product.sku,
      reorderPoint: rule.reorderPoint,
      reorderQuantity: rule.reorderQuantity,
      supplierId: rule.supplierId,
      supplierName: rule.supplier?.name ?? null,
      isActive: rule.isActive,
      createdAt: rule.createdAt.toISOString(),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error getting reorder rules:", error);
    return { success: false, message: "Failed to get reorder rules" };
  }
}

/**
 * Create a new reorder rule
 */
export async function createReorderRule(formData: FormData): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const rawData = {
      productId: formData.get("productId"),
      reorderPoint: formData.get("reorderPoint"),
      reorderQuantity: formData.get("reorderQuantity"),
      supplierId: formData.get("supplierId") || undefined,
      isActive: formData.get("isActive") !== "false",
    };

    const validatedData = ReorderRuleCreateSchema.parse(rawData);

    // Check if rule already exists for this product
    const existing = await prisma.reorderRule.findUnique({
      where: {
        productId: validatedData.productId,
      },
    });

    if (existing) {
      return {
        success: false,
        message: "A reorder rule already exists for this product",
      };
    }

    await prisma.reorderRule.create({
      data: {
        userId: session.user.id,
        productId: validatedData.productId,
        reorderPoint: validatedData.reorderPoint,
        reorderQuantity: validatedData.reorderQuantity,
        supplierId: validatedData.supplierId || null,
        isActive: validatedData.isActive,
      },
    });

    await logActivity({
      userId: session.user.id,
      entityType: "reorder_rule",
      action: "create",
      note: `Created reorder rule for product`,
    });

    revalidatePath("/stock/reorder");
    return { success: true, message: "Reorder rule created successfully" };
  } catch (error) {
    console.error("Error creating reorder rule:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message };
    }
    return { success: false, message: "Failed to create reorder rule" };
  }
}

/**
 * Update an existing reorder rule
 */
export async function updateReorderRule(formData: FormData): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const rawData = {
      id: formData.get("id"),
      productId: formData.get("productId"),
      reorderPoint: formData.get("reorderPoint"),
      reorderQuantity: formData.get("reorderQuantity"),
      supplierId: formData.get("supplierId") || undefined,
      isActive: formData.get("isActive") !== "false",
    };

    const validatedData = ReorderRuleUpdateSchema.parse(rawData);

    // Verify ownership
    const rule = await prisma.reorderRule.findFirst({
      where: {
        id: validatedData.id,
        userId: session.user.id,
      },
    });

    if (!rule) {
      return { success: false, message: "Reorder rule not found" };
    }

    await prisma.reorderRule.update({
      where: { id: validatedData.id },
      data: {
        reorderPoint: validatedData.reorderPoint,
        reorderQuantity: validatedData.reorderQuantity,
        supplierId: validatedData.supplierId || null,
        isActive: validatedData.isActive,
      },
    });

    await logActivity({
      userId: session.user.id,
      entityType: "reorder_rule",
      entityId: validatedData.id,
      action: "update",
      note: `Updated reorder rule`,
    });

    revalidatePath("/stock/reorder");
    return { success: true, message: "Reorder rule updated successfully" };
  } catch (error) {
    console.error("Error updating reorder rule:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message };
    }
    return { success: false, message: "Failed to update reorder rule" };
  }
}

/**
 * Delete a reorder rule
 */
export async function deleteReorderRule(formData: FormData): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const id = formData.get("id") as string;
    if (!id) {
      return { success: false, message: "Rule ID is required" };
    }

    // Verify ownership
    const rule = await prisma.reorderRule.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!rule) {
      return { success: false, message: "Reorder rule not found" };
    }

    await prisma.reorderRule.delete({
      where: { id },
    });

    await logActivity({
      userId: session.user.id,
      entityType: "reorder_rule",
      entityId: id,
      action: "delete",
      note: `Deleted reorder rule`,
    });

    revalidatePath("/stock/reorder");
    return { success: true, message: "Reorder rule deleted successfully" };
  } catch (error) {
    console.error("Error deleting reorder rule:", error);
    return { success: false, message: "Failed to delete reorder rule" };
  }
}

/**
 * Toggle a reorder rule's active status
 */
export async function toggleReorderRule(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const rule = await prisma.reorderRule.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!rule) {
      return { success: false, message: "Reorder rule not found" };
    }

    await prisma.reorderRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });

    revalidatePath("/stock/reorder");
    return {
      success: true,
      message: `Reorder rule ${rule.isActive ? "disabled" : "enabled"}`,
    };
  } catch (error) {
    console.error("Error toggling reorder rule:", error);
    return { success: false, message: "Failed to toggle reorder rule" };
  }
}

/**
 * Get reorder summary stats
 */
export async function getReorderStats(): Promise<{
  success: boolean;
  data?: {
    totalRules: number;
    activeRules: number;
    pendingSuggestions: number;
    criticalItems: number;
  };
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const [totalRules, activeRules] = await Promise.all([
      prisma.reorderRule.count({ where: { userId: session.user.id } }),
      prisma.reorderRule.count({
        where: { userId: session.user.id, isActive: true },
      }),
    ]);

    // Get suggestions to count pending and critical
    const suggestionsResult = await getReorderSuggestions();
    const suggestions = suggestionsResult.data || [];

    return {
      success: true,
      data: {
        totalRules,
        activeRules,
        pendingSuggestions: suggestions.length,
        criticalItems: suggestions.filter((s) => s.urgency === "critical")
          .length,
      },
    };
  } catch (error) {
    console.error("Error getting reorder stats:", error);
    return { success: false, message: "Failed to get reorder stats" };
  }
}
