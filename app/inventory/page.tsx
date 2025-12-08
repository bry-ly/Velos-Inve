import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { InventoryDataTable } from "@/components/inventory/inventory-data-table";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma/prisma";
import { IconPlus, IconTags } from "@tabler/icons-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inventory Management",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function InventoryPage(props: PageProps) {
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

  const userId = user.id;

  const [allProducts, categories, tags, savedFilters] = await Promise.all([
    prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryFilter.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
    productCount: category._count.products,
  }));

  const items = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    manufacturer: p.manufacturer,
    model: p.model,
    condition: p.condition,
    price: Number(p.price),
    quantity: p.quantity,
    lowStockAt: p.lowStockAt,
    supplier: p.supplier,
    imageUrl: p.imageUrl,
    warrantyMonths: p.warrantyMonths,
    location: p.location,
    compatibility: p.compatibility,
    notes: p.notes,
    userId: p.userId,
    createdAt: p.createdAt.toISOString(),
    tags: p.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
  }));

  const hasUrlFilters =
    searchParams.search ||
    searchParams.category ||
    searchParams.manufacturer ||
    searchParams.condition ||
    searchParams.lowStock;

  const defaultFilter = savedFilters.find((f) => f.isDefault);

  if (!hasUrlFilters && defaultFilter) {
    const filterData = defaultFilter.filters as Record<
      string,
      string | boolean | number
    >;
    const params = new URLSearchParams();

    if (filterData.search && typeof filterData.search === "string") {
      params.set("search", filterData.search);
    }
    if (filterData.category && typeof filterData.category === "string") {
      params.set("category", filterData.category);
    }
    if (
      filterData.manufacturer &&
      typeof filterData.manufacturer === "string"
    ) {
      params.set("manufacturer", filterData.manufacturer);
    }
    if (filterData.condition && typeof filterData.condition === "string") {
      params.set("condition", filterData.condition);
    }
    if (filterData.lowStock === true) {
      params.set("lowStock", "true");
    }
    if (filterData.page && typeof filterData.page === "number") {
      params.set("page", String(filterData.page));
    }
    if (filterData.pageSize && typeof filterData.pageSize === "number") {
      params.set("pageSize", String(filterData.pageSize));
    }

    if (params.toString()) {
      redirect(`/inventory?${params.toString()}`);
    }
  }

  const serializedFilters = savedFilters.map((f) => ({
    id: f.id,
    name: f.name,
    filters: f.filters as Record<string, unknown>,
    isDefault: f.isDefault,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
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
            <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
              <div className="border-b border-border p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      All Products
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Complete inventory of all products
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href="/categories">
                      <Button variant="destructive" className="gap-2">
                        <IconTags className="h-4 w-4" />
                        Add Category
                      </Button>
                    </Link>
                    <Link href="/add-product">
                      <Button className="gap-2">
                        <IconPlus className="h-4 w-4" />
                        Add Product
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="p-6 overflow-hidden">
                <InventoryDataTable
                  items={items}
                  categories={categoryOptions.map(({ id, name }) => ({
                    id,
                    name,
                  }))}
                  tags={tags.map(({ id, name }) => ({
                    id,
                    name,
                  }))}
                  savedFilters={serializedFilters}
                  initialFilters={{
                    search: (searchParams.search as string) ?? "",
                    category: (searchParams.category as string) ?? "all",
                    manufacturer:
                      (searchParams.manufacturer as string) ?? "all",
                    condition: (searchParams.condition as string) ?? "all",
                    lowStock: searchParams.lowStock === "true",
                    page: searchParams.page
                      ? parseInt(searchParams.page as string, 10)
                      : 0,
                    pageSize: searchParams.pageSize
                      ? parseInt(searchParams.pageSize as string, 10)
                      : 12,
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
