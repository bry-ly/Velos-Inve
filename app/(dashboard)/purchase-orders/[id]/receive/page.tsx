import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { getPurchaseOrderById } from "@/lib/action/purchase-order";
import { ReceiveItemsForm } from "@/components/purchase-orders/receive-items-form";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const result = await getPurchaseOrderById(params.id);

  return {
    title:
      result.success && result.data
        ? `Receive ${result.data.orderNumber} | Purchase Orders`
        : "Purchase Order Not Found",
  };
}

export default async function ReceivePurchaseOrderPage(props: PageProps) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const result = await getPurchaseOrderById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const po = result.data;

  // Can only receive items for ordered or partial status
  if (po.status !== "ordered" && po.status !== "partial") {
    redirect(`/purchase-orders/${params.id}`);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <ReceiveItemsForm
            purchaseOrderId={po.id}
            orderNumber={po.orderNumber}
            items={po.items}
          />
        </div>
      </main>
    </>
  );
}
