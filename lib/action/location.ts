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
import {
  LocationSchema,
  StockTransferSchema,
} from "@/lib/validations/location";
import { logActivity } from "@/lib/logger/logger";

/**
 * Create a new location
 */
export async function createLocation(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const rawData = {
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      isDefault: formData.get("isDefault") === "true",
      notes: formData.get("notes") || undefined,
    };

    const parsed = LocationSchema.safeParse(rawData);
    if (!parsed.success) {
      return failureResult(
        "Validation failed. Please check the form for errors.",
        formatZodErrors(parsed.error.issues)
      );
    }

    const { name, address, isDefault, notes } = parsed.data;

    // Check for duplicate name
    const existing = await prisma.location.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existing) {
      return failureResult("A location with this name already exists.", {
        name: ["A location with this name already exists."],
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.location.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const location = await prisma.location.create({
      data: {
        userId: user.id,
        name,
        address,
        isDefault,
        notes,
      },
    });

    await logActivity({
      userId: user.id,
      entityType: "location",
      entityId: location.id,
      action: "create",
      note: `Created location: ${location.name}`,
    });

    revalidatePath("/locations");

    return successResult("Location created successfully!");
  } catch (error) {
    console.error("Failed to create location:", error);
    if (error instanceof Error && error.message === "Authentication required") {
      return failureResult("User not found. Please sign in.");
    }
    return failureResult("Failed to create location.");
  }
}

/**
 * Update a location
 */
export async function updateLocation(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const id = String(formData.get("id") || "").trim();
    if (!id) {
      return failureResult("Location identifier missing.");
    }

    const rawData = {
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      isDefault: formData.get("isDefault") === "true",
      notes: formData.get("notes") || undefined,
    };

    const parsed = LocationSchema.safeParse(rawData);
    if (!parsed.success) {
      return failureResult(
        "Validation failed.",
        formatZodErrors(parsed.error.issues)
      );
    }

    const { name, address, isDefault, notes } = parsed.data;

    const existing = await prisma.location.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return failureResult("Location not found.");
    }

    // Check for duplicate name
    const duplicate = await prisma.location.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: "insensitive" },
        NOT: { id },
      },
    });

    if (duplicate) {
      return failureResult("A location with this name already exists.", {
        name: ["A location with this name already exists."],
      });
    }

    // If setting as default, unset other defaults
    if (isDefault && !existing.isDefault) {
      await prisma.location.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const location = await prisma.location.update({
      where: { id },
      data: { name, address, isDefault, notes },
    });

    await logActivity({
      userId: user.id,
      entityType: "location",
      entityId: location.id,
      action: "update",
      note: `Updated location: ${location.name}`,
    });

    revalidatePath("/locations");

    return successResult("Location updated successfully!");
  } catch (error) {
    console.error("Failed to update location:", error);
    return failureResult("Failed to update location.");
  }
}

/**
 * Delete a location
 */
export async function deleteLocation(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const id = String(formData.get("id") || "").trim();
    if (!id) {
      return failureResult("Location identifier missing.");
    }

    const existing = await prisma.location.findFirst({
      where: { id, userId: user.id },
      include: {
        _count: {
          select: { productStocks: true },
        },
      },
    });

    if (!existing) {
      return failureResult("Location not found.");
    }

    // Check if location has stock
    if (existing._count.productStocks > 0) {
      return failureResult(
        "Cannot delete location with existing stock. Transfer or remove stock first."
      );
    }

    await prisma.location.delete({
      where: { id },
    });

    await logActivity({
      userId: user.id,
      entityType: "location",
      entityId: id,
      action: "delete",
      note: `Deleted location: ${existing.name}`,
    });

    revalidatePath("/locations");

    return successResult("Location deleted successfully!");
  } catch (error) {
    console.error("Failed to delete location:", error);
    return failureResult("Failed to delete location.");
  }
}

/**
 * Get all locations
 */
export async function getLocations() {
  try {
    const user = await requireAuthedUser();

    const locations = await prisma.location.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: { productStocks: true },
        },
      },
    });

    return {
      success: true,
      message: "Locations fetched successfully",
      data: locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        isDefault: loc.isDefault,
        notes: loc.notes,
        productCount: loc._count.productStocks,
        createdAt: loc.createdAt.toISOString(),
        updatedAt: loc.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to get locations:", error);
    return {
      success: false,
      message: "Failed to fetch locations",
      data: [],
    };
  }
}

/**
 * Get a location by ID with stock details
 */
