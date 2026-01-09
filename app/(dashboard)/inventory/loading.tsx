import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <div className="border-b border-border p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="mt-2 h-4 w-56" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Table header skeleton */}
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
              {/* Table rows skeleton */}
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
              {/* Pagination skeleton */}
              <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-64" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
