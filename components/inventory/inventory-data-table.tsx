"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInventoryFilters } from "@/hooks/use-inventory-filters";
import { useInventoryExport } from "@/hooks/use-inventory-export";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconFilter,
  IconDownload,
  IconFileSpreadsheet,
  IconAlertCircle,
  IconSearch,
  IconTrash,
  IconEdit,
  IconPackage,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
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
import { deleteProduct } from "@/lib/action/product";
import { ProductForm } from "@/components/product/product-form";
import {
  CONDITIONS,
  CONDITION_BADGES,
  DEFAULT_COLUMN_VISIBILITY,
  COLUMN_VISIBILITY_VERSION,
  getStockStatus,
} from "@/lib/constants/inventory";
import type { Product, CategoryOption, InitialFilters } from "@/lib/types";
import type { Condition } from "@/lib/constants/inventory";
import { ProductNameCell } from "./columns/cells/product-name-cell";
import { QuantityCell } from "./columns/cells/quantity-cell";
import { ActionsCell } from "./columns/cells/actions-cell";
interface InventoryDataTableProps {
  items: Product[];
  categories: CategoryOption[];
  tags: { id: string; name: string }[];
  initialFilters?: InitialFilters;
}
export function InventoryDataTable({
  items,
  categories,
  tags,
  initialFilters,
}: InventoryDataTableProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  // Use custom hooks for state management
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    manufacturerFilter,
    setManufacturerFilter,
    conditionFilter,
    setConditionFilter,
    lowStockFilter,
    setLowStockFilter,
    filteredItems,
    uniqueManufacturers,
  } = useInventoryFilters({ items, initialFilters });
  const { exportToCSV, exportToExcel } = useInventoryExport(filteredItems);
  // UI state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [detailsProduct, setDetailsProduct] = React.useState<Product | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("inventory-column-visibility");
        const version = localStorage.getItem(
          "inventory-column-visibility-version"
        );
        if (!version || version !== COLUMN_VISIBILITY_VERSION) {
          localStorage.setItem(
            "inventory-column-visibility-version",
            COLUMN_VISIBILITY_VERSION
          );
          localStorage.setItem(
            "inventory-column-visibility",
            JSON.stringify(DEFAULT_COLUMN_VISIBILITY)
          );
          return DEFAULT_COLUMN_VISIBILITY;
        }
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            return DEFAULT_COLUMN_VISIBILITY;
          }
        }
      }
      return DEFAULT_COLUMN_VISIBILITY;
    });
  const [pagination, setPagination] = React.useState({
    pageIndex: initialFilters?.page ?? 0,
    pageSize: initialFilters?.pageSize ?? 12,
  });
  // Row selection state
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [isBulkDeleting, startBulkDeleteTransition] = React.useTransition();
  const [stockStatusFilter, setStockStatusFilter] =
    React.useState<string>("all");
  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);

  // Save column visibility to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "inventory-column-visibility",
        JSON.stringify(columnVisibility)
      );
    }
  }, [columnVisibility]);
  const handleEditClick = React.useCallback((product: Product) => {
    setEditProduct(product);
    setIsEditOpen(true);
  }, []);

  const handleViewDetails = React.useCallback((product: Product) => {
    setDetailsProduct(product);
    setDetailsOpen(true);
  }, []);

  const handleEditSuccess = React.useCallback(() => {
    setIsEditOpen(false);
    setEditProduct(null);
    router.refresh();
  }, [router]);

  // Define table columns
  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }) => <ProductNameCell product={row.original} />,
      },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline" className="w-fit">
            {row.original.categoryName || "Uncategorized"}
          </Badge>
        ),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags = row.original.tags || [];
          if (tags.length === 0)
            return <span className="text-sm text-muted-foreground">—</span>;
          return (
            <div className="flex flex-wrap gap-1 max-w-[300px]">
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "manufacturer",
        header: "Manufacturer",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.manufacturer || "—"}</span>
        ),
      },
      {
        accessorKey: "model",
        header: "Model",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.model || "—"}</span>
        ),
      },
      {
        accessorKey: "condition",
        header: "Condition",
        cell: ({ row }) => {
          const condition = (row.original.condition ||
            "new") as import("@/lib/constants/inventory").Condition;
          const badgeConfig = CONDITION_BADGES[condition];
          return (
            <Badge variant="outline" className={badgeConfig.className}>
              {badgeConfig.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => <QuantityCell product={row.original} />,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <span className="font-medium">
            {new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
            }).format(Number(row.original.price || 0))}
          </span>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.location || "—"}</span>
        ),
      },
      {
        accessorKey: "warrantyMonths",
        header: "Warranty",
        cell: ({ row }) => {
          const months = row.original.warrantyMonths;
          if (!months) return <span className="text-sm">—</span>;
          return <span className="text-sm">{months} months</span>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionsCell
            product={row.original}
            onEdit={handleEditClick}
            onViewDetails={handleViewDetails}
          />
        ),
      },
    ],
    [handleEditClick, handleViewDetails]
  );
  // Apply stock status filter to filteredItems
  const finalFilteredItems = React.useMemo(() => {
    if (stockStatusFilter === "all") return filteredItems;
    return filteredItems.filter((item) => {
      const qty = Number(item.quantity || 0);
      const lowThreshold =
        item.lowStockAt == null ? undefined : Number(item.lowStockAt);
      const status = getStockStatus(qty, lowThreshold);
      return status === stockStatusFilter;
    });
  }, [filteredItems, stockStatusFilter]);

  const table = useReactTable({
    data: finalFilteredItems,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  // Bulk delete handler - defined after table is created
  const handleBulkDelete = React.useCallback(() => {
    // Use table's selected row model to get the actual selected products
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("No products selected");
      return;
    }

    // Extract product IDs from selected rows
    const selectedProductIds = selectedRows.map((row) => row.original.id);

    startBulkDeleteTransition(async () => {
      try {
        const deletePromises = selectedProductIds.map((id) => {
          const formData = new FormData();
          formData.append("id", id);
          return deleteProduct(formData);
        });

        const results = await Promise.all(deletePromises);
        const successCount = results.filter((r) => r.success).length;
        const failedCount = results.filter((r) => !r.success).length;

        if (successCount > 0) {
          toast.success(`Successfully deleted ${successCount} product(s)`);
          setRowSelection({});
          setBulkDeleteOpen(false);
          router.refresh();
        }
        if (failedCount > 0) {
          toast.error(`${failedCount} product(s) could not be deleted`);
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  }, [table, router]);

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Bulk edit - could open a dialog to edit common fields
                toast.info("Bulk edit coming soon!");
              }}
              disabled={isBulkDeleting}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Edit Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={isBulkDeleting}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={manufacturerFilter}
            onValueChange={(value) => {
              setManufacturerFilter(value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Manufacturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {uniqueManufacturers.map((mfr) => (
                <SelectItem key={mfr} value={mfr as string}>
                  {mfr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={conditionFilter}
            onValueChange={(value) => {
              setConditionFilter(value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {CONDITIONS.map((cond) => (
                <SelectItem key={cond} value={cond}>
                  {cond.charAt(0).toUpperCase() + cond.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={stockStatusFilter}
            onValueChange={(value) => {
              setStockStatusFilter(value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={lowStockFilter ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setLowStockFilter(!lowStockFilter);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
          >
            <IconAlertCircle className="h-4 w-4 mr-2" />
            Low Stock
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconFilter className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconDownload className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToCSV}>
                <IconDownload className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                <IconFileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 py-8">
                    <IconPackage className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        No products found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {finalFilteredItems.length === 0 && items.length > 0
                          ? "Try adjusting your filters"
                          : "Get started by adding your first product"}
                      </p>
                      {finalFilteredItems.length === 0 && items.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            setSearchTerm("");
                            setCategoryFilter("all");
                            setManufacturerFilter("all");
                            setConditionFilter("all");
                            setLowStockFilter(false);
                            setStockStatusFilter("all");
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Edit Dialog - Full functionality with tags */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product: {editProduct?.name}</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              categories={categories}
              tags={tags}
              defaultValues={{
                name: editProduct.name ?? "",
                sku: editProduct.sku ?? "",
                categoryId: editProduct.categoryId ?? "",
                manufacturer: editProduct.manufacturer ?? "",
                model: editProduct.model ?? "",
                quantity: editProduct.quantity ?? 0,
                lowStockAt: editProduct.lowStockAt ?? undefined,
                condition:
                  (editProduct.condition as Condition | undefined) ?? "new",
                location: editProduct.location ?? "",
                price: Number(editProduct.price ?? 0),
                warrantyMonths: editProduct.warrantyMonths ?? undefined,
                notes: editProduct.notes ?? "",
                compatibility: editProduct.compatibility ?? "",
                supplier: editProduct.supplier ?? "",
                specs: editProduct.specs ?? "",
                imageUrl: editProduct.imageUrl ?? "",
                tagIds: editProduct.tags?.map((t) => t.id) ?? [],
              }}
              productId={editProduct.id}
              onSuccess={handleEditSuccess}
              submitLabel="Save Changes"
              showResetButton={false}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Details Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{detailsProduct?.name}</DrawerTitle>
              <DrawerDescription>Product Details</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              {detailsProduct && (
                <>
                  {detailsProduct.imageUrl && (
                    <div className="relative w-full h-48">
                      <Image
                        src={detailsProduct.imageUrl}
                        alt={detailsProduct.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>SKU:</strong> {detailsProduct.sku || "—"}
                    </div>
                    <div>
                      <strong>Category:</strong>{" "}
                      {detailsProduct.categoryName || "—"}
                    </div>
                    <div>
                      <strong>Manufacturer:</strong>{" "}
                      {detailsProduct.manufacturer || "—"}
                    </div>
                    <div>
                      <strong>Model:</strong> {detailsProduct.model || "—"}
                    </div>
                    <div>
                      <strong>Condition:</strong>{" "}
                      {detailsProduct.condition || "—"}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {detailsProduct.quantity}
                    </div>
                    <div>
                      <strong>Price:</strong>{" "}
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(Number(detailsProduct.price))}
                    </div>
                    {detailsProduct.specs && (
                      <div>
                        <strong>Specs:</strong> {detailsProduct.specs}
                      </div>
                    )}
                    {detailsProduct.notes && (
                      <div>
                        <strong>Notes:</strong> {detailsProduct.notes}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <DrawerFooter>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{detailsProduct?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {detailsProduct && (
                <>
                  {detailsProduct.imageUrl && (
                    <div className="relative w-full h-64">
                      <Image
                        src={detailsProduct.imageUrl}
                        alt={detailsProduct.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>SKU:</strong> {detailsProduct.sku || "—"}
                    </div>
                    <div>
                      <strong>Category:</strong>{" "}
                      {detailsProduct.categoryName || "—"}
                    </div>
                    <div>
                      <strong>Manufacturer:</strong>{" "}
                      {detailsProduct.manufacturer || "—"}
                    </div>
                    <div>
                      <strong>Model:</strong> {detailsProduct.model || "—"}
                    </div>
                    <div>
                      <strong>Condition:</strong>{" "}
                      {detailsProduct.condition || "—"}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {detailsProduct.quantity}
                    </div>
                    <div>
                      <strong>Price:</strong>{" "}
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(Number(detailsProduct.price))}
                    </div>
                    <div>
                      <strong>Location:</strong>{" "}
                      {detailsProduct.location || "—"}
                    </div>
                  </div>
                  {detailsProduct.specs && (
                    <div>
                      <strong>Specifications:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {detailsProduct.specs}
                      </p>
                    </div>
                  )}
                  {detailsProduct.notes && (
                    <div>
                      <strong>Notes:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {detailsProduct.notes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} product
              {selectedCount !== 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              disabled={isBulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
