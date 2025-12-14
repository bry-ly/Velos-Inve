import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { IconSettings, IconMail, IconFlag } from "@tabler/icons-react";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Platform configuration and management
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <IconSettings className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <IconMail className="size-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <IconFlag className="size-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Platform-wide configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium">Platform Name</p>
                  <p className="text-sm text-muted-foreground">
                    The name displayed across the platform
                  </p>
                </div>
                <Badge variant="outline">Velos Inventory</Badge>
              </div>
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium">Default Currency</p>
                  <p className="text-sm text-muted-foreground">
                    Default currency for new companies
                  </p>
                </div>
                <Badge variant="outline">USD</Badge>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">Version</p>
                  <p className="text-sm text-muted-foreground">
                    Current platform version
                  </p>
                </div>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconMail className="size-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Email template customization will be available in a future
                  update. You'll be able to customize welcome emails,
                  notifications, and more.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconFlag className="size-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Feature flags will allow you to enable beta features or
                  disable functionality across the platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
