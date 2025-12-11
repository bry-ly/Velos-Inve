import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { CustomerForm } from "@/components/customers/customer-form";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconUserPlus } from "@tabler/icons-react";

export const metadata = {
  title: "Add Customer | Velos Inventory",
  description: "Add a new customer to your system",
};

export default async function NewCustomerPage() {
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
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/customers">
                  <Button variant="outline" size="icon">
                    <IconArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <IconUserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Add New Customer
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Enter customer details below
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Form */}
            <div className="max-w-2xl">
              <CustomerForm />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
