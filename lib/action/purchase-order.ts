"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import {
  requireAuthedUser,
  successResult,
  failureResult,
  ActionResult,
} from "@/lib/server/action-utils";
import {
  PurchaseOrderSchema,
  ReceivePurchaseOrderSchema,
  type PurchaseOrderInput,
  type ReceivePurchaseOrderInput,
  type POStatus,
} from "@/lib/validations/purchase-order";
import { logActivity } from "@/lib/logger/logger";
import { Prisma } from "../../app/generated/prisma/client";

/**
 * Generate a unique order number
 */
async function generateOrderNumber(userId: string): Promise<string> {
  const today = new Date();
  const prefix = `PO-${today.getFullYear()}${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  // Find the latest order number with this prefix
  const latestOrder = await prisma.purchaseOrder.findFirst({
    where: {
      userId,
      orderNumber: { startsWith: prefix },
    },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let sequence = 1;
  if (latestOrder?.orderNumber) {
    const lastSequence = parseInt(latestOrder.orderNumber.slice(-4), 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Create a new purchase order
 */
export async function createPurchaseOrder(
  data: PurchaseOrderInput
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const parsed = PurchaseOrderSchema.safeParse(data);
    if (!parsed.success) {
      return failureResult(
        "Validation failed. Please check the form for errors."
      );
    }

    const { supplierId, expectedDate, notes, items, tax, shippingCost } =
      parsed.data;

    // Verify supplier exists and belongs to user
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, userId: user.id },
    });

    if (!supplier) {
      return failureResult("Supplier not found.", {
        supplierId: ["Supplier not found."],
      });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.orderedQuantity * item.unitCost,
      0
    );
    const totalAmount = subtotal + (tax || 0) + (shippingCost || 0);

    // Generate order number
    const orderNumber = await generateOrderNumber(user.id);

    // Create purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        userId: user.id,
        supplierId,
        orderNumber,
        status: "draft",
        expectedDate,
        notes,
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(tax || 0),
        shippingCost: new Prisma.Decimal(shippingCost || 0),
        totalAmount: new Prisma.Decimal(totalAmount),
        items: {
          create: items.map((item) => ({
            productId: item.productId || null,
            productName: item.productName,
            sku: item.sku || null,
            orderedQuantity: item.orderedQuantity,
            receivedQuantity: 0,
            unitCost: new Prisma.Decimal(item.unitCost),
            totalCost: new Prisma.Decimal(item.orderedQuantity * item.unitCost),
          })),
        },
      },
      include: { items: true },
    });

    // Log activity
    await logActivity({
      userId: user.id,
      entityType: "purchase_order",
      entityId: purchaseOrder.id,
      action: "create",
      note: `Created purchase order ${orderNumber}`,
    });

    revalidatePath("/purchase-orders");

    return successResult(`Purchase order ${orderNumber} created successfully!`);
  } catch (error) {
    console.error("Failed to create purchase order:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    return failureResult("Failed to create purchase order.");
  }
}

/**
 * Update purchase order status
 */
export async function updatePurchaseOrderStatus(
  purchaseOrderId: string,
  status: POStatus
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const existing = await prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, userId: user.id },
    });

    if (!existing) {
      return failureResult("Purchase order not found.");
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ["ordered", "cancelled"],
      ordered: ["partial", "received", "cancelled"],
      partial: ["received", "cancelled"],
      received: [], // Terminal state
      cancelled: [], // Terminal state
    };

    if (!validTransitions[existing.status]?.includes(status)) {
      return failureResult(
        `Cannot change status from "${existing.status}" to "${status}".`
      );
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        status,
        ...(status === "ordered" ? { orderDate: new Date() } : {}),
        ...(status === "received" ? { receivedDate: new Date() } : {}),
      },
    });

    await logActivity({
      userId: user.id,
      entityType: "purchase_order",
      entityId: purchaseOrder.id,
      action: "update",
      note: `Changed status from "${existing.status}" to "${status}"`,
    });

    revalidatePath("/purchase-orders");
    revalidatePath(`/purchase-orders/${purchaseOrderId}`);

    return successResult(`Status updated to "${status}".`);
  } catch (error) {
    console.error("Failed to update purchase order status:", error);
    return failureResult("Failed to update status.");
  }
}

/**
 * Receive items from a purchase order
 */
export async function receivePurchaseOrderItems(
  data: ReceivePurchaseOrderInput
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const parsed = ReceivePurchaseOrderSchema.safeParse(data);
    if (!parsed.success) {
      return failureResult("Validation failed.");
    }

    const { purchaseOrderId, items } = parsed.data;

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, userId: user.id },
      include: { items: true },
    });

    if (!purchaseOrder) {
      return failureResult("Purchase order not found.");
    }

    if (purchaseOrder.status === "cancelled") {
      return failureResult("Cannot receive items for a cancelled order.");
    }

    if (purchaseOrder.status === "received") {
      return failureResult("This order has already been fully received.");
    }

    // Process each item
    await prisma.$transaction(async (tx) => {
      for (const receivedItem of items) {
        const orderItem = purchaseOrder.items.find(
          (i) => i.id === receivedItem.itemId
        );

        if (!orderItem) continue;

        const newReceivedQty =
          orderItem.receivedQuantity + receivedItem.receivedQuantity;
        const maxReceivable = orderItem.orderedQuantity;

        if (newReceivedQty > maxReceivable) {
          throw new Error(
            `Cannot receive more than ordered for "${orderItem.productName}"`
          );
        }

        // Update the item's received quantity
        await tx.purchaseOrderItem.update({
          where: { id: orderItem.id },
          data: { receivedQuantity: newReceivedQty },
        });

        // Update product stock if productId exists
        if (orderItem.productId && receivedItem.receivedQuantity > 0) {
          await tx.product.update({
            where: { id: orderItem.productId },
            data: {
              quantity: { increment: receivedItem.receivedQuantity },
            },
          });

          // Log stock movement
          await tx.stockMovement.create({
            data: {
              userId: user.id,
              productId: orderItem.productId,
              type: "receive",
              quantity: receivedItem.receivedQuantity,
              reference: purchaseOrder.orderNumber,
              notes: `Received from PO ${purchaseOrder.orderNumber}`,
            },
          });
        }
      }

      // Check if all items are fully received
      const updatedItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId },
      });

      const allReceived = updatedItems.every(
        (item) => item.receivedQuantity >= item.orderedQuantity
      );
      const someReceived = updatedItems.some(
        (item) => item.receivedQuantity > 0
      );

      let newStatus = purchaseOrder.status;
      if (allReceived) {
        newStatus = "received";
      } else if (someReceived) {
        newStatus = "partial";
      }

      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          status: newStatus,
          ...(newStatus === "received" ? { receivedDate: new Date() } : {}),
        },
      });
    });

    await logActivity({
      userId: user.id,
      entityType: "purchase_order",
      entityId: purchaseOrderId,
      action: "update",
      note: `Received items for PO ${purchaseOrder.orderNumber}`,
    });

    revalidatePath("/purchase-orders");
    revalidatePath(`/purchase-orders/${purchaseOrderId}`);
    revalidatePath("/inventory");

    return successResult("Items received successfully!");
  } catch (error) {
    console.error("Failed to receive items:", error);
    if (error instanceof Error) {
      return failureResult(error.message);
    }
    return failureResult("Failed to receive items.");
  }
}

/**
 * Delete a purchase order (only draft orders)
 */
export async function deletePurchaseOrder(
  purchaseOrderId: string
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const existing = await prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, userId: user.id },
    });

    if (!existing) {
      return failureResult("Purchase order not found.");
    }

    if (existing.status !== "draft") {
      return failureResult("Only draft orders can be deleted.");
    }

    await prisma.purchaseOrder.delete({
      where: { id: purchaseOrderId },
    });

    await logActivity({
      userId: user.id,
      entityType: "purchase_order",
      entityId: purchaseOrderId,
      action: "delete",
      note: `Deleted purchase order ${existing.orderNumber}`,
    });

    revalidatePath("/purchase-orders");

    return successResult("Purchase order deleted successfully!");
  } catch (error) {
    console.error("Failed to delete purchase order:", error);
    return failureResult("Failed to delete purchase order.");
  }
}

/**
 * Get all purchase orders for the current user
 */
export async function getPurchaseOrders(filters?: {
  status?: POStatus;
  supplierId?: string;
}) {
  try {
    const user = await requireAuthedUser();

    const where: Prisma.PurchaseOrderWhereInput = {
      userId: user.id,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.supplierId ? { supplierId: filters.supplierId } : {}),
    };

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return {
      success: true,
      message: "Purchase orders fetched successfully",
      data: purchaseOrders.map((po) => ({
        id: po.id,
        orderNumber: po.orderNumber,
        status: po.status as POStatus,
        supplierName: po.supplier.name,
        supplierId: po.supplierId,
        itemCount: po._count.items,
        subtotal: Number(po.subtotal),
        tax: Number(po.tax),
        shippingCost: Number(po.shippingCost),
        totalAmount: Number(po.totalAmount),
        orderDate: po.orderDate.toISOString(),
        expectedDate: po.expectedDate?.toISOString() ?? null,
        receivedDate: po.receivedDate?.toISOString() ?? null,
        createdAt: po.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to get purchase orders:", error);
    return {
      success: false,
      message: "Failed to fetch purchase orders",
      data: [],
    };
  }
}

/**
 * Get a purchase order by ID with full details
 */
export async function getPurchaseOrderById(id: string) {
  try {
    const user = await requireAuthedUser();

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id, userId: user.id },
      include: {
        supplier: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, quantity: true },
            },
          },
        },
      },
    });

    if (!purchaseOrder) {
      return {
        success: false,
        message: "Purchase order not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Purchase order fetched successfully",
      data: {
        id: purchaseOrder.id,
        orderNumber: purchaseOrder.orderNumber,
        status: purchaseOrder.status as POStatus,
        supplier: purchaseOrder.supplier,
        items: purchaseOrder.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          unitCost: Number(item.unitCost),
          totalCost: Number(item.totalCost),
          currentStock: item.product?.quantity ?? null,
        })),
        subtotal: Number(purchaseOrder.subtotal),
        tax: Number(purchaseOrder.tax),
        shippingCost: Number(purchaseOrder.shippingCost),
        totalAmount: Number(purchaseOrder.totalAmount),
        notes: purchaseOrder.notes,
        orderDate: purchaseOrder.orderDate.toISOString(),
        expectedDate: purchaseOrder.expectedDate?.toISOString() ?? null,
        receivedDate: purchaseOrder.receivedDate?.toISOString() ?? null,
        createdAt: purchaseOrder.createdAt.toISOString(),
        updatedAt: purchaseOrder.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Failed to get purchase order:", error);
    return {
      success: false,
      message: "Failed to fetch purchase order",
      data: null,
    };
  }
}
