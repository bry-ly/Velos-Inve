import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconBuilding,
  IconActivity,
  IconSettings,
  IconArrowRight,
} from "@tabler/icons-react";

const quickActions = [
  {
    title: "Manage Users",
    description: "View, edit, or disable users",
    href: "/admin/users",
    icon: IconUsers,
  },
  {
    title: "Manage Companies",
    description: "View company details and stats",
    href: "/admin/companies",
    icon: IconBuilding,
  },
  {
    title: "Activity Log",
    description: "View platform-wide activity",
    href: "/admin/activity",
    icon: IconActivity,
  },
  {
    title: "Settings",
    description: "Configure platform settings",
    href: "/admin/settings",
    icon: IconSettings,
  },
];

export function AdminQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common management tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action) => (
          <Button
            key={action.href}
            variant="ghost"
            className="w-full justify-start h-auto py-3"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="size-4 mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <IconArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
