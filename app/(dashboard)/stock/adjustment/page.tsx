import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { AdjustmentForm } from "@/components/stock/adjustment-form";

export default async function StockAdjustmentPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <>
      <SiteHeader title="Stock Adjustment" />
      <main className="flex-1 overflow-auto p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Stock Adjustment</h1>
          <p className="text-muted-foreground">
            Manually adjust stock levels for your inventory.
          </p>
        </div>

        <AdjustmentForm />
      </main>
    </>
  );
}
