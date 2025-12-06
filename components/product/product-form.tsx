"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ProductFormSchema,
  type ProductFormData,
} from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/lib/action/product";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProductDetailsSection } from "./sections/product-details-section";
import { InventorySection } from "./sections/inventory-section";
import { SupplySection } from "./sections/supply-section";
import { MediaSection } from "./sections/media-section";
import type { CategoryOption } from "@/lib/types";

interface Tag {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  tags: Tag[];
  defaultValues?: Partial<ProductFormData>;
  productId?: string;
  onSuccess?: () => void;
  submitLabel?: string;
  showResetButton?: boolean;
}

export function ProductForm({
  categories,
  tags,
  defaultValues,
  productId,
  onSuccess,
  submitLabel = "Add product to inventory",
  showResetButton = true,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      manufacturer: "",
      model: "",
      sku: "",
      quantity: 0,
      lowStockAt: undefined,
      condition: "new",
      location: "",
      price: 0,
      specs: "",
      compatibility: "",
      supplier: "",
      warrantyMonths: undefined,
      notes: "",
      imageUrl: "",
      tagIds: [],
      ...defaultValues,
    },
  });

  const onSubmit = (data: ProductFormData) => {
    startTransition(async () => {
      try {
        // Convert to FormData for server action
        const formData = new FormData();

        // Add product ID if updating
        if (productId) {
          formData.append("id", productId);
        }

        // Add all form fields
        Object.entries(data).forEach(([key, value]) => {
          if (key === "tagIds" && Array.isArray(value)) {
            value.forEach((tagId) => formData.append("tagIds", tagId));
          } else if (value !== "" && value != null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        // Call appropriate action
        const result = productId
          ? await updateProduct(formData)
          : await createProduct(formData);

        if (result?.success) {
          toast.success(result.message ?? "Product saved successfully");

          // Reset form only for new products
          if (!productId) {
            form.reset();
          }

          router.refresh();
          onSuccess?.();
        } else {
          // Handle server-side validation errors
          if (result?.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                form.setError(field as keyof ProductFormData, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }
          toast.error(result?.message ?? "Failed to save product");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleReset = () => {
    form.reset();
    toast.info("Form cleared");
  };

  const selectedCategory = categories.find(
    (category) => category.id === form.watch("categoryId")
  );

  const quantity = form.watch("quantity");
  const lowStockAt = form.watch("lowStockAt");
  const isLowStock =
    quantity > 0 &&
    lowStockAt !== undefined &&
    lowStockAt > 0 &&
    quantity <= lowStockAt;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ProductDetailsSection
          form={form}
          categories={categories}
          isLowStock={isLowStock}
        />

        {selectedCategory && <InventorySection form={form} />}

        <SupplySection form={form} />

        <MediaSection form={form} tags={tags} />

        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? (productId ? "Saving..." : "Adding...") : submitLabel}
          </Button>
          {showResetButton && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={isPending}
              onClick={handleReset}
            >
              Clear form
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
