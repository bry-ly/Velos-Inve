import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
  const categoryOptions = categories.map(
    (category: { id: string; name: string }) => ({
      id: category.id,
      name: category.name,
    })
  );
  const tagOptions = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
    userId: tag.userId,
  }));

  return (
    <>
      <SiteHeader action={<AddCategoryButton />} />
      <main className="p-8">
        <div className="max-w-4xl justify-center mx-auto">
          <ProductForm
            categories={categoryOptions}
            tags={tagOptions}
            submitLabel="Add product to inventory"
            showResetButton={true}
          />
        </div>
      </main>
    </>
  );
}
