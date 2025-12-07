import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "../../app/generated/prisma/client";

type ActivityType = "create" | "update" | "delete" | "stock_adjustment";
type EntityType = "product" | "tag" | "category" | "sale";

interface LogActivityParams {
  userId: string;
  actorId: string;
  entityType: EntityType;
  entityId: string;
  action: ActivityType;
  changes?: Prisma.JsonObject;
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
