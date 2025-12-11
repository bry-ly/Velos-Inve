"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import {
  requireAuthedUser,
  successResult,
  failureResult,
  formatZodErrors,
  ActionResult,
} from "@/lib/server/action-utils";
import { SupplierSchema, type SupplierInput } from "@/lib/validations/supplier";
import { logActivity } from "@/lib/logger/logger";

/**
 * Create a new supplier
 */
export async function createSupplier(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();
    const userId = user.id;

    // Parse form data
    const rawData: SupplierInput = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      contactPerson: formData.get("contactPerson") as string,
      notes: formData.get("notes") as string,
    };

    // Validate
    const result = SupplierSchema.safeParse(rawData);
    if (!result.success) {
      return failureResult(
        "Validation failed",
        formatZodErrors(result.error.issues)
      );
    }

    const data = result.data;

    // Check for duplicate name
    const existing = await prisma.supplier.findUnique({
      where: { userId_name: { userId, name: data.name } },
    });

    if (existing) {
      return failureResult("A supplier with this name already exists", {
        name: ["A supplier with this name already exists"],
      });
    }

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        contactPerson: data.contactPerson,
        notes: data.notes,
      },
    });

    // Log activity
    await logActivity({
      userId,
      entityType: "supplier",
      entityId: supplier.id,
      action: "create",
      changes: { name: data.name },
    });

    revalidatePath("/suppliers");
    return successResult("Supplier created successfully", { id: supplier.id });
  } catch (error) {
    console.error("Failed to create supplier:", error);
    return failureResult(
      error instanceof Error ? error.message : "Failed to create supplier"
    );
  }
}

/**
 * Update an existing supplier
 */
