import {
  IconAlertCircle,
  IconPackage,
  IconCurrencyPeso,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards({
  totalRevenue,
  totalProducts,
  lowStockCount,
  recentProducts,
}: {
  totalRevenue?: number;
  totalProducts?: number;
  lowStockCount?: number;
  recentProducts?: number;
}) {
  return (
    <div
      data-tour="stats-cards"
      className="grid grid-cols-1 gap-4 px-4 lg:px-2 md:grid-cols-2 lg:grid-cols-4"
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardDescription>Total Inventory Value</CardDescription>
            <IconCurrencyPeso className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums flex items-center gap-1">
            <IconCurrencyPeso className="size-7" />
            {totalRevenue?.toLocaleString(undefined, {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
          <div className="flex items-center gap-1 font-medium text-muted-foreground">
            Total value of all products
          </div>
          <div className="text-muted-foreground text-xs">
            Calculated from price × quantity
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardDescription>Total Products</CardDescription>
            <IconPackage className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums">
            {totalProducts?.toLocaleString() ?? "0"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
          <div className="flex items-center gap-1 font-medium text-muted-foreground">
            Unique items in inventory
          </div>
          <div className="text-muted-foreground text-xs">
            Across all categories
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardDescription>Low Stock Items</CardDescription>
            {lowStockCount && lowStockCount > 0 ? (
              <Badge variant="destructive" className="gap-1">
                <IconAlertCircle className="size-3" />
                Alert
              </Badge>
            ) : (
              <IconAlertCircle className="size-4 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums">
            {lowStockCount?.toLocaleString() ?? "0"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
          <div className="flex items-center gap-1 font-medium text-muted-foreground">
            {lowStockCount && lowStockCount > 0
              ? "Items below threshold"
              : "All stock levels normal"}
          </div>
          <div className="text-muted-foreground text-xs">
            {lowStockCount && lowStockCount > 0
              ? "Review and restock soon"
              : "No immediate action needed"}
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardDescription>Recent Additions</CardDescription>
            <IconTrendingUp className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums">
            {recentProducts?.toLocaleString() ?? "0"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
          <div className="flex items-center gap-1 font-medium text-muted-foreground">
            Added in last 7 days
          </div>
          <div className="text-muted-foreground text-xs">
            New inventory items
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
