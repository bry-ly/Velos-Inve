"use client";

import { useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconSearch, IconPlus } from "@tabler/icons-react";
import type { Product } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

interface ProductSearchProps {
  onAddToCart: (product: Product) => void;
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
}

export function ProductSearch({
  onAddToCart,
  products,
  isLoading,
  error,
}: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // React 19.2: useTransition for non-blocking search filtering
  const [isFiltering, startFilterTransition] = useTransition();

  useEffect(() => {
    startFilterTransition(() => {
      if (!debouncedSearch) {
        setFilteredProducts([]);
        return;
      }

      const lower = debouncedSearch.toLowerCase();
      const filtered = products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            (p.sku && p.sku.toLowerCase().includes(lower)) ||
            (p.manufacturer && p.manufacturer.toLowerCase().includes(lower))
        )
        .slice(0, 5); // Limit results

      setFilteredProducts(filtered);
    });
  }, [debouncedSearch, products]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name, SKU, or manufacturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
          disabled={isLoading}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Loading products...
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center text-sm text-destructive py-4">
          Error: {error}
        </div>
      )}

      {/* Product Results */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <div className="grid gap-2">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:bg-accent"
              onClick={() => {
                onAddToCart(product);
                setSearchTerm("");
              }}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{product.name}</span>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>SKU: {product.sku || "N/A"}</span>
                    <span>Stock: {product.quantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    ₱{Number(product.price).toFixed(2)}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results - Only show when user has searched and products are loaded */}
      {!isLoading &&
        !error &&
        debouncedSearch &&
        filteredProducts.length === 0 &&
        products.length > 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No products found for &quot;{debouncedSearch}&quot;.
          </div>
        )}

      {/* No Products Available */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          No products available. Please add products to your inventory first.
        </div>
      )}
    </div>
  );
}
