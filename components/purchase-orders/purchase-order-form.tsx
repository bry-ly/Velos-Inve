"use client";

import { useTransition, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PurchaseOrderFormSchema,
  type PurchaseOrderFormData,
} from "@/lib/validations/purchase-order";
import { createPurchaseOrder } from "@/lib/action/purchase-order";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconShoppingCart,
  IconPlus,
  IconTrash,
  IconPackage,
} from "@tabler/icons-react";

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
}

interface PurchaseOrderFormProps {
  suppliers: Supplier[];
  products: Product[];
  onSuccess?: () => void;
}

export function PurchaseOrderForm({
  suppliers,
  products,
  onSuccess,
}: PurchaseOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(PurchaseOrderFormSchema),
    defaultValues: {
      supplierId: "",
      expectedDate: "",
      notes: "",
      items: [],
      tax: 0,
      shippingCost: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTax = form.watch("tax") || 0;
  const watchedShipping = form.watch("shippingCost") || 0;

  const subtotal = watchedItems.reduce(
    (sum, item) => sum + (item.orderedQuantity || 0) * (item.unitCost || 0),
    0
  );
  const total = subtotal + watchedTax + watchedShipping;

  const addProduct = () => {
    if (!selectedProduct) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Check if already added
    const exists = watchedItems.some((item) => item.productId === product.id);
    if (exists) {
      toast.error("This product is already in the order");
      return;
    }

    append({
      productId: product.id,
      productName: product.name,
      sku: product.sku || "",
      orderedQuantity: 1,
      unitCost: product.price,
    });

    setSelectedProduct("");
  };

  const addCustomItem = () => {
    append({
      productId: undefined,
      productName: "",
      sku: "",
      orderedQuantity: 1,
      unitCost: 0,
    });
  };

  const onSubmit = (data: PurchaseOrderFormData) => {
    startTransition(async () => {
      try {
        const result = await createPurchaseOrder({
          supplierId: data.supplierId,
          expectedDate: data.expectedDate
            ? new Date(data.expectedDate)
            : undefined,
          notes: data.notes,
          items: data.items,
          tax: data.tax || 0,
          shippingCost: data.shippingCost || 0,
        });

        if (result?.success) {
          toast.success(result.message ?? "Purchase order created!");
          router.push("/purchase-orders");
          onSuccess?.();
        } else {
          toast.error(result?.message ?? "Failed to create purchase order");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShoppingCart className="h-5 w-5" />
              Order Details
            </CardTitle>
            <CardDescription>
              Select a supplier and set the expected delivery date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                      placeholder="Additional notes for this order..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPackage className="h-5 w-5" />
              Order Items
            </CardTitle>
            <CardDescription>
              Add products or custom items to the order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Product */}
            <div className="flex gap-2">
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a product to add" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} {product.sku ? `(${product.sku})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addProduct}
                disabled={!selectedProduct}
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
              <Button type="button" variant="outline" onClick={addCustomItem}>
                <IconPlus className="h-4 w-4 mr-2" />
                Custom Item
              </Button>
            </div>

            {/* Items Table */}
            {fields.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      <TableHead className="w-[120px]">Unit Cost</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Total
                      </TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          {field.productId ? (
                            <span>{watchedItems[index]?.productName}</span>
                          ) : (
                            <Input
                              placeholder="Product name"
                              {...form.register(`items.${index}.productName`)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {field.productId ? (
                            <span className="text-muted-foreground">
                              {watchedItems[index]?.sku || "—"}
                            </span>
                          ) : (
                            <Input
                              placeholder="SKU"
                              {...form.register(`items.${index}.sku`)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            {...form.register(
                              `items.${index}.orderedQuantity`,
                              {
                                valueAsNumber: true,
                              }
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            {...form.register(`items.${index}.unitCost`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₱
                          {(
                            (watchedItems[index]?.orderedQuantity || 0) *
                            (watchedItems[index]?.unitCost || 0)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <IconPackage className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No items added yet. Add products or custom items above.
                </p>
              </div>
            )}

            {form.formState.errors.items && (
              <p className="text-sm text-destructive">
                {form.formState.errors.items.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm">Tax</span>
                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-32 text-right"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm">Shipping</span>
                <FormField
                  control={form.control}
                  name="shippingCost"
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-32 text-right"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
              </div>
              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isPending || fields.length === 0}
          >
            {isPending ? "Creating..." : "Create Purchase Order"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
