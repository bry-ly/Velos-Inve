/**
 * Batch/Lot validation schemas using Zod
 */

import { z } from "zod";

/**
 * Client-side schema for react-hook-form
 * Avoids z.coerce to prevent resolver type mismatch
 */
export const BatchFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),

  batchNumber: z
    .string()
    .min(1, "Batch number is required")
    .max(50, "Batch number must be 50 characters or fewer"),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),

  costPrice: z.number().min(0, "Cost price cannot be negative").optional(),

  expiryDate: z.string().optional(),

  manufacturingDate: z.string().optional(),

  purchaseOrderId: z.string().optional(),

  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or fewer")
    .optional(),
});

export type BatchFormData = z.infer<typeof BatchFormSchema>;

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
 * Server-side schema with preprocessing
 */
export const BatchSchema = z
  .object({
    productId: z.string().min(1, "Product is required"),

    batchNumber: z
      .string()
      .trim()
      .min(1, "Batch number is required")
      .max(50, "Batch number must be 50 characters or fewer"),

    quantity: z.coerce
      .number()
      .int("Quantity must be a whole number")
      .min(0, "Quantity cannot be negative"),

    costPrice: z.coerce
      .number()
      .min(0, "Cost price cannot be negative")
      .optional()
      .nullable(),

    expiryDate: emptyStringToUndefined.transform((val) =>
      val ? new Date(val) : undefined
    ),

    manufacturingDate: emptyStringToUndefined.transform((val) =>
      val ? new Date(val) : undefined
    ),

    purchaseOrderId: emptyStringToUndefined,

    notes: emptyStringToUndefined.refine(
      (val) => !val || val.length <= 2000,
      "Notes must be 2000 characters or fewer"
    ),
  })
  .refine(
    (data) => {
      if (data.manufacturingDate && data.expiryDate) {
        return data.manufacturingDate <= data.expiryDate;
      }
      return true;
    },
    {
      message: "Manufacturing date must be before expiry date",
      path: ["manufacturingDate"],
    }
  );

export type BatchInput = z.infer<typeof BatchSchema>;

/**
 * Schema for adjusting batch quantity
 */
export const BatchAdjustmentSchema = z.object({
  batchId: z.string().min(1, "Batch ID is required"),
  quantity: z.coerce.number().int("Quantity must be a whole number"),
  reason: z
    .string()
    .max(500, "Reason must be 500 characters or fewer")
    .optional(),
});

export type BatchAdjustmentInput = z.infer<typeof BatchAdjustmentSchema>;
