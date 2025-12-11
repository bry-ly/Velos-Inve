import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
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
  const userId = user.id;

  const [allProducts, categories, tags] = await Promise.all([
    prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        supplier: true,
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
    supplierId: p.supplierId,
    supplierName: p.supplier?.name ?? null,
    imageUrl: p.imageUrl,
    warrantyMonths: p.warrantyMonths,
    location: p.location,
    compatibility: p.compatibility,
    notes: p.notes,
    userId: p.userId,
    createdAt: p.createdAt.toISOString(),
    tags: p.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
  }));

  return (
    <>
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
                initialFilters={{
                  search: (searchParams.search as string) ?? "",
                  category: (searchParams.category as string) ?? "all",
                  manufacturer: (searchParams.manufacturer as string) ?? "all",
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
    </>
  );
}
