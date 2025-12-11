import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { getInventoryAnalytics } from "@/lib/action/product";
import { InventorySummary } from "@/components/reports/inventory-summary";
import { InventoryValueChart } from "@/components/reports/inventory-value-chart";

export default async function InventoryReportPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const { data: analytics } = await getInventoryAnalytics();

  const summaryData = analytics || {
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    valueByCategory: {},
  };

  const chartData = Object.entries(summaryData.valueByCategory).map(
    ([name, value]) => ({
      name,
      value: Number(value),
    })
  );

  return (
    <>
      <SiteHeader title="Inventory Report" />
      <main className="flex-1 overflow-auto p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory Report</h1>
          <p className="text-muted-foreground">
            Overview of your inventory value and stock levels.
          </p>
        </div>

        <InventorySummary
          totalValue={summaryData.totalValue}
          totalProducts={summaryData.totalProducts}
          lowStockCount={summaryData.lowStockCount}
          outOfStockCount={summaryData.outOfStockCount}
        />

        <div className="grid gap-4 md:grid-cols-7 ">
          <InventoryValueChart data={chartData} />
        </div>
      </main>
    </>
  );
}
