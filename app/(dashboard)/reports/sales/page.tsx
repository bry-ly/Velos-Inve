import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { getSalesAnalytics, getRecentSales } from "@/lib/action/sales";
import { SalesSummary } from "@/components/reports/sales-summary";
import { SalesChart } from "@/components/reports/sales-chart";
import { RecentSalesTable } from "@/components/reports/recent-sales-table";

export default async function SalesReportPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const [analyticsResult, recentSalesResult] = await Promise.all([
    getSalesAnalytics("30d"),
    getRecentSales(5),
  ]);

  const analytics = (analyticsResult.data as {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    chartData: { date: string; amount: number }[];
  }) || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    chartData: [],
  };

  const recentSalesRaw = recentSalesResult.data || [];

  // Serialize Decimal fields to numbers for Client Component
  const recentSales = recentSalesRaw.map((sale: any) => ({
    ...sale,
    totalAmount: Number(sale.totalAmount),
    subtotal: Number(sale.subtotal),
    discount: Number(sale.discount),
    tax: Number(sale.tax),
    items: sale.items.map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      costPrice: Number(item.costPrice), // The culprit
      discount: Number(item.discount),
      subtotal: Number(item.subtotal),
      totalPrice: Number(item.totalPrice),
    })),
  }));

  return (
    <>
      <SiteHeader title="Sales Report" />
      <main className="flex-1 overflow-auto p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Report</h1>
          <p className="text-muted-foreground">
            Overview of your sales performance for the last 30 days.
          </p>
        </div>

        <SalesSummary
          totalRevenue={analytics.totalRevenue}
          totalOrders={analytics.totalOrders}
          averageOrderValue={analytics.averageOrderValue}
        />

        <div className="grid gap-4 md:grid-cols-7">
          <SalesChart data={analytics.chartData} />
          <RecentSalesTable sales={recentSales} />
        </div>
      </main>
    </>
  );
}
