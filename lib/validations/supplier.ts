/**
 * Supplier validation schemas using Zod
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
export const SupplierFormSchema = z.object({
  name: z
    .string()
    .min(1, "Supplier name is required")
    .max(200, "Supplier name must be 200 characters or fewer"),

  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be 255 characters or fewer")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .max(50, "Phone must be 50 characters or fewer")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .max(500, "Address must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),

  contactPerson: z
    .string()
    .max(200, "Contact person must be 200 characters or fewer")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or fewer")
    .optional()
    .or(z.literal("")),
});

/**
 * Server-side schema with preprocessors for FormData handling
 */
export const SupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Supplier name is required")
    .max(200, "Supplier name must be 200 characters or fewer"),

  email: emptyStringToUndefined
    .refine((val) => {
      if (!val) return true;
      return z.string().email().safeParse(val).success;
    }, "Invalid email address")
    .refine(
      (val) => !val || val.length <= 255,
      "Email must be 255 characters or fewer"
    ),

  phone: emptyStringToUndefined.refine(
    (val) => !val || val.length <= 50,
    "Phone must be 50 characters or fewer"
  ),

  address: emptyStringToUndefined.refine(
    (val) => !val || val.length <= 500,
    "Address must be 500 characters or fewer"
  ),

  contactPerson: emptyStringToUndefined.refine(
    (val) => !val || val.length <= 200,
    "Contact person must be 200 characters or fewer"
  ),

  notes: emptyStringToUndefined.refine(
    (val) => !val || val.length <= 2000,
    "Notes must be 2000 characters or fewer"
  ),
});

export type SupplierInput = z.infer<typeof SupplierSchema>;
export type SupplierFormData = z.infer<typeof SupplierFormSchema>;
