import { z } from "zod";

export const SavedFilterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Filter name is required")
    .max(50, "Filter name must be 50 characters or fewer"),
});

export const FilterDataSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  condition: z.string().optional(),
  lowStock: z.boolean().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export type FilterData = z.infer<typeof FilterDataSchema>;
