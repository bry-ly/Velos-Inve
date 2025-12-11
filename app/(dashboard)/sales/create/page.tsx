import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { CreateSaleForm } from "@/components/sales/create-sale-form";
import { getProducts } from "@/lib/action/product";
import type { Product } from "@/lib/types";

export default async function CreateSalePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const result = await getProducts();
  const products = result.success ? (result.data as Product[]) : [];

  return (
    <>
      <SiteHeader title="Create Sale" />
      <main className="flex-1 overflow-auto p-6">
        <CreateSaleForm initialProducts={products} />
      </main>
    </>
  );
}
