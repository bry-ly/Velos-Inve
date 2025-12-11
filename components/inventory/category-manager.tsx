"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconChevronDown,
  IconCurrencyPeso,
  IconPackage,
  IconMapPin,
  IconBuildingStore,
  IconShield,
  IconFileText,
} from "@tabler/icons-react";

import { deleteCategory, updateCategory } from "@/lib/action/category";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AddCategoryDialog } from "@/components/inventory/add-category-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  manufacturer: string;
  model: string | null;
  quantity: number;
  price: number;
  condition: string;
  location: string | null;
  supplierId: string | null;
  supplierName: string | null;
  warrantyMonths: number | null;
  specs: string | null;
  compatibility: string | null;
  notes: string | null;
  imageUrl: string | null;
  lowStockAt: number | null;
};

type CategorySummary = {
  id: string;
  name: string;
  productCount: number;
  products: Product[];
};

export function CategoryManager({
  categories,
  selectedCategory,
}: {
  categories: CategorySummary[];
  selectedCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(selectedCategory ? [selectedCategory] : [])
  );

  // Update URL when open categories change (optional: only if single selection desired,
  // but for multiple collapsible, URL might get long. Let's just sync the *last* opened one or keep it simple)
  // Actually, let's just support single selection in URL for now to match the requirement "highlight or expand a specific category"

  const handleOpenChange = (categoryId: string, isOpen: boolean) => {
    const newOpen = new Set(openCategories);
    if (isOpen) {
      newOpen.add(categoryId);
    } else {
      newOpen.delete(categoryId);
    }
    setOpenCategories(newOpen);

    // Update URL
    const params = new URLSearchParams(searchParams);
    if (isOpen) {
      params.set("selectedCategory", categoryId);
    } else if (categoryId === params.get("selectedCategory")) {
      params.delete("selectedCategory");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const startEditing = (category: CategorySummary) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    const normalized = editingName.trim();
    if (!normalized) {
      toast.error("Category name cannot be empty.");
      return;
    }

    setRenamingId(editingId);
    const formData = new FormData();
    formData.append("id", editingId);
    formData.append("name", normalized);

    try {
      const result = await updateCategory(formData);
      if (result?.success) {
        toast.success(result.message ?? "Category updated.");
        router.refresh();
        cancelEditing();
      } else {
        toast.error(result?.message ?? "Failed to update category.");
      }
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Unexpected error occurred.";
      toast.error("Failed to update category.", { description });
    } finally {
      setRenamingId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    setIsDeleting(true);
    const formData = new FormData();
    formData.append("id", deleteId);

    try {
      const result = await deleteCategory(formData);
      if (result?.success) {
        toast.success(result.message ?? "Category deleted.");
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to delete category.");
      }
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Unexpected error occurred.";
      toast.error("Failed to delete category.", { description });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const categoryToDelete = categories.find(
    (category) => category.id === deleteId
  );

  return (
    <>
      <Card className="h-fit border border-border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Organize inventory into quick filters and ensure new items are
            grouped correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={() => setDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Category
          </Button>

          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories yet. Create one to start organizing your products.
              </p>
            ) : (
              categories.map((category) => {
                const isEditing = editingId === category.id;
                const isRenaming = renamingId === category.id;
                return (
                  <div
                    key={category.id}
                    className="flex flex-col gap-3 rounded-lg border border-border/60 p-3 transition hover:border-border"
                  >
                    {isEditing ? (
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={handleRename}
                      >
                        <Input
                          value={editingName}
                          autoFocus
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          placeholder="Category name"
                          disabled={isRenaming}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                            disabled={isRenaming}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" size="sm" disabled={isRenaming}>
                            {isRenaming ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {category.name}
                              <Badge
                                variant="outline"
                                className="w-fit text-xs ml-2"
                              >
                                {category.productCount}{" "}
                                {category.productCount === 1 ? "item" : "items"}
                              </Badge>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEditing(category)}
                              aria-label={`Rename ${category.name}`}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive focus:text-destructive"
                              onClick={() => confirmDelete(category.id)}
                              aria-label={`Delete ${category.name}`}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {category.productCount > 0 && (
                          <Collapsible
                            open={openCategories.has(category.id)}
                            onOpenChange={(open) =>
                              handleOpenChange(category.id, open)
                            }
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between text-left text-sm text-muted-foreground hover:text-foreground"
                              >
                                <span>
                                  View products ({category.productCount})
                                </span>
                                <IconChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    openCategories.has(category.id)
                                      ? "transform rotate-180"
                                      : ""
                                  }`}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                              <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-3">
                                {category.products.map((product) => {
                                  const isLowStock =
                                    product.lowStockAt !== null &&
                                    product.quantity <= product.lowStockAt;
                                  const conditionColors: Record<
                                    string,
                                    string
                                  > = {
                                    new: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                                    used: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
                                    refurbished:
                                      "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                                    "for-parts":
                                      "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
                                  };
                                  return (
                                    <div
                                      key={product.id}
                                      className="flex flex-col gap-3 rounded-md bg-background border border-border/40 p-4"
                                    >
                                      {/* Header Section */}
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-foreground">
                                              {product.name}
                                            </h4>
                                            {isLowStock && (
                                              <Badge
                                                variant="destructive"
                                                className="text-xs"
                                              >
                                                Low Stock
                                              </Badge>
                                            )}
                                            {product.condition && (
                                              <Badge
                                                variant="outline"
                                                className={`text-xs ${
                                                  conditionColors[
                                                    product.condition
                                                  ] || "bg-muted"
                                                }`}
                                              >
                                                {product.condition}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                            {product.manufacturer && (
                                              <span className="font-medium">
                                                {product.manufacturer}
                                              </span>
                                            )}
                                            {product.model && (
                                              <span>• {product.model}</span>
                                            )}
                                            {product.sku && (
                                              <span>• SKU: {product.sku}</span>
                                            )}
                                          </div>
                                        </div>
                                        {product.imageUrl && (
                                          <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded-md border border-border/40"
                                            unoptimized
                                            width={64}
                                            height={64}
                                          />
                                        )}
                                      </div>

                                      {/* Details Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {/* Inventory Info */}
                                        <div className="flex items-center gap-2">
                                          <IconPackage className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-muted-foreground">
                                            Quantity:
                                          </span>
                                          <span className="font-medium text-foreground">
                                            {product.quantity}
                                            {product.lowStockAt &&
                                              ` / ${product.lowStockAt} threshold`}
                                          </span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center gap-2">
                                          <IconCurrencyPeso className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-muted-foreground">
                                            Price:
                                          </span>
                                          <span className="font-medium text-foreground">
                                            {new Intl.NumberFormat("en-PH", {
                                              style: "currency",
                                              currency: "PHP",
                                            }).format(product.price)}
                                          </span>
                                        </div>

                                        {/* Location */}
                                        {product.location && (
                                          <div className="flex items-center gap-2">
                                            <IconMapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              Location:
                                            </span>
                                            <span className="font-medium text-foreground">
                                              {product.location}
                                            </span>
                                          </div>
                                        )}

                                        {/* Supplier */}
                                        {product.supplierName && (
                                          <div className="flex items-center gap-2">
                                            <IconBuildingStore className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              Supplier:
                                            </span>
                                            <span className="font-medium text-foreground">
                                              {product.supplierName}
                                            </span>
                                          </div>
                                        )}

                                        {/* Warranty */}
                                        {product.warrantyMonths && (
                                          <div className="flex items-center gap-2">
                                            <IconShield className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              Warranty:
                                            </span>
                                            <span className="font-medium text-foreground">
                                              {product.warrantyMonths} months
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Specs */}
                                      {product.specs && (
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <IconFileText className="h-3.5 w-3.5" />
                                            Specifications
                                          </div>
                                          <p className="text-sm text-foreground pl-5 whitespace-pre-wrap">
                                            {product.specs}
                                          </p>
                                        </div>
                                      )}

                                      {/* Compatibility */}
                                      {product.compatibility && (
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <IconFileText className="h-3.5 w-3.5" />
                                            Compatibility
                                          </div>
                                          <p className="text-sm text-foreground pl-5 whitespace-pre-wrap">
                                            {product.compatibility}
                                          </p>
                                        </div>
                                      )}

                                      {/* Notes */}
                                      {product.notes && (
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <IconFileText className="h-3.5 w-3.5" />
                                            Notes
                                          </div>
                                          <p className="text-sm text-foreground pl-5 whitespace-pre-wrap">
                                            {product.notes}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <AddCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete ? (
                <>
                  This will remove <strong>{categoryToDelete.name}</strong> from
                  your inventory.{" "}
                  {categoryToDelete.productCount > 0
                    ? `Products in this category will move to "Uncategorized".`
                    : "No products are currently assigned to this category."}
                </>
              ) : (
                "Are you sure you want to delete this category?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
