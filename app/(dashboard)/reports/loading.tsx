import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-48" />
            </div>
            <div className="p-6">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
