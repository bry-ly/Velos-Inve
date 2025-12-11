import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { BatchForm } from "@/components/batches/batch-form";
import { BatchQuantityAdjustment } from "@/components/batches/batch-quantity-adjustment";
import { getBatchById } from "@/lib/action/batch";
import { prisma } from "@/lib/prisma/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconPackage,
  IconHistory,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const result = await getBatchById(params.id);

  return {
    title:
      result.success && result.data
        ? `Edit ${result.data.batchNumber} | Batches`
        : "Batch Not Found",
  };
}

export default async function EditBatchPage(props: PageProps) {
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

  const [result, products] = await Promise.all([
    getBatchById(params.id),
    prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true },
    }),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const batch = result.data;

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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/batches">
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
                      {batch.batchNumber}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {batch.productName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {batch.isExpired && (
                  <Badge variant="destructive" className="gap-1">
                    <IconAlertTriangle className="h-3 w-3" />
                    Expired
                  </Badge>
                )}
                {!batch.isExpired &&
                  batch.daysUntilExpiry !== null &&
                  batch.daysUntilExpiry <= 30 && (
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-600"
                    >
                      {batch.daysUntilExpiry} days until expiry
                    </Badge>
                  )}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BatchForm
                  defaultValues={{
                    productId: batch.productId,
                    batchNumber: batch.batchNumber,
                    quantity: batch.quantity,
                    costPrice: batch.costPrice ?? undefined,
                    expiryDate: batch.expiryDate
                      ? batch.expiryDate.split("T")[0]
                      : "",
                    manufacturingDate: batch.manufacturingDate
                      ? batch.manufacturingDate.split("T")[0]
                      : "",
                    notes: batch.notes ?? "",
                  }}
                  batchId={batch.id}
                  products={products}
                  submitLabel="Save Changes"
                  showResetButton={false}
                  isEdit
                />
              </div>

              <div className="space-y-4">
                {/* Quantity Adjustment */}
                <BatchQuantityAdjustment
                  batchId={batch.id}
                  currentQuantity={batch.quantity}
                  batchNumber={batch.batchNumber}
                />

                {/* Recent Movements */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <IconHistory className="h-4 w-4" />
                      Recent Movements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {batch.stockMovements.length > 0 ? (
                      <div className="space-y-3">
                        {batch.stockMovements.map((movement) => (
                          <div
                            key={movement.id}
                            className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                          >
                            <div>
                              <div className="text-sm font-medium capitalize">
                                {movement.type}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(
                                  movement.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div
                              className={`font-medium ${
                                movement.quantity >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {movement.quantity >= 0 ? "+" : ""}
                              {movement.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No movements recorded.
                      </p>
                    )}
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