export async function getLocationById(id: string) {
  try {
    const user = await requireAuthedUser();

    const location = await prisma.location.findFirst({
      where: { id, userId: user.id },
      include: {
        productStocks: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                quantity: true,
              },
            },
          },
        },
      },
    });

    if (!location) {
      return {
        success: false,
        message: "Location not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Location fetched successfully",
      data: {
        location: {
          id: location.id,
          name: location.name,
          address: location.address,
          isDefault: location.isDefault,
          notes: location.notes,
          createdAt: location.createdAt.toISOString(),
          updatedAt: location.updatedAt.toISOString(),
        },
        stocks: location.productStocks.map((stock) => ({
          productId: stock.productId,
          productName: stock.product.name,
          sku: stock.product.sku,
          quantity: stock.quantity,
          totalStock: stock.product.quantity,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get location:", error);
    return {
      success: false,
      message: "Failed to fetch location",
      data: null,
    };
  }
}

/**
 * Get location options for dropdowns
 */
export async function getLocationOptions() {
  try {
    const user = await requireAuthedUser();

    const locations = await prisma.location.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        isDefault: true,
      },
    });

    return {
      success: true,
      message: "Location options fetched",
      data: { options: locations },
    };
  } catch (error) {
    console.error("Failed to get location options:", error);
    return {
      success: false,
      message: "Failed to fetch location options",
      data: { options: [] },
    };
  }
}

/**
 * Transfer stock between locations
 */
export async function transferStock(data: {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  notes?: string;
}): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();

    const parsed = StockTransferSchema.safeParse(data);
    if (!parsed.success) {
      return failureResult(
        "Validation failed.",
        formatZodErrors(parsed.error.issues)
      );
    }

    const { productId, fromLocationId, toLocationId, quantity, notes } =
      parsed.data;

    // Verify product exists
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
    });

    if (!product) {
      return failureResult("Product not found.");
    }

    // Verify locations exist
    const [fromLocation, toLocation] = await Promise.all([
      prisma.location.findFirst({
        where: { id: fromLocationId, userId: user.id },
      }),
      prisma.location.findFirst({
        where: { id: toLocationId, userId: user.id },
      }),
    ]);

    if (!fromLocation) {
      return failureResult("Source location not found.");
    }
    if (!toLocation) {
      return failureResult("Destination location not found.");
    }

    // Check available stock at source
    const sourceStock = await prisma.productStock.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId: fromLocationId,
        },
      },
    });

    if (!sourceStock || sourceStock.quantity < quantity) {
      return failureResult(
        `Insufficient stock at ${fromLocation.name}. Available: ${
          sourceStock?.quantity ?? 0
        }`
      );
    }

    // Perform transfer in transaction
    await prisma.$transaction(async (tx) => {
      // Decrease source stock
      await tx.productStock.update({
        where: {
          productId_locationId: {
            productId,
            locationId: fromLocationId,
          },
        },
        data: { quantity: { decrement: quantity } },
      });

      // Increase destination stock (upsert)
      await tx.productStock.upsert({
        where: {
          productId_locationId: {
            productId,
            locationId: toLocationId,
          },
        },
        create: {
          productId,
          locationId: toLocationId,
          quantity,
        },
        update: { quantity: { increment: quantity } },
      });

      // Log stock movement (out from source)
      await tx.stockMovement.create({
        data: {
          userId: user.id,
          productId,
          locationId: fromLocationId,
          type: "transfer",
          quantity: -quantity,
          reference: toLocationId,
          referenceType: "transfer",
          notes: `Transfer to ${toLocation.name}${notes ? `: ${notes}` : ""}`,
        },
      });

      // Log stock movement (in to destination)
      await tx.stockMovement.create({
        data: {
          userId: user.id,
          productId,
          locationId: toLocationId,
          type: "transfer",
          quantity: quantity,
          reference: fromLocationId,
          referenceType: "transfer",
          notes: `Transfer from ${fromLocation.name}${
            notes ? `: ${notes}` : ""
          }`,
        },
      });
    });

    await logActivity({
      userId: user.id,
      entityType: "stock_movement",
      entityId: productId,
      action: "update",
      note: `Transferred ${quantity} of ${product.name} from ${fromLocation.name} to ${toLocation.name}`,
    });

    revalidatePath("/locations");
    revalidatePath("/stock/transfer");
    revalidatePath("/inventory");

    return successResult(
      `Transferred ${quantity} units from ${fromLocation.name} to ${toLocation.name}`
    );
  } catch (error) {
    console.error("Failed to transfer stock:", error);
    return failureResult("Failed to transfer stock.");
  }
}

/**
 * Get stock by location for a product
 */
export async function getProductStockByLocation(productId: string) {
  try {
    const user = await requireAuthedUser();

    const stocks = await prisma.productStock.findMany({
      where: {
        productId,
        product: { userId: user.id },
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            isDefault: true,
          },
        },
      },
    });

    return {
      success: true,
      data: stocks.map((stock) => ({
        locationId: stock.locationId,
        locationName: stock.location.name,
        isDefault: stock.location.isDefault,
        quantity: stock.quantity,
      })),
    };
  } catch (error) {
    console.error("Failed to get product stock:", error);
    return {
      success: false,
      data: [],
    };
  }
}
