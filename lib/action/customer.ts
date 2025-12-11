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
import { CustomerSchema } from "@/lib/validations/customer";
import { logActivity } from "@/lib/logger/logger";
import { Prisma } from "../../app/generated/prisma/client";

/**
 * Create a new customer
 */
export async function createCustomer(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    // Extract and validate form data
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = CustomerSchema.safeParse(rawData);
    if (!parsed.success) {
      return failureResult(
        "Validation failed. Please check the form for errors.",
        formatZodErrors(parsed.error.issues)
      );
    }

    const { name, email, phone, address, notes } = parsed.data;

    // Check for duplicate customer name for this user
    const existingByName = await prisma.customer.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existingByName) {
      return failureResult("A customer with this name already exists.", {
        name: ["A customer with this name already exists."],
      });
    }

    // Check for duplicate email if provided
    if (email) {
      const existingByEmail = await prisma.customer.findUnique({
        where: {
          userId_email: {
            userId: user.id,
            email,
          },
        },
      });

      if (existingByEmail) {
        return failureResult("A customer with this email already exists.", {
          email: ["A customer with this email already exists."],
        });
      }
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        name,
        email,
        phone,
        address,
        notes,
      },
    });

    // Log activity
    await logActivity({
      userId: user.id,
      entityType: "customer",
      entityId: customer.id,
      action: "create",
      changes: customer as unknown as Prisma.JsonObject,
      note: `Created customer: ${customer.name}`,
    });

    revalidatePath("/customers");
    revalidatePath("/sales");

    return successResult("Customer created successfully!");
  } catch (error) {
    console.error("Failed to create customer:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.", {
        user: ["User not found"],
      });
    }
    return failureResult("Failed to create customer.", {
      server: ["An unexpected error occurred."],
    });
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const id = String(formData.get("id") || "").trim();
    if (!id) {
      return failureResult("Customer identifier missing.", {
        id: ["Customer identifier is required."],
      });
    }

    // Extract and validate form data
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = CustomerSchema.safeParse(rawData);
    if (!parsed.success) {
      return failureResult(
        "Validation failed. Please check the form for errors.",
        formatZodErrors(parsed.error.issues)
      );
    }

    const { name, email, phone, address, notes } = parsed.data;

    // Check if customer exists and belongs to user
    const existing = await prisma.customer.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return failureResult("Customer not found or access denied.", {
        id: ["Customer not found or access denied."],
      });
    }

    // Check for duplicate name (excluding current customer)
    const duplicateName = await prisma.customer.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: "insensitive" },
        NOT: { id },
      },
    });

    if (duplicateName) {
      return failureResult("A customer with this name already exists.", {
        name: ["A customer with this name already exists."],
      });
    }

    // Check for duplicate email if provided (excluding current customer)
    if (email) {
      const duplicateEmail = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          email,
          NOT: { id },
        },
      });

      if (duplicateEmail) {
        return failureResult("A customer with this email already exists.", {
          email: ["A customer with this email already exists."],
        });
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        notes,
      },
    });

    // Log activity
    await logActivity({
      userId: user.id,
      entityType: "customer",
      entityId: customer.id,
      action: "update",
      changes: {
        before: existing as unknown as Prisma.JsonObject,
        after: customer as unknown as Prisma.JsonObject,
      },
      note: `Updated customer: ${customer.name}`,
    });

    revalidatePath("/customers");
    revalidatePath("/sales");

    return successResult("Customer updated successfully!");
  } catch (error) {
    console.error("Failed to update customer:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.", {
        user: ["User not found"],
      });
    }
    return failureResult("Failed to update customer.", {
      server: ["An unexpected error occurred."],
    });
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const id = String(formData.get("id") || "").trim();
    if (!id) {
      return failureResult("Customer identifier missing.");
    }

    // Check if customer exists and belongs to user
    const existing = await prisma.customer.findFirst({
      where: { id, userId: user.id },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });

    if (!existing) {
      return failureResult("Customer not found or access denied.");
    }

    // Check if customer has associated sales
    if (existing._count.sales > 0) {
      return failureResult(
        `Cannot delete customer with ${existing._count.sales} associated sale(s). Please remove or reassign the sales first.`
      );
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      userId: user.id,
      entityType: "customer",
      entityId: id,
      action: "delete",
      note: `Deleted customer: ${existing.name}`,
    });

    revalidatePath("/customers");
    revalidatePath("/sales");

    return successResult("Customer deleted successfully!");
  } catch (error) {
    console.error("Failed to delete customer:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    return failureResult("Failed to delete customer.");
  }
}

/**
 * Get all customers for the current user
 */
export async function getCustomers() {
  try {
    const user = await requireAuthedUser();

    const customers = await prisma.customer.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });

    return {
      success: true,
      message: "Customers fetched successfully",
      data: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes,
        salesCount: customer._count.sales,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to get customers:", error);
    return {
      success: false,
      message: "Failed to fetch customers",
      data: [],
    };
  }
}

/**
 * Get a customer by ID
 */
export async function getCustomerById(id: string) {
  try {
    const user = await requireAuthedUser();

    // Fetch customer and sales count
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!customer) {
      return {
        success: false,
        message: "Customer not found",
        data: null,
      };
    }

    // Fetch recent sales and count in parallel
    const [salesCount, recentSales] = await Promise.all([
      prisma.sale.count({
        where: { customerId: customer.id },
      }),
      prisma.sale.findMany({
        where: { customerId: customer.id },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      success: true,
      message: "Customer fetched successfully",
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          notes: customer.notes,
          createdAt: customer.createdAt.toISOString(),
          updatedAt: customer.updatedAt.toISOString(),
        },
        salesCount,
        recentSales: recentSales.map((sale) => ({
          id: sale.id,
          invoiceNumber: sale.invoiceNumber,
          total: Number(sale.totalAmount),
          createdAt: sale.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get customer:", error);
    return {
      success: false,
      message: "Failed to fetch customer",
      data: null,
    };
  }
}

/**
 * Get customer options for dropdowns
 */
export async function getCustomerOptions() {
  try {
    const user = await requireAuthedUser();

    const customers = await prisma.customer.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      success: true,
      message: "Customer options fetched successfully",
      data: customers,
    };
  } catch (error) {
    console.error("Failed to get customer options:", error);
    return {
      success: false,
      message: "Failed to fetch customer options",
      data: [],
    };
  }
}
