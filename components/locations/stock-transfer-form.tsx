"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { transferStock } from "@/lib/action/location";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconArrowRight, IconTransfer } from "@tabler/icons-react";

interface Location {
  id: string;
  name: string;
  isDefault: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
}

interface StockTransferFormProps {
  locations: Location[];
  products: Product[];
}

export function StockTransferForm({
  locations,
  products,
}: StockTransferFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [productId, setProductId] = React.useState("");
  const [fromLocationId, setFromLocationId] = React.useState("");
  const [toLocationId, setToLocationId] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState("");

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    if (!fromLocationId) {
      toast.error("Please select source location");
      return;
    }
    if (!toLocationId) {
      toast.error("Please select destination location");
      return;
    }
    if (fromLocationId === toLocationId) {
      toast.error("Source and destination must be different");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setIsPending(true);
    try {
      const result = await transferStock({
        productId,
        fromLocationId,
        toLocationId,
        quantity,
        notes: notes || undefined,
      });

      if (result?.success) {
        toast.success(result.message ?? "Stock transferred successfully");
        // Reset form
        setProductId("");
        setFromLocationId("");
        setToLocationId("");
        setQuantity(1);
        setNotes("");
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to transfer stock");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTransfer className="h-5 w-5" />
            Transfer Stock
          </CardTitle>
          <CardDescription>
            Move products between warehouse locations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Product *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                    {product.sku ? ` (${product.sku})` : ""} — Stock:{" "}
                    {product.quantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Total available: {selectedProduct.quantity} units
              </p>
            )}
          </div>

          {/* Location Selection */}
          <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr]">
            <div className="space-y-2">
              <Label>From Location *</Label>
              <Select value={fromLocationId} onValueChange={setFromLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem
                      key={loc.id}
                      value={loc.id}
                      disabled={loc.id === toLocationId}
                    >
                      {loc.name} {loc.isDefault ? "(Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-center pb-2">
              <IconArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label>To Location *</Label>
              <Select value={toLocationId} onValueChange={setToLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem
                      key={loc.id}
                      value={loc.id}
                      disabled={loc.id === fromLocationId}
                    >
                      {loc.name} {loc.isDefault ? "(Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              type="number"
              min={1}
              max={selectedProduct?.quantity ?? 999999}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="max-w-[200px]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Reason for transfer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isPending || !productId || !fromLocationId || !toLocationId
            }
          >
            {isPending ? "Transferring..." : "Transfer Stock"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
