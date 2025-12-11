import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { SupplierDataTable } from "@/components/suppliers/supplier-data-table";

export const metadata: Metadata = {
  title: "Suppliers | Velos Inventory",
  description: "Manage your suppliers",
};

export default async function SuppliersPage() {
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

  const userId = user.id;

  const suppliers = await prisma.supplier.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          products: true,
          purchaseOrders: true,
        },
      },
    },
  });

  const supplierData = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    contactPerson: s.contactPerson,
    productCount: s._count.products,
    purchaseOrderCount: s._count.purchaseOrders,
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
            <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
              <div className="border-b border-border p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Suppliers
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage your product suppliers and vendors
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <SupplierDataTable suppliers={supplierData} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
