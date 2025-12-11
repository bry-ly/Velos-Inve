import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import Image from "next/image";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true },
  });

  return {
    title: product ? `${product.name} | Inventory` : "Product Not Found",
  };
}

export default async function ProductPage(props: PageProps) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, supplier: true },
  });

  if (!product) {
    notFound();
  }

  // Security check: ensure product belongs to user
  if (product.userId !== session.user.id) {
    notFound();
  }

  const userSidebar = {
    name: session.user.name ?? session.user.email ?? "User",
    email: session.user.email ?? "",
    avatar: session.user.image ?? "/avatars/placeholder.svg",
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
                <Link href="/inventory">
                  <Button variant="outline" size="icon">
                    <IconArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>SKU: {product.sku || "N/A"}</span>
                    {product.category && (
                      <>
                        <span>•</span>
                        <span>{product.category.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Edit button could go here, linking to edit page or opening modal */}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Main Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {product.imageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Manufacturer
                      </span>
                      <p>{product.manufacturer || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Model
                      </span>
                      <p>{product.model || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Condition
                      </span>
                      <p className="capitalize">{product.condition || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Price
                      </span>
                      <p>${Number(product.price).toFixed(2)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Description/Notes
                    </span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {product.notes || "No notes available."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stock & Specs Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Stock & Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stock Status */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Current Stock</span>
                      <span className="text-2xl font-bold">
                        {product.quantity}
                      </span>
                    </div>
                    {product.lowStockAt &&
                      product.quantity <= product.lowStockAt && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                          <IconAlertCircle className="h-4 w-4" />
                          <span>
                            Low stock warning (Threshold: {product.lowStockAt})
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Location
                      </span>
                      <p>{product.location || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Supplier
                      </span>
                      <p>{product.supplier?.name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Warranty
                      </span>
                      <p>
                        {product.warrantyMonths
                          ? `${product.warrantyMonths} months`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Specifications
                      </span>
                      <p className="mt-1 text-sm whitespace-pre-wrap">
                        {product.specs || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Compatibility
                      </span>
                      <p className="mt-1 text-sm whitespace-pre-wrap">
                        {product.compatibility || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
