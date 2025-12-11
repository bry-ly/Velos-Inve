"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BatchFormSchema, type BatchFormData } from "@/lib/validations/batch";
import { createBatch, updateBatch } from "@/lib/action/batch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconPackage } from "@tabler/icons-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
}

interface BatchFormProps {
  defaultValues?: Partial<BatchFormData>;
  batchId?: string;
  products: Product[];
  onSuccess?: () => void;
  submitLabel?: string;
  showResetButton?: boolean;
  isEdit?: boolean;
}

export function BatchForm({
  defaultValues,
  batchId,
  products,
  onSuccess,
  submitLabel = "Add Batch",
  showResetButton = true,
  isEdit = false,
}: BatchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<BatchFormData>({
    resolver: zodResolver(BatchFormSchema),
    defaultValues: {
      productId: "",
      batchNumber: "",
      quantity: 0,
      costPrice: undefined,
      expiryDate: "",
      manufacturingDate: "",
      notes: "",
      ...defaultValues,
    },
  });

  const onSubmit = (data: BatchFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        if (batchId) {
          formData.append("id", batchId);
        }

        formData.append("productId", data.productId);
        formData.append("batchNumber", data.batchNumber);
        formData.append("quantity", String(data.quantity));
        if (data.costPrice !== undefined) {
          formData.append("costPrice", String(data.costPrice));
        }
        if (data.expiryDate) formData.append("expiryDate", data.expiryDate);
        if (data.manufacturingDate) {
          formData.append("manufacturingDate", data.manufacturingDate);
        }
        if (data.notes) formData.append("notes", data.notes);

        const result = batchId
          ? await updateBatch(formData)
          : await createBatch(formData);

        if (result?.success) {
          toast.success(result.message ?? "Batch saved successfully");
          if (!batchId) {
            form.reset();
          }
          router.refresh();
          onSuccess?.();
        } else {
          if (result?.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                form.setError(field as keyof BatchFormData, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }
          toast.error(result?.message ?? "Failed to save batch");
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPackage className="h-5 w-5" />
              Batch Details
            </CardTitle>
            <CardDescription>
              Enter the batch/lot information for inventory tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                          {product.sku ? ` (${product.sku})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The product this batch belongs to.
                    {isEdit && " Cannot be changed after creation."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., LOT-2024-001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this batch.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Quantity {!isEdit && "*"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        disabled={isEdit}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {isEdit
                        ? "Use quantity adjustments to change."
                        : "Number of items in this batch."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price per Unit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        field.onChange(isNaN(val) ? undefined : val);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Purchase cost per unit for this batch.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="manufacturingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturing Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Leave blank if no expiry.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this batch..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? "Saving..." : submitLabel}
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
