import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "../../app/generated/prisma/client";

type ActivityType =
  | "create"
  | "update"
  | "delete"
  | "stock_adjustment"
  | "receive"
  | "transfer";
type EntityType =
  | "product"
  | "tag"
  | "category"
  | "sale"
  | "supplier"
  | "customer"
  | "location"
  | "purchase_order"
  | "batch"
  | "stock_movement"
  | "reorder_rule";

interface LogActivityParams {
  userId: string;
  actorId?: string; // Optional, defaults to userId
  entityType: EntityType;
  entityId?: string; // Optional for cases where entity doesn't exist yet
  action: ActivityType;
  changes?: Record<string, unknown>;
  note?: string;
}

export async function logActivity({
  userId,
  actorId,
  entityType,
  entityId,
  action,
  changes,
  note,
  tx,
}: LogActivityParams & { tx?: Prisma.TransactionClient }) {
  try {
    await (tx || prisma).activityLog.create({
      data: {
        userId,
        actorId,
        entityType,
        entityId,
        action,
        changes: changes
          ? (JSON.parse(JSON.stringify(changes)) as Prisma.JsonObject)
          : undefined,
        note,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // We don't throw here to avoid failing the main action just because logging failed
  }
}
