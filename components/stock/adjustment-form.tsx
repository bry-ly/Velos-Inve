"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adjustStock } from "@/lib/action/product";
import { ProductService } from "@/lib/services/product-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";

export function AdjustmentForm() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("add"); // add, remove, set
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React 19.2: useTransition for non-blocking product loading
  const [isLoadingProducts, startLoadTransition] = useTransition();

  // Memoized product loader
  const loadProducts = useCallback(() => {
    startLoadTransition(async () => {
      const result = await ProductService.getProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      }
    });
  }, []);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) {
      toast.error("Please select a product and enter a quantity");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    setIsSubmitting(true);

    try {
      let adjustmentValue = qty;
      if (adjustmentType === "remove") {
        adjustmentValue = -qty;
      } else if (adjustmentType === "set") {
        // For 'set', we calculate the difference
        if (!selectedProduct) return;
        adjustmentValue = qty - selectedProduct.quantity;
      }

      const formData = new FormData();
      formData.append("id", selectedProductId);
      formData.append("adjustment", adjustmentValue.toString());
      // Note: adjustStock action doesn't currently accept a reason/note, but we could add it later

      const result = await adjustStock(formData);

      if (result.success) {
        toast.success(result.message);
        setQuantity("");
        setReason("");
        router.refresh();
        // Refresh products using transition
        loadProducts();
      } else {
        toast.error(result.message || "Failed to adjust stock");
      }
    } catch (error) {
      console.error("Adjustment error:", error);
      toast.error("An error occurred during adjustment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Adjust Stock Level</CardTitle>
        <CardDescription>
          Manually increase or decrease stock for a product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
              disabled={isLoadingProducts}
            >
              <SelectTrigger id="product">
                <SelectValue
                  placeholder={
                    isLoadingProducts
                      ? "Loading products..."
                      : "Select a product"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (Current: {product.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-muted rounded-md text-sm">
              <p>
                <strong>SKU:</strong> {selectedProduct.sku || "N/A"}
              </p>
              <p>
                <strong>Current Stock:</strong> {selectedProduct.quantity}
              </p>
              <p>
                <strong>Price:</strong> ₱
                {Number(selectedProduct.price).toFixed(2)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Adjustment Type</Label>
              <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock (+)</SelectItem>
                  <SelectItem value="remove">Remove Stock (-)</SelectItem>
                  <SelectItem value="set">Set Exact Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Enter amount"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Damaged, Found inventory, Correction"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !selectedProductId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Stock"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
