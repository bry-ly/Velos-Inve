import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  note: string | null;
  createdAt: Date;
  actor: {
    name: string;
    email: string;
    image: string | null;
  } | null;
  owner: {
    name: string;
  } | null;
}

interface AdminRecentActivityProps {
  activities: Activity[];
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-500",
  UPDATE: "bg-blue-500",
  DELETE: "bg-red-500",
  IMPERSONATE: "bg-purple-500",
};

export function AdminRecentActivity({ activities }: AdminRecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
              >
                <Avatar className="size-8">
                  <AvatarImage src={activity.actor?.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {activity.actor?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {activity.actor?.name || "System"}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        actionColors[activity.action] || "bg-gray-500"
                      } text-white border-0`}
                    >
                      {activity.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.entityType}
                    </span>
                  </div>
                  {activity.note && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {activity.note}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
