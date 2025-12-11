import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { StockTransferForm } from "@/components/locations/stock-transfer-form";
import { getLocationOptions } from "@/lib/action/location";
import { prisma } from "@/lib/prisma/prisma";
import { Button } from "@/components/ui/button";
import { IconTransferIn } from "@tabler/icons-react";

export const metadata = {
  title: "Stock Transfer | Velos Inventory",
  description: "Transfer stock between warehouse locations",
};

export default async function StockTransferPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  // Fetch locations and products
  const [locationsResult, products] = await Promise.all([
    getLocationOptions(),
    prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
      },
    }),
  ]);

  const locations =
    locationsResult.success && locationsResult.data
      ? locationsResult.data.options
      : [];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IconTransferIn className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Stock Transfer
                </h1>
                <p className="text-muted-foreground">
                  Transfer products between warehouse locations
                </p>
              </div>
            </div>
          </div>

          {locations.length < 2 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                You need at least 2 locations to transfer stock.
              </p>
              <Link href="/locations/new" className="mt-4 inline-block">
                <Button>Add Location</Button>
              </Link>
            </div>
          ) : (
            <div className="max-w-2xl">
              <StockTransferForm locations={locations} products={products} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
