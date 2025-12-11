import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryManager } from "@/components/inventory/category-manager";
import { prisma } from "@/lib/prisma/prisma";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Categories | Hardware Management",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CategoriesPage(props: PageProps) {
  const searchParams = await props.searchParams;
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

  const [categories, totalProducts] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            manufacturer: true,
            model: true,
            quantity: true,
            price: true,
            condition: true,
            location: true,
            supplierId: true,
            warrantyMonths: true,
            specs: true,
            compatibility: true,
            notes: true,
            imageUrl: true,
            lowStockAt: true,
          },
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.product.count({
      where: { userId: user.id },
    }),
  ]);

  const categorizedProducts = categories.reduce(
    (sum, category) => sum + category._count.products,
    0
  );
  const uncategorizedProducts = totalProducts - categorizedProducts;

  const categorySummaries = categories.map((category) => ({
    id: category.id,
    name: category.name,
    productCount: category._count.products,
    products: category.products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      manufacturer: product.manufacturer,
      model: product.model,
      quantity: product.quantity,
      price: Number(product.price),
      condition: product.condition,
      location: product.location,
      supplierId: product.supplierId,
      supplierName: null,
      warrantyMonths: product.warrantyMonths,
      specs: product.specs,
      compatibility: product.compatibility,
      notes: product.notes,
      imageUrl: product.imageUrl,
      lowStockAt: product.lowStockAt,
    })),
  }));

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
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Categories
                </h1>
                <p className="text-muted-foreground">
                  Create, rename, or delete categories to keep your inventory
                  organized.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  Total: {categorySummaries.length}
                </Badge>
                <Badge variant="outline">
                  Categorized: {categorizedProducts}
                </Badge>
                <Badge variant="outline">
                  Uncategorized: {Math.max(uncategorizedProducts, 0)}
                </Badge>
              </div>
            </div>

            <CategoryManager
              categories={categorySummaries}
              selectedCategory={
                (searchParams.selectedCategory as string) || undefined
              }
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
