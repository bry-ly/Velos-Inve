import type React from "react";
import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { StockMovementDataTable } from "@/components/stock/stock-movement-data-table";
import {
  getStockMovements,
  getStockMovementSummary,
} from "@/lib/action/stock-movement";
import { getLocationOptions } from "@/lib/action/location";
import { prisma } from "@/lib/prisma/prisma";
import { IconHistory } from "@tabler/icons-react";

export const metadata = {
  title: "Stock History | Velos Inventory",
  description: "View stock movement history and transaction logs",
};

interface PageProps {
  searchParams: Promise<{
    productId?: string;
    locationId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    reference?: string;
  }>;
}

async function StockHistoryContent({ searchParams }: PageProps) {
  const params = await searchParams;
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

  const filters = {
    productId: params.productId,
    locationId: params.locationId,
    type: params.type,
    startDate: params.startDate,
    endDate: params.endDate,
    reference: params.reference,
  };

  // Fetch data in parallel
  const [movementsResult, summaryResult, locationsResult, products] =
    await Promise.all([
      getStockMovements(filters),
      getStockMovementSummary(filters),
      getLocationOptions(),
      prisma.product.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

  const movements = movementsResult.success ? movementsResult.data : [];
  const summary = summaryResult.success
    ? summaryResult.data
    : {
        totalIn: 0,
        totalInCount: 0,
        totalOut: 0,
        totalOutCount: 0,
        adjustments: 0,
        adjustmentCount: 0,
        transferCount: 0,
      };
  const locations =
    locationsResult.success && locationsResult.data
      ? locationsResult.data.options
      : [];

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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconHistory className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Stock History
                  </h1>
                  <p className="text-muted-foreground">
                    View stock movements, transfers, and adjustments
                  </p>
                </div>
              </div>
            </div>

            <StockMovementDataTable
              movements={movements}
              summary={summary}
              locations={locations}
              products={products}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function StockHistoryPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <StockHistoryContent searchParams={props.searchParams} />
    </Suspense>
  );
}
