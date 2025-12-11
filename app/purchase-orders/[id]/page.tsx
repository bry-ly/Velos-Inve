import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { getPurchaseOrderById } from "@/lib/action/purchase-order";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  IconArrowLeft,
  IconFileInvoice,
  IconCheck,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import type { POStatus } from "@/lib/validations/purchase-order";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const result = await getPurchaseOrderById(params.id);

  return {
    title:
      result.success && result.data
        ? `PO ${result.data.orderNumber} | Purchase Orders`
        : "Purchase Order Not Found",
  };
}

export default async function PurchaseOrderDetailPage(props: PageProps) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;
  const userSidebar = {
    name: user.name ?? user.email ?? "User",
    email: user.email ?? "",
    avatar: user.image ?? "/avatars/placeholder.svg",
  };

  const result = await getPurchaseOrderById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const po = result.data;

  // Calculate overall progress
  const totalOrdered = po.items.reduce(
    (sum, item) => sum + item.orderedQuantity,
    0
  );
  const totalReceived = po.items.reduce(
    (sum, item) => sum + item.receivedQuantity,
    0
  );
  const progressPercent =
    totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={userSidebar} />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-auto">
          <div className="space-y-8 p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/purchase-orders">
                  <Button variant="outline" size="icon">
                    <IconArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <IconFileInvoice className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {po.orderNumber}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Purchase Order Details
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={STATUS_BADGES[po.status].className}
                >
                  {STATUS_BADGES[po.status].label}
                </Badge>
                {(po.status === "ordered" || po.status === "partial") && (
                  <Link href={`/purchase-orders/${po.id}/receive`}>
                    <Button>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Receive Items
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress */}
                {po.status !== "draft" && po.status !== "cancelled" && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Receiving Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={progressPercent} className="h-2" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {totalReceived} of {totalOrdered} items received (
                        {progressPercent.toFixed(0)}%)
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>
                      {po.items.length} item(s) in this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-center">
                              Ordered
                            </TableHead>
                            <TableHead className="text-center">
                              Received
                            </TableHead>
                            <TableHead className="text-right">
                              Unit Cost
                            </TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {po.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.productName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {item.sku || "—"}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.orderedQuantity}
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={
                                    item.receivedQuantity >=
                                    item.orderedQuantity
                                      ? "text-green-600"
                                      : item.receivedQuantity > 0
                                      ? "text-yellow-600"
                                      : ""
                                  }
                                >
                                  {item.receivedQuantity}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                ₱{item.unitCost.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ₱{item.totalCost.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {po.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {po.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Supplier Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Supplier</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-medium">{po.supplier.name}</p>
                    {po.supplier.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconMail className="h-4 w-4" />
                        {po.supplier.email}
                      </div>
                    )}
                    {po.supplier.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconPhone className="h-4 w-4" />
                        {po.supplier.phone}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₱{po.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>₱{po.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>₱{po.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 font-bold">
                      <span>Total</span>
                      <span>₱{po.totalAmount.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date</span>
                      <span>{new Date(po.orderDate).toLocaleDateString()}</span>
                    </div>
                    {po.expectedDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected</span>
                        <span>
                          {new Date(po.expectedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {po.receivedDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received</span>
                        <span>
                          {new Date(po.receivedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(po.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
