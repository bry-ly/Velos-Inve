import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function TagsLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
