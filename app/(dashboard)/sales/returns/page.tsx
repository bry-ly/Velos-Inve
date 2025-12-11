import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";

export default async function ReturnsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <>
      <SiteHeader title="Returns" />
      <main className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-bold">Returns</h1>
        <p className="text-muted-foreground">Manage returns here.</p>
      </main>
    </>
  );
}
