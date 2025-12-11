"use server";

import { prisma } from "@/lib/prisma/prisma";
import { requireAuthedUser } from "@/lib/server/action-utils";
import { Prisma } from "../../app/generated/prisma/client";

/**
 * Stock movement types (internal use only)
 */
const MOVEMENT_TYPES = [
  "in",
  "out",
  "adjustment",
  "transfer",
  "receive",
] as const;

type MovementType = (typeof MOVEMENT_TYPES)[number];

interface StockMovementFilters {
  productId?: string;
  locationId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  reference?: string;
}

interface StockMovementRecord {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  locationId: string | null;
  locationName: string | null;
  type: string;
  quantity: number;
  reference: string | null;
  referenceType: string | null;
  notes: string | null;
  createdAt: string;
}

/**
 * Get stock movements with filters
 */
export async function getStockMovements(filters?: StockMovementFilters) {
  try {
    const user = await requireAuthedUser();

    const where: Prisma.StockMovementWhereInput = {
      userId: user.id,
      ...(filters?.productId ? { productId: filters.productId } : {}),
      ...(filters?.locationId ? { locationId: filters.locationId } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.reference
        ? { reference: { contains: filters.reference, mode: "insensitive" } }
        : {}),
      ...(filters?.startDate || filters?.endDate
        ? {
            createdAt: {
              ...(filters.startDate
                ? { gte: new Date(filters.startDate) }
                : {}),
              ...(filters.endDate
                ? { lte: new Date(`${filters.endDate}T23:59:59`) }
                : {}),
            },
          }
        : {}),
    };

    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500, // Limit for performance
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Stock movements fetched successfully",
      data: movements.map((m) => ({
        id: m.id,
        productId: m.productId,
        productName: m.product.name,
        productSku: m.product.sku,
        locationId: m.locationId,
        locationName: m.location?.name ?? null,
        type: m.type,
        quantity: m.quantity,
        reference: m.reference,
        referenceType: m.referenceType,
        notes: m.notes,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to get stock movements:", error);
    return {
      success: false,
      message: "Failed to fetch stock movements",
      data: [],
    };
  }
}

/**
 * Get stock movement summary (total in, out, adjustments)
 */
export async function getStockMovementSummary(filters?: StockMovementFilters) {
  try {
    const user = await requireAuthedUser();

    const dateFilter =
      filters?.startDate || filters?.endDate
        ? {
            createdAt: {
              ...(filters.startDate
                ? { gte: new Date(filters.startDate) }
                : {}),
              ...(filters.endDate
                ? { lte: new Date(`${filters.endDate}T23:59:59`) }
                : {}),
            },
          }
        : {};

    const baseWhere = {
      userId: user.id,
      ...(filters?.productId ? { productId: filters.productId } : {}),
      ...(filters?.locationId ? { locationId: filters.locationId } : {}),
      ...dateFilter,
    };

    // Get aggregates by type
    const [totalIn, totalOut, adjustments, transfers] = await Promise.all([
      prisma.stockMovement.aggregate({
        where: { ...baseWhere, type: "in" },
        _sum: { quantity: true },
        _count: true,
      }),
      prisma.stockMovement.aggregate({
        where: { ...baseWhere, type: "out" },
        _sum: { quantity: true },
        _count: true,
      }),
      prisma.stockMovement.aggregate({
        where: { ...baseWhere, type: "adjustment" },
        _sum: { quantity: true },
        _count: true,
      }),
      prisma.stockMovement.aggregate({
        where: { ...baseWhere, type: "transfer" },
        _count: true,
      }),
    ]);

    // Also get receive type
    const receives = await prisma.stockMovement.aggregate({
      where: { ...baseWhere, type: "receive" },
      _sum: { quantity: true },
      _count: true,
    });

    return {
      success: true,
      data: {
        totalIn: (totalIn._sum.quantity ?? 0) + (receives._sum.quantity ?? 0),
        totalInCount: totalIn._count + receives._count,
        totalOut: Math.abs(totalOut._sum.quantity ?? 0),
        totalOutCount: totalOut._count,
        adjustments: adjustments._sum.quantity ?? 0,
        adjustmentCount: adjustments._count,
        transferCount: transfers._count,
      },
    };
  } catch (error) {
    console.error("Failed to get movement summary:", error);
    return {
      success: false,
      data: {
        totalIn: 0,
        totalInCount: 0,
        totalOut: 0,
        totalOutCount: 0,
        adjustments: 0,
        adjustmentCount: 0,
        transferCount: 0,
      },
    };
  }
}

/**
 * Get movement history for a specific product
 */
export async function getProductMovementHistory(
  productId: string,
  limit: number = 50
) {
  try {
    const user = await requireAuthedUser();

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
      select: { id: true, name: true },
    });

    if (!product) {
      return {
        success: false,
        message: "Product not found",
        data: [],
      };
    }

    const movements = await prisma.stockMovement.findMany({
      where: { productId, userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        location: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      success: true,
      message: "Movement history fetched",
      data: movements.map((m) => ({
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        locationName: m.location?.name ?? null,
        reference: m.reference,
        referenceType: m.referenceType,
        notes: m.notes,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to get product movement history:", error);
    return {
      success: false,
      message: "Failed to fetch movement history",
      data: [],
    };
  }
}
