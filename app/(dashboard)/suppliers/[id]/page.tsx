import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Edit Supplier | Velos Inventory",
  description: "Edit supplier details",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSupplierPage(props: PageProps) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  const supplier = await prisma.supplier.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
  });

  if (!supplier) {
    notFound();
  }

  const defaultValues = {
    name: supplier.name,
    email: supplier.email ?? "",
    phone: supplier.phone ?? "",
    address: supplier.address ?? "",
    contactPerson: supplier.contactPerson ?? "",
    notes: supplier.notes ?? "",
  };

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
                  Edit Supplier
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update {supplier.name}&apos;s details
                </p>
              </div>
              <div className="p-6">
                <SupplierForm
                  supplierId={supplier.id}
                  defaultValues={defaultValues}
                  submitLabel="Save Changes"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
