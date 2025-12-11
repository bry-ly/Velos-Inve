"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adjustBatchQuantity } from "@/lib/action/batch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconPlus, IconMinus, IconAdjustmentsAlt } from "@tabler/icons-react";

interface BatchQuantityAdjustmentProps {
  batchId: string;
  currentQuantity: number;
  batchNumber: string;
}

export function BatchQuantityAdjustment({
  batchId,
  currentQuantity,
  batchNumber,
}: BatchQuantityAdjustmentProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [adjustment, setAdjustment] = React.useState(0);
  const [reason, setReason] = React.useState("");

  const newQuantity = currentQuantity + adjustment;
  const isValid = adjustment !== 0 && newQuantity >= 0;

  const handleAdjust = async () => {
    if (!isValid) return;

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("batchId", batchId);
      formData.append("adjustment", String(adjustment));
      if (reason) formData.append("reason", reason);

      const result = await adjustBatchQuantity(formData);

      if (result?.success) {
        toast.success(result.message ?? "Quantity adjusted");
        setAdjustment(0);
        setReason("");
        router.refresh();
      } else {
        toast.error(result?.message ?? "Failed to adjust quantity");
      }
    } catch (error) {
      console.error("Adjustment error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconAdjustmentsAlt className="h-4 w-4" />
          Quantity Adjustment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{currentQuantity}</div>
          <div className="text-sm text-muted-foreground">Current Quantity</div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAdjustment((a) => a - 1)}
            disabled={newQuantity <= 0 || isPending}
          >
            <IconMinus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
            className="text-center"
            disabled={isPending}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAdjustment((a) => a + 1)}
            disabled={isPending}
          >
            <IconPlus className="h-4 w-4" />
          </Button>
        </div>

        {adjustment !== 0 && (
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              New quantity:{" "}
            </span>
            <span
              className={`font-bold ${
                newQuantity < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {newQuantity}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <Label>Reason (optional)</Label>
          <Textarea
            placeholder="Reason for adjustment..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="resize-none"
            disabled={isPending}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleAdjust}
          disabled={!isValid || isPending}
        >
          {isPending
            ? "Adjusting..."
            : adjustment >= 0
            ? `Add ${adjustment} units`
            : `Remove ${Math.abs(adjustment)} units`}
        </Button>
      </CardContent>
    </Card>
  );
}
