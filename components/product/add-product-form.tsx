"use client";

import { Toaster } from "@/components/ui/sonner";
import { ProductForm } from "./product-form";
import type { CategoryOption } from "@/lib/types";

interface Tag {
  id: string;
  name: string;
}

interface AddProductFormProps {
  categories: CategoryOption[];
  tags: Tag[];
}

export function AddProductForm({ categories, tags }: AddProductFormProps) {
  return (
    <>
      <Toaster richColors position="top-right" />
      <ProductForm
        categories={categories}
        tags={tags}
        submitLabel="Add product to inventory"
        showResetButton={true}
      />
    </>
  );
}
