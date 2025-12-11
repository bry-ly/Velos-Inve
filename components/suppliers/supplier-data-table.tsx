"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconBuilding,
  IconMail,
  IconPhone,
  IconPackage,
  IconFileInvoice,
} from "@tabler/icons-react";
import { deleteSupplier } from "@/lib/action/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contactPerson: string | null;
  productCount: number;
  purchaseOrderCount: number;
}

interface SupplierDataTableProps {
  suppliers: Supplier[];
}

export function SupplierDataTable({ suppliers }: SupplierDataTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const query = searchQuery.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(query) ||
      supplier.email?.toLowerCase().includes(query) ||
      supplier.contactPerson?.toLowerCase().includes(query)
    );
  });

  const handleDelete = (supplierId: string) => {
    setDeletingId(supplierId);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", supplierId);

        const result = await deleteSupplier(formData);

        if (result?.success) {
          toast.success(result.message ?? "Supplier deleted successfully");
          router.refresh();
        } else {
          toast.error(result?.message ?? "Failed to delete supplier");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-sm"
          />
        </div>
        <Link href="/suppliers/new">
          <Button className="gap-2">
            <IconPlus className="h-4 w-4" />
            Add Supplier
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead className="text-center">POs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? "No suppliers found matching your search."
                    : "No suppliers yet. Add your first supplier to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  {/* Supplier Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconBuilding className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Link
                          href={`/suppliers/${supplier.id}`}
                          className="font-medium hover:underline"
                        >
                          {supplier.name}
                        </Link>
                        {supplier.contactPerson && (
                          <p className="text-sm text-muted-foreground">
                            {supplier.contactPerson}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <div className="space-y-1">
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <IconMail className="h-3.5 w-3.5 text-muted-foreground" />
                          <a
                            href={`mailto:${supplier.email}`}
                            className="hover:underline"
                          >
                            {supplier.email}
                          </a>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <IconPhone className="h-3.5 w-3.5 text-muted-foreground" />
                          <a
                            href={`tel:${supplier.phone}`}
                            className="hover:underline"
                          >
                            {supplier.phone}
                          </a>
                        </div>
                      )}
                      {!supplier.email && !supplier.phone && (
                        <span className="text-sm text-muted-foreground">
                          No contact info
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Products Count */}
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="gap-1">
                            <IconPackage className="h-3 w-3" />
                            {supplier.productCount}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {supplier.productCount} product(s) from this supplier
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* PO Count */}
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="gap-1">
                            <IconFileInvoice className="h-3 w-3" />
                            {supplier.purchaseOrderCount}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {supplier.purchaseOrderCount} purchase order(s)
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/suppliers/${supplier.id}`}>
                              <Button variant="ghost" size="icon">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>Edit supplier</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            disabled={isPending && deletingId === supplier.id}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              <strong>{supplier.name}</strong>? This action
                              cannot be undone.
                              {supplier.productCount > 0 && (
                                <span className="mt-2 block text-amber-600">
                                  Note: {supplier.productCount} product(s) are
                                  linked to this supplier. They will be
                                  unlinked.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(supplier.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredSuppliers.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredSuppliers.length} of {suppliers.length} supplier(s)
        </p>
      )}
    </div>
  );
}
