"use server";

import { prisma } from "@/lib/prisma/prisma";
import { requireAuthedUser } from "@/lib/server/action-utils";

export interface BarcodeScanResult {
  success: boolean;
  found: boolean;
  product?: {
    id: string;
    name: string;
    sku: string | null;
    manufacturer: string;
    model: string | null;
    quantity: number;
    price: number;
    condition: string;
    location: string | null;
    imageUrl: string | null;
    categoryName: string | null;
    lowStockAt: number | null;
  };
  message?: string;
}

/**
 * Look up a product by barcode/SKU
 * This function can be used with barcode scanning devices or manual SKU entry
 */
export async function lookupProductBySKU(
  sku: string
): Promise<BarcodeScanResult> {
  try {
    const user = await requireAuthedUser();

    if (!sku || !sku.trim()) {
      return {
        success: false,
        found: false,
        message: "SKU is required",
      };
    }

    // Search for product by SKU
    const product = await prisma.product.findFirst({
      where: {
        userId: user.id,
        sku: sku.trim(),
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      return {
        success: true,
        found: false,
        message: "Product not found with this SKU",
      };
    }

    return {
      success: true,
      found: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        manufacturer: product.manufacturer,
        model: product.model,
        quantity: product.quantity,
        price: Number(product.price),
        condition: product.condition,
        location: product.location,
        imageUrl: product.imageUrl,
        categoryName: product.category?.name || null,
        lowStockAt: product.lowStockAt,
      },
    };
  } catch (error) {
    console.error("Error looking up product by SKU:", error);
    return {
      success: false,
      found: false,
      message: "Failed to lookup product",
    };
  }
}

/**
 * Search products by partial SKU or name
 * Useful for fuzzy matching when scanning produces partial results
 */
export async function searchProductsByKeyword(
  keyword: string,
  limit: number = 10
): Promise<{
  success: boolean;
  products: Array<{
    id: string;
    name: string;
    sku: string | null;
    manufacturer: string;
    quantity: number;
    price: number;
  }>;
  message?: string;
}> {
  try {
    const user = await requireAuthedUser();

    if (!keyword || keyword.trim().length < 2) {
      return {
        success: false,
        products: [],
        message: "Keyword must be at least 2 characters",
      };
    }

    const searchTerm = `%${keyword.trim()}%`;

    // Search in SKU, name, and manufacturer fields
    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
        OR: [
          { sku: { contains: keyword.trim(), mode: "insensitive" } },
          { name: { contains: keyword.trim(), mode: "insensitive" } },
          { manufacturer: { contains: keyword.trim(), mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        manufacturer: true,
        quantity: true,
        price: true,
      },
      take: limit,
      orderBy: [
        // Prioritize exact SKU matches
        { sku: "asc" },
        { name: "asc" },
      ],
    });

    return {
      success: true,
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
      })),
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      success: false,
      products: [],
      message: "Failed to search products",
    };
  }
}

/**
 * Generate a unique SKU for a product
 * Uses a combination of manufacturer code, category, and sequential number
 */
export async function generateSKU(
  manufacturerName: string,
  categoryId?: string
): Promise<{
  success: boolean;
  sku?: string;
  message?: string;
}> {
  try {
    const user = await requireAuthedUser();

    // Get manufacturer prefix (first 3 letters, uppercase)
    const mfgPrefix = manufacturerName
      .trim()
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    // Get category code if provided
    let categoryCode = "GEN";
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: user.id,
        },
      });

      if (category) {
        categoryCode = category.name
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");
      }
    }

    // Find the last product with similar SKU pattern to get next number
    const pattern = `${mfgPrefix}-${categoryCode}-%`;
    const lastProduct = await prisma.product.findFirst({
      where: {
        userId: user.id,
        sku: {
          startsWith: `${mfgPrefix}-${categoryCode}-`,
        },
      },
      orderBy: {
        sku: "desc",
      },
      select: {
        sku: true,
      },
    });

    let nextNumber = 1;
    if (lastProduct?.sku) {
      // Extract the number from the last SKU
      const match = lastProduct.sku.match(/-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Generate the SKU: MFG-CAT-0001
    const sku = `${mfgPrefix}-${categoryCode}-${String(nextNumber).padStart(4, "0")}`;

    // Verify uniqueness
    const existing = await prisma.product.findFirst({
      where: {
        userId: user.id,
        sku,
      },
    });

    if (existing) {
      // If somehow duplicate, try next number
      return generateSKU(manufacturerName, categoryId);
    }

    return {
      success: true,
      sku,
    };
  } catch (error) {
    console.error("Error generating SKU:", error);
    return {
      success: false,
      message: "Failed to generate SKU",
    };
  }
}

/**
 * Validate if a SKU is unique for the user
 */
export async function validateSKU(
  sku: string,
  excludeProductId?: string
): Promise<{
  success: boolean;
  isUnique: boolean;
  message?: string;
}> {
  try {
    const user = await requireAuthedUser();

    if (!sku || !sku.trim()) {
      return {
        success: true,
        isUnique: false,
        message: "SKU is required",
      };
    }

    const existing = await prisma.product.findFirst({
      where: {
        userId: user.id,
        sku: sku.trim(),
        ...(excludeProductId && { id: { not: excludeProductId } }),
      },
    });

    return {
      success: true,
      isUnique: !existing,
      message: existing ? "SKU already exists" : "SKU is available",
    };
  } catch (error) {
    console.error("Error validating SKU:", error);
    return {
      success: false,
      isUnique: false,
      message: "Failed to validate SKU",
    };
  }
}
