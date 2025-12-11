import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { getBatches } from "@/lib/action/batch";
import { BatchDataTable } from "@/components/batches/batch-data-table";
import { prisma } from "@/lib/prisma/prisma";
import { IconPackages } from "@tabler/icons-react";

export const metadata = {
  title: "Batches | Velos Inventory",
  description: "Manage product batches and lot tracking",
};

export default async function BatchesPage() {
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

  const [batchesResult, products] = await Promise.all([
    getBatches(),
    prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const batches = batchesResult.success ? batchesResult.data : [];

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
                  <IconPackages className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Batch Tracking
                  </h1>
                  <p className="text-muted-foreground">
                    Manage product batches, lots, and expiry dates
                  </p>
                </div>
              </div>
            </div>

            <BatchDataTable batches={batches} products={products} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