export async function updateSupplier(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();
    const userId = user.id;

    const supplierId = formData.get("id") as string;
    if (!supplierId) {
      return failureResult("Supplier ID is required");
    }

    // Parse form data
    const rawData: SupplierInput = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      contactPerson: formData.get("contactPerson") as string,
      notes: formData.get("notes") as string,
    };

    // Validate
    const result = SupplierSchema.safeParse(rawData);
    if (!result.success) {
      return failureResult(
        "Validation failed",
        formatZodErrors(result.error.issues)
      );
    }

    const data = result.data;

    // Check if supplier exists and belongs to user
    const existing = await prisma.supplier.findFirst({
      where: { id: supplierId, userId },
    });

    if (!existing) {
      return failureResult("Supplier not found");
    }

    // Check for duplicate name (excluding current supplier)
    if (data.name !== existing.name) {
      const duplicate = await prisma.supplier.findUnique({
        where: { userId_name: { userId, name: data.name } },
      });

      if (duplicate) {
        return failureResult("A supplier with this name already exists", {
          name: ["A supplier with this name already exists"],
        });
      }
    }

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        contactPerson: data.contactPerson,
        notes: data.notes,
      },
    });

    // Log activity
    await logActivity({
      userId,
      entityType: "supplier",
      entityId: supplier.id,
      action: "update",
      changes: { before: existing, after: data },
    });

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${supplierId}`);
    return successResult("Supplier updated successfully");
  } catch (error) {
    console.error("Failed to update supplier:", error);
    return failureResult(
      error instanceof Error ? error.message : "Failed to update supplier"
    );
  }
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();
    const userId = user.id;

    const supplierId = formData.get("id") as string;
    if (!supplierId) {
      return failureResult("Supplier ID is required");
    }

    // Check if supplier exists and belongs to user
    const existing = await prisma.supplier.findFirst({
      where: { id: supplierId, userId },
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
    });

    if (!existing) {
      return failureResult("Supplier not found");
    }

    // Check if supplier has active purchase orders
    if (existing._count.purchaseOrders > 0) {
      return failureResult(
        `Cannot delete supplier with ${existing._count.purchaseOrders} purchase order(s). Please delete or reassign the purchase orders first.`
      );
    }

    // Delete supplier (products will have supplierId set to null)
    await prisma.supplier.delete({
      where: { id: supplierId },
    });

    // Log activity
    await logActivity({
      userId,
      entityType: "supplier",
      entityId: supplierId,
      action: "delete",
      changes: { name: existing.name },
    });

    revalidatePath("/suppliers");
    return successResult("Supplier deleted successfully");
  } catch (error) {
    console.error("Failed to delete supplier:", error);
    return failureResult(
      error instanceof Error ? error.message : "Failed to delete supplier"
    );
  }
}

/**
 * Get all suppliers for the current user
 */
export async function getSuppliers(): Promise<
  ActionResult<{
    suppliers: Array<{
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      address: string | null;
      contactPerson: string | null;
      notes: string | null;
      productCount: number;
      purchaseOrderCount: number;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>
> {
  try {
    const user = await requireAuthedUser();
    const userId = user.id;

    const suppliers = await prisma.supplier.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
    });

    return successResult("Suppliers retrieved", {
      suppliers: suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        address: s.address,
        contactPerson: s.contactPerson,
        notes: s.notes,
        productCount: s._count.products,
        purchaseOrderCount: s._count.purchaseOrders,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to get suppliers:", error);
    return failureResult(
      error instanceof Error ? error.message : "Failed to get suppliers"
    ) as ActionResult<{
      suppliers: Array<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        contactPerson: string | null;
        notes: string | null;
        productCount: number;
        purchaseOrderCount: number;
        createdAt: Date;
        updatedAt: Date;
      }>;
    }>;
  }
}

/**
 * Get a single supplier by ID
 */
export async function getSupplierById(supplierId: string): Promise<
  ActionResult<{
    supplier: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      address: string | null;
      contactPerson: string | null;
      notes: string | null;
      products: Array<{
        id: string;
        name: string;
        sku: string | null;
        quantity: number;
      }>;
      purchaseOrders: Array<{
        id: string;
        orderNumber: string;
        status: string;
        totalAmount: number;
        createdAt: Date;
      }>;
      createdAt: Date;
      updatedAt: Date;
    };
  }>
> {
  try {
    const user = await requireAuthedUser();
    const userId = user.id;

    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, userId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
          },
          take: 20,
          orderBy: { name: "asc" },
        },
        purchaseOrders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!supplier) {
      return failureResult("Supplier not found") as ActionResult<{
        supplier: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          contactPerson: string | null;
          notes: string | null;
          products: Array<{
            id: string;
            name: string;
            sku: string | null;
            quantity: number;
          }>;
          purchaseOrders: Array<{
            id: string;
            orderNumber: string;
            status: string;
            totalAmount: number;
            createdAt: Date;
          }>;
          createdAt: Date;
          updatedAt: Date;
        };
      }>;
    }

    return successResult("Supplier retrieved", {
      supplier: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        contactPerson: supplier.contactPerson,
        notes: supplier.notes,
        products: supplier.products,
        purchaseOrders: supplier.purchaseOrders.map((po) => ({
          ...po,
          totalAmount: Number(po.totalAmount),
        })),
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to get supplier:", error);
    return failureResult(
      error instanceof Error ? error.message : "Failed to get supplier"
    ) as ActionResult<{
      supplier: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        contactPerson: string | null;
        notes: string | null;
        products: Array<{
          id: string;
          name: string;
          sku: string | null;
          quantity: number;
        }>;
        purchaseOrders: Array<{
          id: string;
          orderNumber: string;
          status: string;
          totalAmount: number;
          createdAt: Date;
        }>;
        createdAt: Date;
        updatedAt: Date;
      };
    }>;
  }
}

/**
 * Get suppliers for dropdown/select options
 */
export async function getSupplierOptions(): Promise<
  ActionResult<{
    options: Array<{ id: string; name: string }>;
  }>
> {
  try {
    const user = await requireAuthedUser();
    const userId = user.id;

    const suppliers = await prisma.supplier.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return successResult("Supplier options retrieved", {
      options: suppliers,
    });
  } catch (error) {
    console.error("Failed to get supplier options:", error);
    return failureResult(
      error instanceof Error ? error.message : "Failed to get supplier options"
    ) as ActionResult<{
      options: Array<{ id: string; name: string }>;
    }>;
  }
}
