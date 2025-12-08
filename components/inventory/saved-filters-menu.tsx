"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconPlus,
  IconTrash,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createSavedFilter,
  setDefaultFilter,
  deleteSavedFilter,
} from "@/lib/action/saved-filter";

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SavedFiltersMenuProps {
  filters: SavedFilter[];
}

export function SavedFiltersMenu({ filters: initialFilters }: SavedFiltersMenuProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = React.useState<SavedFilter[]>(initialFilters);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false);
  const [filterName, setFilterName] = React.useState("");
  const [saveAsDefault, setSaveAsDefault] = React.useState(false);
  const [isSaving, startSaveTransition] = React.useTransition();

  const [deleteFilterId, setDeleteFilterId] = React.useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = React.useTransition();

  const [settingDefaultId, setSettingDefaultId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const getCurrentFilters = React.useCallback(() => {
    const current: Record<string, unknown> = {};
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const manufacturer = searchParams.get("manufacturer");
    const condition = searchParams.get("condition");
    const lowStock = searchParams.get("lowStock");
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    if (search) current.search = search;
    if (category) current.category = category;
    if (manufacturer) current.manufacturer = manufacturer;
    if (condition) current.condition = condition;
    if (lowStock) current.lowStock = lowStock === "true";
    if (page) current.page = parseInt(page, 10);
    if (pageSize) current.pageSize = parseInt(pageSize, 10);

    return current;
  }, [searchParams]);

  const hasActiveFilters = React.useMemo(() => {
    const current = getCurrentFilters();
    const keys = Object.keys(current).filter(
      (key) => key !== "page" && key !== "pageSize"
    );
    return keys.length > 0;
  }, [getCurrentFilters]);

  const handleSaveFilter = React.useCallback(() => {
    if (!filterName.trim()) {
      toast.error("Please enter a filter name");
      return;
    }

    startSaveTransition(async () => {
      const formData = new FormData();
      formData.append("name", filterName.trim());
      formData.append("filters", JSON.stringify(getCurrentFilters()));
      formData.append("isDefault", String(saveAsDefault));

      try {
        const result = await createSavedFilter(formData);
        if (result.success && result.filter) {
          toast.success(result.message ?? "Filter saved successfully");
          setFilters((prev) => [result.filter!, ...prev]);
          setIsSaveDialogOpen(false);
          setFilterName("");
          setSaveAsDefault(false);
          router.refresh();
        } else {
          toast.error(result.message ?? "Failed to save filter");
        }
      } catch {
        toast.error("An unexpected error occurred");
      }
    });
  }, [filterName, saveAsDefault, getCurrentFilters, router]);

  const handleApplyFilter = React.useCallback(
    (filter: SavedFilter) => {
      const params = new URLSearchParams();

      const filterData = filter.filters as Record<string, string | boolean | number>;

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

      router.push(`/inventory?${params.toString()}`);
      toast.success(`Applied filter: ${filter.name}`);
    },
    [router]
  );

  const handleSetDefault = React.useCallback(
    (filterId: string) => {
      setSettingDefaultId(filterId);

      const formData = new FormData();
      formData.append("id", filterId);

      setDefaultFilter(formData)
        .then((result) => {
          if (result.success) {
            toast.success(result.message ?? "Default filter updated");
            setFilters((prev) =>
              prev.map((f) => ({
                ...f,
                isDefault: f.id === filterId,
              }))
            );
            router.refresh();
          } else {
            toast.error(result.message ?? "Failed to set default filter");
          }
        })
        .catch(() => {
          toast.error("An unexpected error occurred");
        })
        .finally(() => {
          setSettingDefaultId(null);
        });
    },
    [router]
  );

  const handleDeleteFilter = React.useCallback(
    (filterId: string) => {
      startDeleteTransition(async () => {
        const formData = new FormData();
        formData.append("id", filterId);

        try {
          const result = await deleteSavedFilter(formData);
          if (result.success) {
            toast.success(result.message ?? "Filter deleted");
            setFilters((prev) => prev.filter((f) => f.id !== filterId));
            setDeleteFilterId(null);
            router.refresh();
          } else {
            toast.error(result.message ?? "Failed to delete filter");
          }
        } catch {
          toast.error("An unexpected error occurred");
        }
      });
    },
    [router]
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <IconBookmark className="h-4 w-4" />
            Saved Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsSaveDialogOpen(true)}
            disabled={!hasActiveFilters}
            className="gap-2"
          >
            <IconPlus className="h-4 w-4" />
            Save Current Filters
          </DropdownMenuItem>
          {filters.length > 0 && <DropdownMenuSeparator />}
          {filters.map((filter) => (
            <DropdownMenuItem
              key={filter.id}
              className="flex items-center justify-between gap-2 pr-2"
              onSelect={(e) => e.preventDefault()}
            >
              <button
                className="flex-1 text-left truncate"
                onClick={() => handleApplyFilter(filter)}
              >
                <div className="flex items-center gap-2">
                  {filter.isDefault ? (
                    <IconBookmarkFilled className="h-4 w-4 text-primary" />
                  ) : (
                    <IconBookmark className="h-4 w-4" />
                  )}
                  <span className="truncate">{filter.name}</span>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleSetDefault(filter.id)}
                  disabled={settingDefaultId === filter.id || filter.isDefault}
                  title={filter.isDefault ? "Default filter" : "Set as default"}
                >
                  {filter.isDefault ? (
                    <IconStarFilled className="h-3.5 w-3.5 text-yellow-500" />
                  ) : (
                    <IconStar className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => setDeleteFilterId(filter.id)}
                  disabled={isDeleting}
                  title="Delete filter"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
          {filters.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No saved filters yet
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filters for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input
                id="filter-name"
                placeholder="e.g., Low Stock Items"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSaving) {
                    handleSaveFilter();
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="save-as-default"
                checked={saveAsDefault}
                onCheckedChange={(checked) => setSaveAsDefault(checked === true)}
              />
              <Label
                htmlFor="save-as-default"
                className="text-sm font-normal cursor-pointer"
              >
                Set as default filter
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setFilterName("");
                setSaveAsDefault(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Filter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteFilterId !== null}
        onOpenChange={(open) => !open && setDeleteFilterId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Filter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this filter preset? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFilterId && handleDeleteFilter(deleteFilterId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
