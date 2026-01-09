"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/ui/button";
import { IconSettings } from "@tabler/icons-react";

interface SettingsDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
}

export function SettingsDialog({
  children,
  open,
  onOpenChange,
  user,
  session,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 border-0 bg-transparent shadow-none gap-0 overflow-hidden">
        <div className="h-[80vh] w-full flex flex-col">
          <SettingsTabs user={user} session={session} isDialog={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
