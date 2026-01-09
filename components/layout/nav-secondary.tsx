"use client";

import type React from "react";

import type { Icon } from "@tabler/icons-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
    onClick?: (e: React.MouseEvent) => void;
  }[];
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, url: string) => void;
} & React.ComponentProps<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                size="sm"
                isActive={pathname === item.url}
              >
                <Link
                  href={item.url}
                  onClick={(e) => {
                    if (item.onClick) {
                      item.onClick(e);
                    }
                    props.onLinkClick?.(e, item.url);
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
