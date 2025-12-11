import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { LocationForm } from "@/components/locations/location-form";
import { getLocationById } from "@/lib/action/location";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconArrowLeft,
  IconBuildingCog,
  IconPackage,
} from "@tabler/icons-react";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const result = await getLocationById(params.id);

  return {
    title:
      result.success && result.data
        ? `Edit ${result.data.location.name} | Locations`
        : "Location Not Found",
  };
}

export default async function EditLocationPage(props: PageProps) {
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

  const result = await getLocationById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { location, stocks } = result.data;

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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/locations">
                  <Button variant="outline" size="icon">
                    <IconArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <IconBuildingCog className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Edit Location
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Update location details
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <LocationForm
                  defaultValues={{
                    name: location.name,
                    address: location.address ?? "",
                    isDefault: location.isDefault,
                    notes: location.notes ?? "",
                  }}
                  locationId={location.id}
                  submitLabel="Save Changes"
                  showResetButton={false}
                />
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <IconPackage className="h-4 w-4" />
                      Stock at this Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stocks.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stocks.map((stock) => (
                              <TableRow key={stock.productId}>
                                <TableCell>
                                  <div className="font-medium">
                                    {stock.productName}
                                  </div>
                                  {stock.sku && (
                                    <div className="text-xs text-muted-foreground">
                                      {stock.sku}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {stock.quantity}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No products stored at this location.
                      </p>
                    )}
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
