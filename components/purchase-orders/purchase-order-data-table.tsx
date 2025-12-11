"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  IconEye,
  IconTrash,
  IconSearch,
  IconPlus,
  IconTruckDelivery,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
} from "@/lib/action/purchase-order";
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
import type { POStatus } from "@/lib/validations/purchase-order";

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: POStatus;
  supplierName: string;
  supplierId: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  orderDate: string;
  expectedDate: string | null;
  receivedDate: string | null;
  createdAt: string;
}

interface PurchaseOrderDataTableProps {
  purchaseOrders: PurchaseOrder[];
}

const STATUS_BADGES: Record<POStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  ordered: {
    label: "Ordered",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  partial: {
    label: "Partial",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  received: {
    label: "Received",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

export function PurchaseOrderDataTable({
  purchaseOrders,
}: PurchaseOrderDataTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Filter purchase orders
  const filteredOrders = React.useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        !searchTerm.trim() ||
        po.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || po.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deletePurchaseOrder(deleteId);
      if (result?.success) {
        toast.success(result.message ?? "Purchase order deleted");
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to delete purchase order");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (poId: string, newStatus: POStatus) => {
    try {
      const result = await updatePurchaseOrderStatus(poId, newStatus);
      if (result?.success) {
        toast.success(result.message ?? "Status updated");
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const orderToDelete = purchaseOrders.find((po) => po.id === deleteId);

  // Stats
  const stats = React.useMemo(() => {
    const draft = purchaseOrders.filter((po) => po.status === "draft").length;
    const ordered = purchaseOrders.filter(
      (po) => po.status === "ordered"
    ).length;
    const pending = purchaseOrders.filter(
      (po) => po.status === "ordered" || po.status === "partial"
    ).length;
    const totalValue = purchaseOrders
      .filter((po) => po.status !== "cancelled")
      .reduce((sum, po) => sum + po.totalAmount, 0);

    return { draft, ordered, pending, totalValue };
  }, [purchaseOrders]);

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative w-full max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/purchase-orders/create">
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Create PO
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱
              {stats.totalValue.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">
                    {po.orderNumber}
                  </TableCell>
                  <TableCell>{po.supplierName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGES[po.status].className}
                    >
                      {STATUS_BADGES[po.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{po.itemCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₱
                    {po.totalAmount.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(po.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {po.expectedDate
                      ? new Date(po.expectedDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/purchase-orders/${po.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </Link>

                      {po.status === "draft" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => handleStatusChange(po.id, "ordered")}
                            title="Mark as Ordered"
                          >
                            <IconTruckDelivery className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(po.id)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {(po.status === "ordered" || po.status === "partial") && (
                        <>
                          <Link href={`/purchase-orders/${po.id}/receive`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              title="Receive Items"
                            >
                              <IconCheck className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              handleStatusChange(po.id, "cancelled")
                            }
                            title="Cancel Order"
                          >
                            <IconX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "No purchase orders found matching your filters."
                        : "No purchase orders yet. Create your first order!"}
                    </span>
                    {!searchTerm && statusFilter === "all" && (
                      <Link href="/purchase-orders/create">
                        <Button size="sm">
                          <IconPlus className="mr-2 h-4 w-4" />
                          Create PO
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              {orderToDelete ? (
                <>
                  Are you sure you want to delete purchase order{" "}
                  <strong>{orderToDelete.orderNumber}</strong>? This action
                  cannot be undone.
                </>
              ) : (
                "Are you sure you want to delete this purchase order?"
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
              disabled={isDeleting}
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
