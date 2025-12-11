import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { PurchaseOrderForm } from "@/components/purchase-orders/purchase-order-form";
import { getSupplierOptions } from "@/lib/action/supplier";
import { prisma } from "@/lib/prisma/prisma";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconFilePlus } from "@tabler/icons-react";

export const metadata = {
  title: "Create Purchase Order | Velos Inventory",
  description: "Create a new purchase order for your suppliers",
};

export default async function CreatePurchaseOrderPage() {
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

  // Fetch suppliers and products in parallel
  const [suppliersResult, products] = await Promise.all([
    getSupplierOptions(),
    prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
      },
    }),
  ]);

  const suppliers =
    suppliersResult.success && suppliersResult.data
      ? suppliersResult.data.options.map((s) => ({ id: s.id, name: s.name }))
      : [];

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
  }));

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
                    <IconFilePlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Create Purchase Order
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Order products from your suppliers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            {suppliers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">
                  You need to add at least one supplier before creating purchase
                  orders.
                </p>
                <Link href="/suppliers/new" className="mt-4 inline-block">
                  <Button>Add Supplier</Button>
                </Link>
              </div>
            ) : (
              <div className="max-w-4xl">
                <PurchaseOrderForm
                  suppliers={suppliers}
                  products={formattedProducts}
                />
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
