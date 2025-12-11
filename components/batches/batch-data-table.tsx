"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  IconEdit,
  IconTrash,
  IconSearch,
  IconPlus,
  IconPackage,
  IconAlertTriangle,
  IconClock,
  IconCalendar,
} from "@tabler/icons-react";
import { deleteBatch } from "@/lib/action/batch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BatchRecord {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  batchNumber: string;
  quantity: number;
  costPrice: number | null;
  expiryDate: string | null;
  manufacturingDate: string | null;
  notes: string | null;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
}

interface BatchDataTableProps {
  batches: BatchRecord[];
  products: Product[];
}

export function BatchDataTable({ batches, products }: BatchDataTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [productFilter, setProductFilter] = React.useState("");
  const [expiryFilter, setExpiryFilter] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filteredBatches = React.useMemo(() => {
    let filtered = batches;

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(lowerSearch) ||
          b.productName.toLowerCase().includes(lowerSearch) ||
          b.productSku?.toLowerCase().includes(lowerSearch)
      );
    }

    if (productFilter) {
      filtered = filtered.filter((b) => b.productId === productFilter);
    }

    if (expiryFilter === "expired") {
      filtered = filtered.filter((b) => b.isExpired);
    } else if (expiryFilter === "expiring_soon") {
      filtered = filtered.filter(
        (b) =>
          b.daysUntilExpiry !== null &&
          b.daysUntilExpiry >= 0 &&
          b.daysUntilExpiry <= 30
      );
    } else if (expiryFilter === "no_expiry") {
      filtered = filtered.filter((b) => b.expiryDate === null);
    }

    return filtered;
  }, [batches, searchTerm, productFilter, expiryFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const formData = new FormData();
    formData.append("id", deleteId);

    try {
      const result = await deleteBatch(formData);
      if (result?.success) {
        toast.success(result.message ?? "Batch deleted");
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to delete batch");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const batchToDelete = batches.find((b) => b.id === deleteId);

  // Stats
  const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
  const expiredCount = batches.filter(
    (b) => b.isExpired && b.quantity > 0
  ).length;
  const expiringCount = batches.filter(
    (b) =>
      b.daysUntilExpiry !== null &&
      b.daysUntilExpiry >= 0 &&
      b.daysUntilExpiry <= 30 &&
      b.quantity > 0
  ).length;

  const getExpiryBadge = (batch: BatchRecord) => {
    if (!batch.expiryDate) return null;

    if (batch.isExpired) {
      return (
        <Badge variant="destructive" className="gap-1">
          <IconAlertTriangle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    if (batch.daysUntilExpiry !== null && batch.daysUntilExpiry <= 7) {
      return (
        <Badge variant="destructive" className="gap-1">
          <IconClock className="h-3 w-3" />
          {batch.daysUntilExpiry}d left
        </Badge>
      );
    }

    if (batch.daysUntilExpiry !== null && batch.daysUntilExpiry <= 30) {
      return (
        <Badge
          variant="outline"
          className="gap-1 text-yellow-600 border-yellow-600"
        >
          <IconClock className="h-3 w-3" />
          {batch.daysUntilExpiry}d left
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quantity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalQuantity.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconClock className="h-4 w-4 text-yellow-500" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {expiringCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4 text-red-500" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {expiredCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={expiryFilter} onValueChange={setExpiryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              <SelectItem value="no_expiry">No Expiry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/batches/new">
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Batch
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch #</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">
                    {batch.batchNumber}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/inventory/${batch.productId}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <IconPackage className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div>{batch.productName}</div>
                        {batch.productSku && (
                          <div className="text-xs text-muted-foreground">
                            {batch.productSku}
                          </div>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {batch.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {batch.costPrice !== null
                      ? `$${batch.costPrice.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {batch.expiryDate ? (
                      <span className="flex items-center gap-2">
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(batch.expiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getExpiryBadge(batch)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/batches/${batch.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(batch.id)}
                        disabled={batch.quantity > 0}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground">
                      {searchTerm || productFilter || expiryFilter
                        ? "No batches found matching your filters."
                        : "No batches yet. Add your first batch!"}
                    </span>
                    {!searchTerm && !productFilter && !expiryFilter && (
                      <Link href="/batches/new">
                        <Button size="sm">
                          <IconPlus className="mr-2 h-4 w-4" />
                          Add Batch
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              {batchToDelete ? (
                <>
                  Are you sure you want to delete batch{" "}
                  <strong>{batchToDelete.batchNumber}</strong>?
                  {batchToDelete.quantity > 0 && (
                    <span className="block mt-2 text-destructive">
                      This batch has {batchToDelete.quantity} items. Adjust
                      quantity to 0 first.
                    </span>
                  )}
                </>
              ) : (
                "Are you sure you want to delete this batch?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting || (batchToDelete?.quantity ?? 0) > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
