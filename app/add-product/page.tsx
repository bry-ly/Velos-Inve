import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductForm } from "@/components/product/product-form";
import { prisma } from "@/lib/prisma/prisma";
import { AddCategoryButton } from "@/components/inventory/add-category-button";

export const metadata = {
  title: "Dashboard | Add Product",
};

export default async function AddProductPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
  ]);
  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));
  const tagOptions = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
    userId: tag.userId,
  }));
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
      <AppSidebar user={userSidebar} variant="inset" />
      <SidebarInset>
        <SiteHeader action={<AddCategoryButton />} />
        <main className="p-8">
          <div className="max-w-4xl justify-center mx-auto">
            <ProductForm categories={categoryOptions} tags={tagOptions} submitLabel="Add product to inventory" showResetButton={true} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
