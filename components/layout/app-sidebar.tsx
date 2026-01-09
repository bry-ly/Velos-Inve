"use client";
import * as React from "react";
import { SettingsModal } from "@/components/settings/settings-modal";
import {
  IconDashboard,
  IconShoppingCart,
  IconSettings,
  IconPackages,
  IconTrendingUp,
  IconChartBar,
  IconTruckDelivery,
  IconUsers,
  IconBuildingWarehouse,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavSecondary } from "@/components/layout/nav-secondary";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

/**
 * Navigation item type for secondary nav with optional action
 */
type NavSecondaryItem = {
  title: string;
  url: string;
  icon: Icon;
  action?: string;
};

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products / Inventory",
      url: "/inventory",
      icon: IconShoppingCart,
      items: [
        {
          title: "Product List",
          url: "/inventory",
        },
        {
          title: "Add Product",
          url: "/add-product",
        },
        {
          title: "Categories",
          url: "/categories",
        },
        {
          title: "Tags",
          url: "/tags",
        },
      ],
    },
    {
      title: "Stock Management",
      url: "/stock/adjustment",
      icon: IconPackages,
      items: [
        {
          title: "Stock Adjustment",
          url: "/stock/adjustment",
        },
        {
          title: "Low Stock Alerts",
          url: "/stock/alerts",
        },
        {
          title: "Batch Tracking",
          url: "/batches",
        },
        {
          title: "Locations",
          url: "/locations",
        },
        {
          title: "Stock Transfer",
          url: "/stock/transfer",
        },
        {
          title: "Stock History",
          url: "/stock/history",
        },
        {
          title: "Reorder Automation",
          url: "/stock/reorder",
        },
      ],
    },
    {
      title: "Purchasing",
      url: "/purchase-orders",
      icon: IconTruckDelivery,
      items: [
        {
          title: "Purchase Orders",
          url: "/purchase-orders",
        },
        {
          title: "Create PO",
          url: "/purchase-orders/create",
        },
        {
          title: "Suppliers",
          url: "/suppliers",
        },
      ],
    },
    {
      title: "Sales / Outbound",
      url: "/sales/create",
      icon: IconTrendingUp,
      items: [
        {
          title: "Create Sale",
          url: "/sales/create",
        },
        {
          title: "Sales History",
          url: "/sales/history",
        },
        {
          title: "Returns",
          url: "/sales/returns",
        },
        {
          title: "Customers",
          url: "/customers",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports/inventory",
      icon: IconChartBar,
      items: [
        {
          title: "Inventory Report",
          url: "/reports/inventory",
        },
        {
          title: "Sales Report",
          url: "/reports/sales",
        },
        {
          title: "Profit & Loss",
          url: "/reports/profit-loss",
        },
        {
          title: "Activity Log",
          url: "/activity-log",
        },
      ],
    },
  ],
  NavDocuments: [],
  navSecondary: [
    {
      title: "Settings",
      url: "#", // Changed to hash to prevent navigation
      icon: IconSettings,
      action: "settings", // Custom action identifier
    },
  ],
};

interface AppSidebarProps {
  user: { name: string; email: string; avatar: string };
  userData: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  sessionData: {
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    ipAddress: string | null | undefined;
    userAgent: string | null | undefined;
  };
}

export function AppSidebar({
  user,
  userData,
  sessionData,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);

  // Intercept settings click
  const handleItemClick = (e: React.MouseEvent, item: NavSecondaryItem) => {
    if (item.action === "settings") {
      e.preventDefault();
      setTriggerRect(e.currentTarget.getBoundingClientRect());
      setSettingsOpen(true);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" data-tour="sidebar" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <Link href="/dashboard" prefetch={true}>
                  <Image
                    src="/icon.png"
                    alt="Logo"
                    width={20}
                    height={20}
                    className="size-5!"
                  />
                  <span className="text-base font-semibold">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavSecondary
            items={data.navSecondary.map((item) => ({
              ...item,
              onClick: (e: React.MouseEvent) => handleItemClick(e, item),
            }))}
            className="mt-auto"
          />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        triggerRect={triggerRect}
        user={userData}
        session={sessionData}
      />
    </>
  );
}
