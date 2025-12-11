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
  IconMapPin,
  IconStar,
  IconPackage,
} from "@tabler/icons-react";
import { deleteLocation } from "@/lib/action/location";
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

interface Location {
  id: string;
  name: string;
  address: string | null;
  isDefault: boolean;
  notes: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface LocationDataTableProps {
  locations: Location[];
}

export function LocationDataTable({ locations }: LocationDataTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filteredLocations = React.useMemo(() => {
    if (!searchTerm.trim()) return locations;

    const lowerSearch = searchTerm.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(lowerSearch) ||
        loc.address?.toLowerCase().includes(lowerSearch)
    );
  }, [locations, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const formData = new FormData();
    formData.append("id", deleteId);

    try {
      const result = await deleteLocation(formData);
      if (result?.success) {
        toast.success(result.message ?? "Location deleted");
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to delete location");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const locationToDelete = locations.find((l) => l.id === deleteId);

  // Stats
  const totalProducts = locations.reduce(
    (sum, loc) => sum + loc.productCount,
    0
  );
  const defaultLocation = locations.find((loc) => loc.isDefault);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/locations/new">
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Stored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Default Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {defaultLocation?.name ?? "Not set"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead className="text-center">Default</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconMapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{location.name}</span>
                    </div>
                    {location.notes && (
                      <div className="text-xs text-muted-foreground line-clamp-1 ml-6">
                        {location.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm line-clamp-2">
                      {location.address || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <IconPackage className="h-3 w-3" />
                      {location.productCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {location.isDefault && (
                      <IconStar className="h-4 w-4 text-yellow-500 mx-auto fill-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/locations/${location.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(location.id)}
                        disabled={location.productCount > 0}
                      >
                        <IconTrash className="h-4 w-4" />
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
                        ? "No locations found matching your search."
                        : "No locations yet. Add your first location!"}
                    </span>
                    {!searchTerm && (
                      <Link href="/locations/new">
                        <Button size="sm">
                          <IconPlus className="mr-2 h-4 w-4" />
                          Add Location
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

      {/* Delete Dialog */}
      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              {locationToDelete ? (
                <>
                  Are you sure you want to delete{" "}
                  <strong>{locationToDelete.name}</strong>?
                  {locationToDelete.productCount > 0 && (
                    <span className="block mt-2 text-destructive">
                      This location has {locationToDelete.productCount}{" "}
                      products. You must transfer or remove stock first.
                    </span>
                  )}
                </>
              ) : (
                "Are you sure you want to delete this location?"
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
              disabled={isDeleting || (locationToDelete?.productCount ?? 0) > 0}
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
