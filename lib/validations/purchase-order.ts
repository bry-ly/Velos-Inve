/**
 * Purchase Order validation schemas using Zod
 * Client and server variants for form handling
 */

import { z } from "zod";

/**
 * Helper to preprocess string to undefined if empty
 */
const emptyStringToUndefined = z
  .string()
  .optional()
  .transform((val) => {
    if (!val || val.trim() === "") return undefined;
    return val.trim();
  });

/**
 * PO Status enum
 */
export const PO_STATUSES = [
  "draft",
  "ordered",
  "partial",
  "received",
  "cancelled",
] as const;

export type POStatus = (typeof PO_STATUSES)[number];

/**
 * Purchase Order Item schema
 */
export const PurchaseOrderItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  sku: z.string().optional(),
  orderedQuantity: z.number().int().positive("Quantity must be greater than 0"),
  unitCost: z.number().nonnegative("Unit cost must be 0 or greater"),
});

export type PurchaseOrderItemInput = z.infer<typeof PurchaseOrderItemSchema>;

/**
 * Client-side schema for react-hook-form - Create PO
 */
export const PurchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),

  expectedDate: z.string().optional(),

  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or fewer")
    .optional(),

  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        productName: z.string().min(1, "Product name is required"),
        sku: z.string().optional(),
        orderedQuantity: z
          .number()
          .int()
          .positive("Quantity must be greater than 0"),
        unitCost: z.number().nonnegative("Unit cost must be 0 or greater"),
      })
    )
    .min(1, "At least one item is required"),

  tax: z.number().nonnegative("Tax must be 0 or greater").optional(),
  shippingCost: z
    .number()
    .nonnegative("Shipping cost must be 0 or greater")
    .optional(),
});

export type PurchaseOrderFormData = z.infer<typeof PurchaseOrderFormSchema>;

/**
 * Server-side schema with preprocessing for FormData handling
 */
export const PurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),

  expectedDate: emptyStringToUndefined.transform((val) => {
    if (!val) return undefined;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  }),

  notes: emptyStringToUndefined.refine(
    (val) => !val || val.length <= 2000,
    "Notes must be 2000 characters or fewer"
  ),

  items: z
    .array(PurchaseOrderItemSchema)
    .min(1, "At least one item is required"),

  tax: z.number().nonnegative("Tax must be 0 or greater").default(0),
  shippingCost: z
    .number()
    .nonnegative("Shipping cost must be 0 or greater")
    .default(0),
});

export type PurchaseOrderInput = z.infer<typeof PurchaseOrderSchema>;

/**
 * Schema for receiving items
 */
export const ReceiveItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  receivedQuantity: z
    .number()
    .int()
    .nonnegative("Received quantity must be 0 or greater"),
});

export const ReceivePurchaseOrderSchema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase order ID is required"),
  items: z
    .array(ReceiveItemSchema)
    .min(1, "At least one item must be received"),
  notes: z.string().optional(),
});

export type ReceivePurchaseOrderInput = z.infer<
  typeof ReceivePurchaseOrderSchema
>;
