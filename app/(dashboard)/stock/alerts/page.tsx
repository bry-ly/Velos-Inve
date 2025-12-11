import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { getLowStockProducts } from "@/lib/action/product";
import { LowStockTable } from "@/components/stock/low-stock-table";

export default async function LowStockAlertsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const { data: lowStockProducts } = await getLowStockProducts();

  // Convert Decimal to number for the UI and Date to string
  const formattedProducts =
    lowStockProducts?.map((p) => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      // Ensure other Decimal fields are handled if necessary, though Product type expects price as string | number
    })) || [];

  return (
    <>
      <SiteHeader title="Low Stock Alerts" />
      <main className="flex-1 overflow-auto p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Low Stock Alerts</h1>
          <p className="text-muted-foreground">
            Products that have reached their low stock threshold.
          </p>
        </div>

        <LowStockTable products={formattedProducts} />
      </main>
    </>
  );
}
