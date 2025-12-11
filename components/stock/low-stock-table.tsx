"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { ProductNameCell } from "@/components/inventory/columns/cells/product-name-cell";
import { QuantityCell } from "@/components/inventory/columns/cells/quantity-cell";

interface LowStockTableProps {
  products: Product[];
}

export function LowStockTable({ products }: LowStockTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Supplier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <ProductNameCell product={product} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.categoryName || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <QuantityCell product={product} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      Alert at {product.lowStockAt}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{product.supplierName || "—"}</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No low stock products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
