import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { SectionCards } from "@/components/inventory/section-cards";
import { ChartAreaInteractive } from "@/components/inventory/chart-area-interactive";
import { CategoryBreakdownChart } from "@/components/inventory/category-breakdown-chart";
import { ManufacturerBreakdownChart } from "@/components/inventory/manufacturer-breakdown-chart";
import { IconCurrencyPeso } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Dashboard | Hardware Inventory Management",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DashboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
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

  const allProducts = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const totalProducts = allProducts.length;
  const totalInventoryValue = allProducts.reduce(
    (sum, p) => sum + Number(p.price) * p.quantity,
    0
  );
  const lowStockCount = allProducts.filter((p) => {
    const lowThreshold =
      p.lowStockAt == null ? undefined : Number(p.lowStockAt);
    return (
      typeof lowThreshold === "number" && Number(p.quantity) <= lowThreshold
    );
  }).length;

  const recentProductsCount = allProducts.filter((p) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(p.createdAt) >= sevenDaysAgo;
  }).length;

  // Calculate inventory value trend over the last year (365 days)
  // Optimized: sort products once by creation date, then accumulate values
  const days = 365;
  const chartData: { date: string; value: number }[] = [];
  const currentDate = new Date();

  // If we have products, calculate value based on creation dates
  if (allProducts.length > 0) {
    // Pre-normalize product creation dates once to avoid repeated date operations
    const productsWithNormalizedDates = allProducts.map((p) => {
      const normalizedDate = new Date(p.createdAt);
      normalizedDate.setHours(0, 0, 0, 0);
      return {
        product: p,
        normalizedTimestamp: normalizedDate.getTime(),
      };
    });

    // Sort products by normalized creation date once (O(n log n))
    const sortedProducts = productsWithNormalizedDates.sort(
      (a, b) => a.normalizedTimestamp - b.normalizedTimestamp
    );

    let productIndex = 0;
    let cumulativeValue = 0;

    // Iterate through each day (O(days))
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (days - i - 1));
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split("T")[0];
      const dateTimestamp = date.getTime();

      // Add all products created up to this date (O(n) total across all iterations)
      while (
        productIndex < sortedProducts.length &&
        sortedProducts[productIndex].normalizedTimestamp <= dateTimestamp
      ) {
        const p = sortedProducts[productIndex].product;
        cumulativeValue += Number(p.price) * p.quantity;
        productIndex++;
      }

      chartData.push({
        date: dateStr,
        value: cumulativeValue,
      });
    }
  } else {
    // If no products, return empty data
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (days - i - 1));
      chartData.push({
        date: date.toISOString().split("T")[0],
        value: 0,
      });
    }
  }

  // Calculate category breakdown
  const categoryBreakdown = allProducts.reduce((acc, p) => {
    const category = p.category?.name ?? "Uncategorized";
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0 };
    }
    acc[category].count += 1;
    acc[category].value += Number(p.price) * p.quantity;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  // Calculate manufacturer breakdown
  const manufacturerBreakdown = allProducts.reduce((acc, p) => {
    const manufacturer = p.manufacturer || "Unknown";
    if (!acc[manufacturer]) {
      acc[manufacturer] = { count: 0, value: 0 };
    }
    acc[manufacturer].count += 1;
    acc[manufacturer].value += Number(p.price) * p.quantity;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const totalUnits = allProducts.reduce((sum, p) => sum + p.quantity, 0);
  const avgProductPrice = totalUnits > 0 ? totalInventoryValue / totalUnits : 0;
  const uniqueCategories = new Set(
    allProducts.map((p) => p.category?.id).filter(Boolean)
  ).size;

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
        <SiteHeader title="Dashboard" />
        <main className="flex-1 overflow-auto">
          <div className="space-y-8 p-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
              <p className="mt-1 text-muted-foreground">
                Here&apos;s an overview of your inventory
              </p>
            </div>

            <SectionCards
              totalRevenue={totalInventoryValue}
              totalProducts={totalProducts}
              lowStockCount={lowStockCount}
              recentProducts={recentProductsCount}
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ChartAreaInteractive
                  chartData={chartData}
                  dateRange={(searchParams.dateRange as string) || "90d"}
                />
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-sm text-muted-foreground">
                      Avg Unit Price
                    </span>
                    <span className="font-semibold flex items-center gap-1">
                      <IconCurrencyPeso className="size-4" />
                      {avgProductPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-sm text-muted-foreground">
                      Total Units
                    </span>
                    <span className="font-semibold">
                      {totalUnits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Categories
                    </span>
                    <span className="font-semibold">{uniqueCategories}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <CategoryBreakdownChart
                data={Object.entries(categoryBreakdown).map(
                  ([category, data]) => ({
                    category,
                    count: data.count,
                    value: data.value,
                  })
                )}
              />
              <ManufacturerBreakdownChart
                data={Object.entries(manufacturerBreakdown).map(
                  ([manufacturer, data]) => ({
                    manufacturer,
                    count: data.count,
                    value: data.value,
                  })
                )}
              />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
