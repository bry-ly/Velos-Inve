"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  IconSearch,
  IconArrowDown,
  IconArrowUp,
  IconArrowsExchange,
  IconAdjustments,
  IconPackage,
  IconDownload,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockMovementRecord {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  locationId: string | null;
  locationName: string | null;
  type: string;
  quantity: number;
  reference: string | null;
  referenceType: string | null;
  notes: string | null;
  createdAt: string;
}

interface Location {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface StockMovementSummary {
  totalIn: number;
  totalInCount: number;
  totalOut: number;
  totalOutCount: number;
  adjustments: number;
  adjustmentCount: number;
  transferCount: number;
}

interface StockMovementDataTableProps {
  movements: StockMovementRecord[];
  summary: StockMovementSummary;
  locations: Location[];
  products: Product[];
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  in: {
    label: "In",
    icon: <IconArrowDown className="h-4 w-4" />,
    color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  },
  receive: {
    label: "Receive",
    icon: <IconArrowDown className="h-4 w-4" />,
    color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  },
  out: {
    label: "Out",
    icon: <IconArrowUp className="h-4 w-4" />,
    color: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
  },
  adjustment: {
    label: "Adjust",
    icon: <IconAdjustments className="h-4 w-4" />,
    color:
      "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
  },
  transfer: {
    label: "Transfer",
    icon: <IconArrowsExchange className="h-4 w-4" />,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  },
};

export function StockMovementDataTable({
  movements,
  summary,
  locations,
  products,
}: StockMovementDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filters from URL
  const currentProductId = searchParams.get("productId") || "";
  const currentLocationId = searchParams.get("locationId") || "";
  const currentType = searchParams.get("type") || "";
  const currentStartDate = searchParams.get("startDate") || "";
  const currentEndDate = searchParams.get("endDate") || "";
  const currentReference = searchParams.get("reference") || "";

  const [productId, setProductId] = React.useState(currentProductId || "all");
  const [locationId, setLocationId] = React.useState(
    currentLocationId || "all"
  );
  const [type, setType] = React.useState(currentType || "all");
  const [startDate, setStartDate] = React.useState(currentStartDate);
  const [endDate, setEndDate] = React.useState(currentEndDate);
  const [reference, setReference] = React.useState(currentReference);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (productId && productId !== "all") params.set("productId", productId);
    if (locationId && locationId !== "all")
      params.set("locationId", locationId);
    if (type && type !== "all") params.set("type", type);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (reference) params.set("reference", reference);

    router.push(`/stock/history?${params.toString()}`);
  };

  const clearFilters = () => {
    setProductId("all");
    setLocationId("all");
    setType("all");
    setStartDate("");
    setEndDate("");
    setReference("");
    router.push("/stock/history");
  };

  const hasFilters =
    (productId && productId !== "all") ||
    (locationId && locationId !== "all") ||
    (type && type !== "all") ||
    startDate ||
    endDate ||
    reference;

  const exportToCsv = () => {
    const headers = [
      "Date",
      "Product",
      "SKU",
      "Type",
      "Quantity",
      "Location",
      "Reference",
      "Notes",
    ];
    const rows = movements.map((m) => [
      new Date(m.createdAt).toLocaleString(),
      m.productName,
      m.productSku || "",
      m.type,
      m.quantity.toString(),
      m.locationName || "",
      m.reference || "",
      m.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-movements-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconArrowDown className="h-4 w-4 text-green-500" />
              Stock In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{summary.totalIn.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalInCount} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconArrowUp className="h-4 w-4 text-red-500" />
              Stock Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{summary.totalOut.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalOutCount} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconAdjustments className="h-4 w-4 text-yellow-500" />
              Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.adjustments >= 0 ? "+" : ""}
              {summary.adjustments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.adjustmentCount} adjustments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconArrowsExchange className="h-4 w-4 text-blue-500" />
              Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.transferCount}</div>
            <p className="text-xs text-muted-foreground">transfer operations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconFilter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">In</SelectItem>
                <SelectItem value="out">Out</SelectItem>
                <SelectItem value="receive">Receive</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1">
                <IconSearch className="h-4 w-4 mr-2" />
                Apply
              </Button>
              {hasFilters && (
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <IconX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={exportToCsv}
          disabled={movements.length === 0}
        >
          <IconDownload className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length > 0 ? (
              movements.map((movement) => {
                const config = TYPE_CONFIG[movement.type] || TYPE_CONFIG.in;
                return (
                  <TableRow key={movement.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(movement.createdAt).toLocaleDateString()}
                      <span className="block text-xs text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleTimeString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/inventory/${movement.productId}`}
                        className="hover:underline"
                      >
                        <div className="flex items-center gap-2">
                          <IconPackage className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {movement.productName}
                            </div>
                            {movement.productSku && (
                              <div className="text-xs text-muted-foreground">
                                {movement.productSku}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={config.color}>
                        <span className="flex items-center gap-1">
                          {config.icon}
                          {config.label}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          movement.quantity >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {movement.quantity >= 0 ? "+" : ""}
                        {movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      {movement.locationName || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {movement.reference ? (
                        <span className="text-sm">{movement.reference}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {movement.notes || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <span className="text-muted-foreground">
                    No stock movements found.
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {movements.length >= 500 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing the most recent 500 movements. Use filters to narrow results.
        </p>
      )}
    </div>
  );
}
