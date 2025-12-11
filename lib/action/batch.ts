"use server";

import { prisma } from "@/lib/prisma/prisma";
import { requireAuthedUser, failureResult } from "@/lib/server/action-utils";
import { logActivity } from "@/lib/logger/logger";
import { BatchSchema } from "@/lib/validations/batch";
import type { ActionResult } from "@/lib/server/action-utils";

/**
 * Create a new batch
 */
export async function createBatch(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const rawData = {
      productId: formData.get("productId"),
      batchNumber: formData.get("batchNumber"),
      quantity: formData.get("quantity") || 0,
      costPrice: formData.get("costPrice") || undefined,
      expiryDate: formData.get("expiryDate") || undefined,
      manufacturingDate: formData.get("manufacturingDate") || undefined,
      purchaseOrderId: formData.get("purchaseOrderId") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = BatchSchema.safeParse(rawData);
    if (!parsed.success) {
      return failureResult(
        "Validation failed",
        parsed.error.flatten().fieldErrors
      );
    }

    const data = parsed.data;

    // Check product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: { id: data.productId, userId: user.id },
    });

    if (!product) {
      return failureResult("Product not found");
    }

    // Check for duplicate batch number
    const existingBatch = await prisma.batch.findFirst({
      where: {
        userId: user.id,
        productId: data.productId,
        batchNumber: data.batchNumber,
      },
    });

    if (existingBatch) {
      return failureResult(
        "A batch with this number already exists for this product",
        {
          batchNumber: ["Batch number already exists"],
        }
      );
    }

    const batch = await prisma.batch.create({
      data: {
        userId: user.id,
        productId: data.productId,
        batchNumber: data.batchNumber,
        quantity: data.quantity,
        costPrice: data.costPrice ?? null,
        expiryDate: data.expiryDate ?? null,
        manufacturingDate: data.manufacturingDate ?? null,
        purchaseOrderId: data.purchaseOrderId ?? null,
        notes: data.notes ?? null,
      },
    });

    // Log stock movement if quantity > 0
    if (data.quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          userId: user.id,
          productId: data.productId,
          batchId: batch.id,
          type: "in",
          quantity: data.quantity,
          reference: batch.batchNumber,
          referenceType: "batch",
          notes: `Initial batch creation`,
        },
      });

      // Update product total quantity
      await prisma.product.update({
        where: { id: data.productId },
        data: { quantity: { increment: data.quantity } },
      });
    }

    await logActivity({
      userId: user.id,
      action: "create",
      entityType: "batch",
      entityId: batch.id,
      note: `Created batch ${batch.batchNumber} for product`,
    });

    return {
      success: true,
      message: "Batch created successfully",
      data: { id: batch.id },
    };
  } catch (error) {
    console.error("Failed to create batch:", error);
    return failureResult("Failed to create batch");
  }
}

/**
 * Update an existing batch
 */
export async function updateBatch(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const id = formData.get("id") as string;
    if (!id) {
      return failureResult("Batch ID is required");
    }

    // Check batch exists and belongs to user
    const existingBatch = await prisma.batch.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingBatch) {
      return failureResult("Batch not found");
    }

    const rawData = {
      productId: existingBatch.productId, // Cannot change product
      batchNumber: formData.get("batchNumber"),
      quantity: existingBatch.quantity, // Quantity changes via adjustments
      costPrice: formData.get("costPrice") || undefined,
      expiryDate: formData.get("expiryDate") || undefined,
      manufacturingDate: formData.get("manufacturingDate") || undefined,
      purchaseOrderId: formData.get("purchaseOrderId") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = BatchSchema.safeParse(rawData);
    if (!parsed.success) {
      return failureResult(
        "Validation failed",
        parsed.error.flatten().fieldErrors
      );
    }

    const data = parsed.data;

    // Check for duplicate batch number if changed
    if (data.batchNumber !== existingBatch.batchNumber) {
      const duplicate = await prisma.batch.findFirst({
        where: {
          userId: user.id,
          productId: existingBatch.productId,
          batchNumber: data.batchNumber,
          id: { not: id },
        },
      });

      if (duplicate) {
        return failureResult("A batch with this number already exists", {
          batchNumber: ["Batch number already exists"],
        });
      }
    }

    await prisma.batch.update({
      where: { id },
      data: {
        batchNumber: data.batchNumber,
        costPrice: data.costPrice ?? null,
        expiryDate: data.expiryDate ?? null,
        manufacturingDate: data.manufacturingDate ?? null,
        purchaseOrderId: data.purchaseOrderId ?? null,
        notes: data.notes ?? null,
      },
    });

    await logActivity({
      userId: user.id,
      action: "update",
      entityType: "batch",
      entityId: id,
      note: `Updated batch ${data.batchNumber}`,
    });

    return {
      success: true,
      message: "Batch updated successfully",
    };
  } catch (error) {
    console.error("Failed to update batch:", error);
    return failureResult("Failed to update batch");
  }
}

