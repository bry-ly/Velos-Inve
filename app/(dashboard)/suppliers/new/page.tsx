import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import type { Metadata } from "next";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Add Supplier | Velos Inventory",
  description: "Add a new supplier to your inventory system",
};

export default async function NewSupplierPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          {/* Back Button */}
          <Link href="/suppliers">
            <Button variant="ghost" className="gap-2">
              <IconArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Button>
          </Link>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
              <div className="border-b border-border p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Add New Supplier
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the supplier&apos;s details below
                </p>
              </div>
              <div className="p-6">
                <SupplierForm submitLabel="Add Supplier" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
