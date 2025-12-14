"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { format, formatDistanceToNow } from "date-fns";

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
    email: string;
  } | null;
}

interface AdminActivityLogProps {
  activities: Activity[];
  page: number;
  totalPages: number;
  total: number;
  actionFilter: string;
  entityTypeFilter: string;
  actionTypes: string[];
  entityTypes: string[];
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-500",
  UPDATE: "bg-blue-500",
  DELETE: "bg-red-500",
  IMPERSONATE: "bg-purple-500",
};

export function AdminActivityLog({
  activities,
  page,
  totalPages,
  total,
  actionFilter,
  entityTypeFilter,
  actionTypes,
  entityTypes,
}: AdminActivityLogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateQueryParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (!updates.page) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={actionFilter || "all"}
          onValueChange={(value) => updateQueryParams({ action: value })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionTypes.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={entityTypeFilter || "all"}
          onValueChange={(value) => updateQueryParams({ entityType: value })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {entityTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="rounded-md border p-4">
        {activities.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No activity found
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <Avatar className="size-8">
                    <AvatarImage src={activity.actor?.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {activity.actor?.name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
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
                    <Badge variant="outline" className="text-xs">
                      {activity.entityType}
                    </Badge>
                    {activity.owner &&
                      activity.owner.name !== activity.actor?.name && (
                        <span className="text-xs text-muted-foreground">
                          for {activity.owner.name}
                        </span>
                      )}
                  </div>
                  {activity.note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.note}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(activity.createdAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                    <span className="text-xs text-muted-foreground">·</span>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of{" "}
          {total} activities
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQueryParams({ page: String(page - 1) })}
            disabled={page <= 1}
          >
            <IconChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQueryParams({ page: String(page + 1) })}
            disabled={page >= totalPages}
          >
            Next
            <IconChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