/**
 * Adjust batch quantity
 */
export async function adjustBatchQuantity(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const batchId = formData.get("batchId") as string;
    const adjustmentRaw = formData.get("adjustment");
    const reason = formData.get("reason") as string | null;

    if (!batchId) {
      return failureResult("Batch ID is required");
    }

    const adjustment = parseInt(adjustmentRaw as string, 10);
    if (isNaN(adjustment) || adjustment === 0) {
      return failureResult("Valid adjustment quantity is required");
    }

    const batch = await prisma.batch.findFirst({
      where: { id: batchId, userId: user.id },
    });

    if (!batch) {
      return failureResult("Batch not found");
    }

    const newQuantity = batch.quantity + adjustment;
    if (newQuantity < 0) {
      return failureResult("Adjustment would result in negative quantity");
    }

    await prisma.$transaction([
      prisma.batch.update({
        where: { id: batchId },
        data: { quantity: newQuantity },
      }),
      prisma.product.update({
        where: { id: batch.productId },
        data: { quantity: { increment: adjustment } },
      }),
      prisma.stockMovement.create({
        data: {
          userId: user.id,
          productId: batch.productId,
          batchId: batchId,
          type: "adjustment",
          quantity: adjustment,
          reference: batch.batchNumber,
          referenceType: "batch",
          notes: reason ?? `Batch quantity adjustment`,
        },
      }),
    ]);

    await logActivity({
      userId: user.id,
      action: "update",
      entityType: "batch",
      entityId: batchId,
      note: `Adjusted batch ${batch.batchNumber} by ${
        adjustment > 0 ? "+" : ""
      }${adjustment}`,
    });

    return {
      success: true,
      message: `Batch quantity adjusted by ${
        adjustment > 0 ? "+" : ""
      }${adjustment}`,
    };
  } catch (error) {
    console.error("Failed to adjust batch quantity:", error);
    return failureResult("Failed to adjust batch quantity");
  }
}

/**
 * Delete a batch
 */
export async function deleteBatch(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const id = formData.get("id") as string;
    if (!id) {
      return failureResult("Batch ID is required");
    }

    const batch = await prisma.batch.findFirst({
      where: { id, userId: user.id },
    });

    if (!batch) {
      return failureResult("Batch not found");
    }

    if (batch.quantity > 0) {
      return failureResult(
        "Cannot delete batch with remaining quantity. Adjust quantity to 0 first."
      );
    }

    await prisma.batch.delete({ where: { id } });

    await logActivity({
      userId: user.id,
      action: "delete",
      entityType: "batch",
      entityId: id,
      note: `Deleted batch ${batch.batchNumber}`,
    });

    return {
      success: true,
      message: "Batch deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete batch:", error);
    return failureResult("Failed to delete batch");
  }
}

/**
 * Get all batches with filters
 */
