import type React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { getLocations } from "@/lib/action/location";
import { LocationDataTable } from "@/components/locations/location-data-table";
import { IconBuilding } from "@tabler/icons-react";

export const metadata = {
  title: "Locations | Velos Inventory",
  description: "Manage your warehouse and storage locations",
};

export default async function LocationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;
  const userSidebar = {
    name: user.name ?? user.email ?? "User",
    email: user.email ?? "",
    avatar: user.image ?? "/avatars/placeholder.svg",
  };

  const result = await getLocations();
  const locations = result.success ? result.data ?? [] : [];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={userSidebar} />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-auto">
          <div className="space-y-8 p-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconBuilding className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Locations
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your warehouses and storage locations
                  </p>
                </div>
              </div>
            </div>

            <LocationDataTable locations={locations} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
