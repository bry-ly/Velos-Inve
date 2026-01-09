"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProfileSettings } from "./profile-settings";
import { NotificationSettings } from "./notification-settings";
import { SecuritySettings } from "./security-settings";
import { PreferencesSettings } from "./preferences-settings";

import {
  IconUser,
  IconBell,
  IconShield,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react";
import { ComingSoon } from "@/components/coming-soon";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SettingsTabsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  session?: {
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    ipAddress: string | null | undefined;
    userAgent: string | null | undefined;
  };
  defaultTab?: string;
  isDialog?: boolean;
}

export function SettingsTabs({
  user,
  session,
  defaultTab = "profile",
  isDialog = false,
}: SettingsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    // If inside a dialog, we might still want to update URL or just local state.
    // For now, let's keep URL syncing as it's useful, but maybe use replace to avoid history stack pollution if needed.
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const currentTab = searchParams.get("tab") || defaultTab;

  const content = (
    <Tabs
      defaultValue={currentTab}
      onValueChange={handleTabChange}
      className="flex flex-row h-full gap-2 min-h-0 overflow-hidden"
    >
      <div className="w-60 px-2 flex flex-col gap-5 shrink-0 mt-30">
        <TabsList className="w-full px-2 flex flex-col gap-1 bg-transparent">
          <TabsTrigger
            value="profile"
            className="w-full justify-start px-3 py-2 h-auto rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <IconUser className="size-4" />
              <span>Profile</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="w-full justify-start px-3 py-2 h-auto rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <IconBell className="size-4" />
              <span>Notifications</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="w-full justify-start px-3 py-2 h-auto rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <IconShield className="size-4" />
              <span>Security</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="w-full justify-start px-3 py-2 h-auto rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <IconSettings className="size-4" />
              <span>Preferences</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="help"
            className="w-full justify-start px-3 py-2 h-auto rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <IconHelp className="size-4" />
              <span>Help Center</span>
            </div>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 px-10 pt-8 bg-muted/10 rounded-xl flex flex-col gap-5 overflow-hidden relative min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {currentTab
              ? currentTab.charAt(0).toUpperCase() + currentTab.slice(1)
              : "Settings"}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 pb-10">
          <TabsContent value="profile" className="mt-0 space-y-6 p-5">
            <ProfileSettings user={user} />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0 space-y-6 p-10">
            <NotificationSettings />
          </TabsContent>
          <TabsContent value="security" className="mt-0 space-y-6 p-10">
            <SecuritySettings session={session} />
          </TabsContent>
          <TabsContent value="preferences" className="mt-0 space-y-6 p-10">
            <PreferencesSettings />
          </TabsContent>
          <TabsContent value="help" className="mt-0 space-y-6 flex items-center justify-center max-h-svh">
            <ComingSoon />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );

  if (isDialog) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden bg-background rounded-2xl">
        {content}
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-5xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="border-b bg-muted/30 px-8 py-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>
        {content}
      </Card>
    </div>
  );
}
