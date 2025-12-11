"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { receivePurchaseOrderItems } from "@/lib/action/purchase-order";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { IconArrowLeft, IconCheck, IconPackage } from "@tabler/icons-react";

interface PurchaseOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
  currentStock: number | null;
}

interface ReceiveItemsFormProps {
  purchaseOrderId: string;
  orderNumber: string;
  items: PurchaseOrderItem[];
}

export function ReceiveItemsForm({
  purchaseOrderId,
  orderNumber,
  items,
}: ReceiveItemsFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [receivingQuantities, setReceivingQuantities] = React.useState<
    Record<string, number>
  >({});

  // Initialize with 0 for all items
  React.useEffect(() => {
    const initial: Record<string, number> = {};
    items.forEach((item) => {
      const remaining = item.orderedQuantity - item.receivedQuantity;
      initial[item.id] = remaining > 0 ? remaining : 0;
    });
    setReceivingQuantities(initial);
  }, [items]);

  const updateQuantity = (itemId: string, value: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const maxReceivable = item.orderedQuantity - item.receivedQuantity;
    const clampedValue = Math.max(0, Math.min(value, maxReceivable));

    setReceivingQuantities((prev) => ({
      ...prev,
      [itemId]: clampedValue,
    }));
  };

  const handleReceiveAll = () => {
    const updated: Record<string, number> = {};
    items.forEach((item) => {
      const remaining = item.orderedQuantity - item.receivedQuantity;
      updated[item.id] = remaining > 0 ? remaining : 0;
    });
    setReceivingQuantities(updated);
  };

  const handleSubmit = async () => {
    const itemsToReceive = Object.entries(receivingQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, receivedQuantity]) => ({
        itemId,
        receivedQuantity,
      }));

    if (itemsToReceive.length === 0) {
      toast.error("Please specify quantities to receive");
      return;
    }

    setIsPending(true);
    try {
      const result = await receivePurchaseOrderItems({
        purchaseOrderId,
        items: itemsToReceive,
      });

      if (result?.success) {
        toast.success(result.message ?? "Items received successfully");
        router.push(`/purchase-orders/${purchaseOrderId}`);
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to receive items");
      }
    } catch (error) {
      console.error("Receive error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  // Calculate totals
  const totalToReceive = Object.values(receivingQuantities).reduce(
    (sum, qty) => sum + qty,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/purchase-orders/${purchaseOrderId}`}>
            <Button variant="outline" size="icon">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <IconPackage className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Receive Items
              </h1>
              <p className="text-sm text-muted-foreground">{orderNumber}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReceiveAll}>
            Receive All Remaining
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || totalToReceive === 0}
          >
            <IconCheck className="mr-2 h-4 w-4" />
            {isPending ? "Processing..." : `Receive ${totalToReceive} Items`}
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            Enter the quantity received for each item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Ordered</TableHead>
                  <TableHead className="text-center">
                    Previously Received
                  </TableHead>
                  <TableHead className="text-center">Remaining</TableHead>
                  <TableHead className="w-[150px] text-center">
                    Receiving Now
                  </TableHead>
                  <TableHead className="w-[200px]">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const remaining =
                    item.orderedQuantity - item.receivedQuantity;
                  const receivingNow = receivingQuantities[item.id] || 0;
                  const afterReceive = item.receivedQuantity + receivingNow;
                  const progressPercent =
                    item.orderedQuantity > 0
                      ? (afterReceive / item.orderedQuantity) * 100
                      : 0;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                        {item.currentStock !== null && (
                          <span className="block text-xs text-muted-foreground">
                            Current stock: {item.currentStock}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.sku || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.orderedQuantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.receivedQuantity}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={
                            remaining === 0
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        >
                          {remaining}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={remaining}
                          value={receivingNow}
                          onChange={(e) =>
                            updateQuantity(
                              item.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={remaining === 0}
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={progressPercent} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {afterReceive}/{item.orderedQuantity}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
