"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  IconEdit,
  IconTrash,
  IconSearch,
  IconPlus,
  IconMail,
  IconPhone,
  IconShoppingCart,
} from "@tabler/icons-react";
import { deleteCustomer } from "@/lib/action/customer";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomerDataTableProps {
  customers: Customer[];
}

export function CustomerDataTable({ customers }: CustomerDataTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Filter customers based on search
  const filteredCustomers = React.useMemo(() => {
    if (!searchTerm.trim()) return customers;

    const lowerSearch = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowerSearch) ||
        customer.email?.toLowerCase().includes(lowerSearch) ||
        customer.phone?.toLowerCase().includes(lowerSearch) ||
        customer.address?.toLowerCase().includes(lowerSearch)
    );
  }, [customers, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const formData = new FormData();
    formData.append("id", deleteId);

    try {
      const result = await deleteCustomer(formData);
      if (result?.success) {
        toast.success(result.message ?? "Customer deleted successfully");
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to delete customer");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const customerToDelete = customers.find((c) => c.id === deleteId);

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/customers/new">
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.email).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + c.salesCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-center">Sales</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    {customer.notes && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {customer.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <IconMail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">
                            {customer.email}
                          </span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <IconPhone className="h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      )}
                      {!customer.email && !customer.phone && (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm line-clamp-2">
                      {customer.address || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <IconShoppingCart className="h-3 w-3" />
                      {customer.salesCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEdit className="h-4 w-4" />
                          <span className="sr-only">Edit {customer.name}</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(customer.id)}
                      >
                        <IconTrash className="h-4 w-4" />
                        <span className="sr-only">Delete {customer.name}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground">
                      {searchTerm
                        ? "No customers found matching your search."
                        : "No customers yet. Add your first customer!"}
                    </span>
                    {!searchTerm && (
                      <Link href="/customers/new">
                        <Button size="sm">
                          <IconPlus className="mr-2 h-4 w-4" />
                          Add Customer
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              {customerToDelete ? (
                <>
                  Are you sure you want to delete{" "}
                  <strong>{customerToDelete.name}</strong>?
                  {customerToDelete.salesCount > 0 && (
                    <>
                      {" "}
                      This customer has {customerToDelete.salesCount} associated
                      sale(s). You must remove or reassign these sales before
                      deleting.
                    </>
                  )}
                </>
              ) : (
                "Are you sure you want to delete this customer?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting || (customerToDelete?.salesCount ?? 0) > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
