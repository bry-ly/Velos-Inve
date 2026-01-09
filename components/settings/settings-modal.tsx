import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { motion, AnimatePresence } from "motion/react";

interface SettingsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerRect?: DOMRect | null;
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

export function SettingsModal({
  open,
  onOpenChange,
  triggerRect,
  user,
  session,
}: SettingsModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>

            {/* Content */}
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  top: "50%",
                  left: "50%",
                  x: "-50%",
                  y: "-50%",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  top: "50%",
                  left: "50%",
                  x: "-50%",
                  y: "-50%",
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  top: "50%",
                  left: "50%",
                  x: "-50%",
                  y: "-50%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
                className={cn(
                  "fixed z-50 gap-4 shadow-lg sm:rounded-[18px] w-[95vw] max-w-[1000px] h-[90vh] max-h-[640px] p-2 bg-background/80 backdrop-blur-xl rounded-[20px] border-0 overflow-hidden flex flex-col outline-none"
                )}
              >
                <DialogPrimitive.Title className="sr-only">
                  Settings
                </DialogPrimitive.Title>
                <div className="flex-1 overflow-hidden relative h-full w-full rounded-[14px] border bg-background/50">
                  <SettingsTabs user={user} session={session} isDialog={true} />
                  <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
