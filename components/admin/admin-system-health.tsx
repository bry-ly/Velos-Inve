import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  IconServer,
  IconDatabase,
  IconCloud,
  IconCheck,
} from "@tabler/icons-react";

interface AdminSystemHealthProps {
  activeSessions: number;
  totalUsers: number;
  totalProducts: number;
}

export function AdminSystemHealth({
  activeSessions,
  totalUsers,
  totalProducts,
}: AdminSystemHealthProps) {
  // Calculate some mock "health" metrics
  const sessionLoad = Math.min(
    (activeSessions / Math.max(totalUsers, 1)) * 100,
    100
  );
  const dataUsage = Math.min((totalProducts / 10000) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Platform status and metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconServer className="size-4 text-muted-foreground" />
              <span className="text-sm">API Server</span>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <IconCheck className="size-4" />
              <span className="text-xs font-medium">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconDatabase className="size-4 text-muted-foreground" />
              <span className="text-sm">Database</span>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <IconCheck className="size-4" />
              <span className="text-xs font-medium">Healthy</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCloud className="size-4 text-muted-foreground" />
              <span className="text-sm">Storage</span>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <IconCheck className="size-4" />
              <span className="text-xs font-medium">Available</span>
            </div>
          </div>
        </div>

        {/* Usage metrics */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Session Load</span>
              <span className="font-medium">{sessionLoad.toFixed(0)}%</span>
            </div>
            <Progress value={sessionLoad} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data Usage</span>
              <span className="font-medium">{dataUsage.toFixed(0)}%</span>
            </div>
            <Progress value={dataUsage} className="h-2" />
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{activeSessions}</p>
            <p className="text-xs text-muted-foreground">Active Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {totalProducts.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