export async function getBatches(filters?: {
  productId?: string;
  includeExpired?: boolean;
  expiringWithinDays?: number;
}) {
  try {
    const user = await requireAuthedUser();

    const now = new Date();
    const expiryFilter = filters?.expiringWithinDays
      ? {
          expiryDate: {
            lte: new Date(
              now.getTime() + filters.expiringWithinDays * 24 * 60 * 60 * 1000
            ),
            gte: now,
          },
        }
      : filters?.includeExpired === false
      ? {
          OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
        }
      : {};

    const batches = await prisma.batch.findMany({
      where: {
        userId: user.id,
        ...(filters?.productId ? { productId: filters.productId } : {}),
        ...expiryFilter,
      },
      orderBy: [{ expiryDate: "asc" }, { createdAt: "desc" }],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
    });

    return {
      success: true,
      data: batches.map((b) => ({
        id: b.id,
        productId: b.productId,
        productName: b.product.name,
        productSku: b.product.sku,
        batchNumber: b.batchNumber,
        quantity: b.quantity,
        costPrice: b.costPrice ? Number(b.costPrice) : null,
        expiryDate: b.expiryDate?.toISOString() ?? null,
        manufacturingDate: b.manufacturingDate?.toISOString() ?? null,
        purchaseOrderId: b.purchaseOrderId,
        purchaseOrderNumber: b.purchaseOrder?.orderNumber ?? null,
        notes: b.notes,
        isExpired: b.expiryDate ? b.expiryDate < now : false,
        daysUntilExpiry: b.expiryDate
          ? Math.ceil(
              (b.expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
            )
          : null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to get batches:", error);
    return {
      success: false,
      data: [],
    };
  }
}

/**
 * Get batch by ID
 */
export async function getBatchById(id: string) {
  try {
    const user = await requireAuthedUser();

    const batch = await prisma.batch.findFirst({
      where: { id, userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            type: true,
            quantity: true,
            reference: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!batch) {
      return {
        success: false,
        message: "Batch not found",
      };
    }

    const now = new Date();
    return {
      success: true,
      data: {
        id: batch.id,
        productId: batch.productId,
        productName: batch.product.name,
        productSku: batch.product.sku,
        batchNumber: batch.batchNumber,
        quantity: batch.quantity,
        costPrice: batch.costPrice ? Number(batch.costPrice) : null,
        expiryDate: batch.expiryDate?.toISOString() ?? null,
        manufacturingDate: batch.manufacturingDate?.toISOString() ?? null,
        purchaseOrderId: batch.purchaseOrderId,
        purchaseOrderNumber: batch.purchaseOrder?.orderNumber ?? null,
        notes: batch.notes,
        isExpired: batch.expiryDate ? batch.expiryDate < now : false,
        daysUntilExpiry: batch.expiryDate
          ? Math.ceil(
              (batch.expiryDate.getTime() - now.getTime()) /
                (24 * 60 * 60 * 1000)
            )
          : null,
        stockMovements: batch.stockMovements.map((m) => ({
          id: m.id,
          type: m.type,
          quantity: m.quantity,
          reference: m.reference,
          notes: m.notes,
          createdAt: m.createdAt.toISOString(),
        })),
        createdAt: batch.createdAt.toISOString(),
        updatedAt: batch.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Failed to get batch:", error);
    return {
      success: false,
      message: "Failed to fetch batch",
    };
  }
}

/**
 * Get expiring batches (alerts)
 */
export async function getExpiringBatches(daysAhead: number = 30) {
  try {
    const user = await requireAuthedUser();
    const now = new Date();
    const futureDate = new Date(
      now.getTime() + daysAhead * 24 * 60 * 60 * 1000
    );

    const batches = await prisma.batch.findMany({
      where: {
        userId: user.id,
        quantity: { gt: 0 },
        expiryDate: {
          lte: futureDate,
          gte: now,
        },
      },
      orderBy: { expiryDate: "asc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    // Also get already expired batches with stock
    const expiredBatches = await prisma.batch.findMany({
      where: {
        userId: user.id,
        quantity: { gt: 0 },
        expiryDate: { lt: now },
      },
      orderBy: { expiryDate: "asc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        expiring: batches.map((b) => ({
          id: b.id,
          productId: b.productId,
          productName: b.product.name,
          productSku: b.product.sku,
          batchNumber: b.batchNumber,
          quantity: b.quantity,
          expiryDate: b.expiryDate!.toISOString(),
          daysUntilExpiry: Math.ceil(
            (b.expiryDate!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          ),
        })),
        expired: expiredBatches.map((b) => ({
          id: b.id,
          productId: b.productId,
          productName: b.product.name,
          productSku: b.product.sku,
          batchNumber: b.batchNumber,
          quantity: b.quantity,
          expiryDate: b.expiryDate!.toISOString(),
          daysExpired: Math.ceil(
            (now.getTime() - b.expiryDate!.getTime()) / (24 * 60 * 60 * 1000)
          ),
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get expiring batches:", error);
    return {
      success: false,
      data: { expiring: [], expired: [] },
    };
  }
}
