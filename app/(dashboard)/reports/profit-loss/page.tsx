import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getProfitLossSummary,
  getSalesPerformance,
  getProductPerformance,
} from "@/lib/action/report";
import { ProfitLossCharts } from "@/components/reports/profit-loss-charts";
import { ProductPerformanceTable } from "@/components/reports/product-performance-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconChartBar,
  IconCoin,
  IconReceipt,
  IconTrendingUp,
} from "@tabler/icons-react";

export const metadata = {
  title: "Profit & Loss | Velos Inventory",
  description: "View profitability reports and financial performance",
};

interface PageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function ProfitLossPage(props: PageProps) {
  const params = await props.searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const dates = {
    startDate: params.startDate,
    endDate: params.endDate,
  };

  const [summaryResult, salesPerformanceResult, productsResult] =
    await Promise.all([
      getProfitLossSummary(dates),
      getSalesPerformance(dates),
      getProductPerformance(),
    ]);

  const summary =
    summaryResult.success && summaryResult.data
      ? summaryResult.data
      : {
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          grossMargin: 0,
          netProfit: 0,
          totalDiscount: 0,
          totalTax: 0,
          transactionCount: 0,
        };

  const salesData = salesPerformanceResult.success
    ? salesPerformanceResult.data
    : [];
  const performanceProducts = productsResult.success ? productsResult.data : [];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <IconChartBar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Profit & Loss
                </h1>
                <p className="text-muted-foreground">
                  Financial performance and profitability overview
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <IconCoin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summary.revenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.transactionCount} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">COGS</CardTitle>
                <IconReceipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summary.cogs.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cost of Goods Sold
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
                <IconTrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${summary.netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Before indirect expenses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profit Margin
                </CardTitle>
                <IconChartBar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.grossMargin.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Gross Margin</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <ProfitLossCharts data={salesData} />
            <ProductPerformanceTable products={performanceProducts} />
          </div>
        </div>
      </main>
    </>
  );
}
