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

interface ProductStats {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  unitsSold: number;
}

interface ProductPerformanceTableProps {
  products: ProductStats[];
}

export function ProductPerformanceTable({
  products,
}: ProductPerformanceTableProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Top Performing Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">
                    {product.unitsSold}
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.revenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    ${product.profit.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={product.margin > 30 ? "default" : "secondary"}
                      className={
                        product.margin > 50
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {product.margin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No sales data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
