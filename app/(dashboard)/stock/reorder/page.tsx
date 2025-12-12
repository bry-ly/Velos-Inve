import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { ReorderDashboard } from "@/components/reorder/reorder-dashboard";
import {
  getReorderSuggestions,
  getReorderRules,
  getReorderStats,
} from "@/lib/action/reorder";
import { getProducts } from "@/lib/action/product";
import { getSupplierOptions } from "@/lib/action/supplier";

export const metadata = {
  title: "Reorder Automation | Stock Management",
};

export default async function ReorderPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Fetch all required data in parallel
  const [
    suggestionsResult,
    rulesResult,
    statsResult,
    productsResult,
    suppliersResult,
  ] = await Promise.all([
    getReorderSuggestions(),
    getReorderRules(),
    getReorderStats(),
    getProducts(),
    getSupplierOptions(),
  ]);

  const suggestions = suggestionsResult.data || [];
  const rules = rulesResult.data || [];
  const stats = statsResult.data || {
    totalRules: 0,
    activeRules: 0,
    pendingSuggestions: 0,
    criticalItems: 0,
  };

  // Map products for the form
  const products = productsResult.success
    ? (
        productsResult.data as Array<{
          id: string;
          name: string;
          sku?: string | null;
          quantity: number;
        }>
      ).map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku ?? null,
        quantity: p.quantity,
      }))
    : [];

  const suppliers =
    suppliersResult.success && suppliersResult.data?.options
      ? suppliersResult.data.options
      : [];

  return (
    <>
      <SiteHeader title="Reorder Automation" />
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Reorder Automation
          </h2>
          <p className="text-muted-foreground">
            Manage reorder rules and view stock replenishment suggestions
          </p>
        </div>
        <ReorderDashboard
          suggestions={suggestions}
          rules={rules}
          products={products}
          suppliers={suppliers}
          stats={stats}
        />
      </main>
    </>
  );
}
