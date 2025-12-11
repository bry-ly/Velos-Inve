/**
 * FormData → payload parsing for product operations
 */

import { ProductSchema } from "@/lib/validations/product";
import { formatZodErrors } from "./action-utils";

/**
 * Extract product payload from FormData
 */
export function extractProductFromFormData(formData: FormData) {
  // Extract image field with special handling for empty strings
  const imageField = formData.get("imageUrl");
  const imageUrl =
    typeof imageField === "string" && imageField.trim().length > 0
      ? imageField.trim()
      : undefined;

  // Extract tag IDs (could be multiple)
  const tagIds = formData.getAll("tagIds").filter((t) => t) as string[];

  return {
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    manufacturer: formData.get("manufacturer"),
    model: formData.get("model") || undefined,
    sku: formData.get("sku") || undefined,
    quantity: formData.get("quantity"),
    lowStockAt: formData.get("lowStockAt") || undefined,
    condition: formData.get("condition") || "new",
    location: formData.get("location") || undefined,
    price: formData.get("price"),
    specs: formData.get("specs") || undefined,
    compatibility: formData.get("compatibility") || undefined,
    supplierId: formData.get("supplierId") || undefined,
    warrantyMonths: formData.get("warrantyMonths") || undefined,
    notes: formData.get("notes") || undefined,
    imageUrl,
    tagIds: tagIds.length > 0 ? tagIds : undefined,
  };
}

/**
 * Parse and validate product payload using shared schema
 */
export function parseProductPayload(payload: unknown) {
  const result = ProductSchema.safeParse(payload);

  if (!result.success) {
    return {
      success: false as const,
      errors: formatZodErrors(result.error.issues),
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}

/**
 * Parse product from FormData with validation
 */
export function parseProductFromFormData(formData: FormData) {
  const payload = extractProductFromFormData(formData);
  return parseProductPayload(payload);
}
