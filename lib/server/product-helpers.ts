/**
 * Shared helpers for product operations
 * Includes transactional upsert logic and validation helpers
 */

import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "../../app/generated/prisma/client";
import { ProductInput } from "@/lib/validations/product";
import { logActivity } from "@/lib/logger/logger";

/**
 * Validate that a category exists and belongs to the user
 */
export async function validateCategoryAccess(
  categoryId: string,
  userId: string
) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    return {
      success: false as const,
      error: "Category not found or access denied.",
    };
  }

  return {
    success: true as const,
    category,
  };
}

/**
 * Validate that all tags exist and belong to the user
 */
export async function validateTagsAccess(tagIds: string[], userId: string) {
  const tags = await prisma.tag.findMany({
    where: {
      id: { in: tagIds },
      userId,
    },
  });

  if (tags.length !== tagIds.length) {
    return {
      success: false as const,
      error: "One or more tags not found or access denied.",
    };
  }

  return {
    success: true as const,
    tags,
  };
}

/**
 * Sync product tags (replace all existing with new set)
 * Optimized to minimize database operations
 */
export async function mutateProductTags(
  productId: string,
  tagIds: string[],
  tx: Prisma.TransactionClient
) {
  // Get existing tags
  const existingTags = await tx.productTag.findMany({
    where: { productId },
    select: { tagId: true },
  });

  const existingTagIds = new Set(existingTags.map((t) => t.tagId));
  const newTagIds = new Set(tagIds);

  // Determine what to add and remove
  const toAdd = tagIds.filter((id) => !existingTagIds.has(id));
  const toRemove = existingTags
    .filter((t) => !newTagIds.has(t.tagId))
    .map((t) => t.tagId);

  // Only execute operations if needed
  if (toRemove.length > 0) {
    await tx.productTag.deleteMany({
      where: {
        productId,
        tagId: { in: toRemove },
      },
    });
  }

  if (toAdd.length > 0) {
    await tx.productTag.createMany({
      data: toAdd.map((tagId) => ({
        productId,
        tagId,
      })),
    });
  }
}

/**
 * Transactional upsert for products (create or update)
 */
export async function upsertProductTransaction(params: {
  productId?: string;
  userId: string;
  productData: ProductInput;
  existingProduct?: {
    id: string;
    name: string;
    quantity: number;
    categoryId: string | null;
    [key: string]: unknown;
  } | null;
}) {
  const { productId, userId, productData, existingProduct } = params;
  const { categoryId, tagIds, ...productFields } = productData;

  // Validate category if provided
  if (categoryId) {
    const categoryCheck = await validateCategoryAccess(categoryId, userId);
    if (!categoryCheck.success) {
      return {
        success: false as const,
        error: categoryCheck.error,
      };
    }
  }

  // Validate tags if provided
  if (tagIds && tagIds.length > 0) {
    const tagsCheck = await validateTagsAccess(tagIds, userId);
    if (!tagsCheck.success) {
      return {
        success: false as const,
        error: tagsCheck.error,
      };
    }
  }

  // Execute in transaction
  const result = await prisma.$transaction(async (tx) => {
    let product;

    if (productId && existingProduct) {
      // UPDATE
      product = await tx.product.update({
        where: { id: productId },
        data: {
          ...productFields,
          categoryId: categoryId || null,
        },
      });

      // Update tags if provided
      if (tagIds !== undefined) {
        await mutateProductTags(productId, tagIds, tx);
      }

      // Log activity
      await logActivity({
        userId,
        actorId: userId,
        entityType: "product",
        entityId: product.id,
        action: "update",
        changes: {
          before: existingProduct as unknown as Prisma.JsonObject,
          after: product as unknown as Prisma.JsonObject,
        },
        note: `Updated product: ${product.name}`,
        tx,
      });
    } else {
      // CREATE
      product = await tx.product.create({
        data: {
          ...productFields,
          categoryId: categoryId || null,
          userId,
        },
      });

      // Create tags if provided
      if (tagIds && tagIds.length > 0) {
        await mutateProductTags(product.id, tagIds, tx);
      }

      // Log activity
      await logActivity({
        userId,
        actorId: userId,
        entityType: "product",
        entityId: product.id,
        action: "create",
        changes: product as unknown as Prisma.JsonObject,
        note: `Created product: ${product.name}`,
        tx,
      });
    }

    return product;
  });

  return {
    success: true as const,
    product: result,
  };
}

/**
 * Delete a product with activity logging
 */
export async function deleteProductTransaction(params: {
  productId: string;
  userId: string;
  productName: string;
}) {
  const { productId, userId, productName } = params;

  await prisma.$transaction(async (tx) => {
    await tx.product.delete({
      where: { id: productId },
    });

    await logActivity({
      userId,
      actorId: userId,
      entityType: "product",
      entityId: productId,
      action: "delete",
      note: `Deleted product: ${productName}`,
      tx,
    });
  });
}

/**
 * Adjust stock with validation and activity logging
 */
export async function adjustStockTransaction(params: {
  productId: string;
  userId: string;
  currentQuantity: number;
  adjustment: number;
  productName: string;
}) {
  const { productId, userId, currentQuantity, adjustment, productName } =
    params;

  const newQuantity = currentQuantity + adjustment;

  if (newQuantity < 0) {
    return {
      success: false as const,
      error: `Cannot adjust below 0. Current stock: ${currentQuantity}`,
    };
  }

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: { quantity: newQuantity },
    });

    await logActivity({
      userId,
      actorId: userId,
      entityType: "product",
      entityId: productId,
      action: "stock_adjustment",
      changes: {
        previousQuantity: currentQuantity,
        newQuantity: newQuantity,
        adjustment: adjustment,
      } as Prisma.JsonObject,
      note: `Adjusted stock for ${productName} by ${adjustment}`,
      tx,
    });

    return updated;
  });

  return {
    success: true as const,
    product,
    newQuantity,
  };
}
