/**
 * Customer validation schemas using Zod
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
 * Client-side schema for react-hook-form
 */
export const CustomerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .max(200, "Name must be 200 characters or fewer"),

  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be 255 characters or fewer")
    .optional()
    .or(z.literal("")),

  phone: z.string().max(50, "Phone must be 50 characters or fewer").optional(),

  address: z
    .string()
    .max(500, "Address must be 500 characters or fewer")
    .optional(),

  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or fewer")
    .optional(),
});

export type CustomerFormData = z.infer<typeof CustomerFormSchema>;

/**
 * Server-side schema with preprocessing for FormData handling
 */
export const CustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(200, "Name must be 200 characters or fewer"),

  email: emptyStringToUndefined
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email address"
    )
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

  notes: emptyStringToUndefined.refine(
    (val) => !val || val.length <= 2000,
    "Notes must be 2000 characters or fewer"
  ),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;
