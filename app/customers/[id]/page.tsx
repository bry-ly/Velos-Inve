import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { CustomerForm } from "@/components/customers/customer-form";
import { getCustomerById } from "@/lib/action/customer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconUserEdit,
  IconShoppingCart,
  IconReceipt,
} from "@tabler/icons-react";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const result = await getCustomerById(params.id);

  return {
    title:
      result.success && result.data
        ? `Edit ${result.data.customer.name} | Customers`
        : "Customer Not Found",
  };
}

export default async function EditCustomerPage(props: PageProps) {
  const params = await props.params;
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

  const result = await getCustomerById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { customer, salesCount, recentSales } = result.data;

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
                    <IconUserEdit className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Edit Customer
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Update customer information
                    </p>
                  </div>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="gap-1 self-start md:self-center"
              >
                <IconShoppingCart className="h-3 w-3" />
                {salesCount} Sales
              </Badge>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Customer Form */}
              <div className="lg:col-span-2">
                <CustomerForm
                  defaultValues={{
                    name: customer.name,
                    email: customer.email ?? "",
                    phone: customer.phone ?? "",
                    address: customer.address ?? "",
                    notes: customer.notes ?? "",
                  }}
                  customerId={customer.id}
                  submitLabel="Save Changes"
                  showResetButton={false}
                />
              </div>

              {/* Recent Sales Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <IconReceipt className="h-4 w-4" />
                      Recent Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentSales.length > 0 ? (
                      <div className="space-y-3">
                        {recentSales.map((sale) => (
                          <div
                            key={sale.id}
                            className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                #{sale.invoiceNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(sale.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="font-medium">
                              {new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                              }).format(sale.total)}
                            </p>
                          </div>
                        ))}
                        {salesCount > recentSales.length && (
                          <p className="text-center text-xs text-muted-foreground pt-2">
                            +{salesCount - recentSales.length} more sales
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No sales recorded for this customer yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Customer Since
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
