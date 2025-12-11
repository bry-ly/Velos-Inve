/**
 * Location/Warehouse validation schemas using Zod
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
 * Client-side schema for react-hook-form
 */
export const LocationFormSchema = z.object({
  name: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Name must be 100 characters or fewer"),

  address: z
    .string()
    .max(500, "Address must be 500 characters or fewer")
    .optional(),

  isDefault: z.boolean(),

  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or fewer")
    .optional(),
});

export type LocationFormData = z.infer<typeof LocationFormSchema>;

/**
 * Server-side schema with preprocessing
 */
export const LocationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Location name is required")
    .max(100, "Name must be 100 characters or fewer"),

  address: emptyStringToUndefined.refine(
    (val) => !val || val.length <= 500,
    "Address must be 500 characters or fewer"
  ),

  isDefault: z.boolean().optional().default(false),

  notes: emptyStringToUndefined.refine(
    (val) => !val || val.length <= 2000,
    "Notes must be 2000 characters or fewer"
  ),
});

export type LocationInput = z.infer<typeof LocationSchema>;

/**
 * Stock transfer schema
 */
export const StockTransferSchema = z
  .object({
    productId: z.string().min(1, "Product is required"),
    fromLocationId: z.string().min(1, "Source location is required"),
    toLocationId: z.string().min(1, "Destination location is required"),
    quantity: z.number().int().positive("Quantity must be greater than 0"),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: "Source and destination locations must be different",
    path: ["toLocationId"],
  });

export type StockTransferInput = z.infer<typeof StockTransferSchema>;
