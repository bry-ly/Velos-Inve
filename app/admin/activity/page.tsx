import { prisma } from "@/lib/prisma/prisma";
import { AdminActivityLog } from "@/components/admin/admin-activity-log";

interface ActivityPageProps {
  searchParams: Promise<{
    page?: string;
    action?: string;
    entityType?: string;
  }>;
}

export default async function AdminActivityPage({
  searchParams,
}: ActivityPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const perPage = 20;
  const actionFilter = params.action || "";
  const entityTypeFilter = params.entityType || "";

  // Build where clause
  const where: any = {};

  if (actionFilter) {
    where.action = actionFilter;
  }

  if (entityTypeFilter) {
    where.entityType = entityTypeFilter;
  }

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: { name: true, email: true, image: true },
        },
        owner: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  // Get unique action types for filter
  const actionTypes = await prisma.activityLog.findMany({
    select: { action: true },
    distinct: ["action"],
  });

  const entityTypes = await prisma.activityLog.findMany({
    select: { entityType: true },
    distinct: ["entityType"],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Platform-wide activity and audit trail
        </p>
      </div>

      <AdminActivityLog
        activities={activities}
        page={page}
        totalPages={totalPages}
        total={total}
        actionFilter={actionFilter}
        entityTypeFilter={entityTypeFilter}
        actionTypes={actionTypes.map((a) => a.action)}
        entityTypes={entityTypes.map((e) => e.entityType)}
      />
    </div>
  );
}
