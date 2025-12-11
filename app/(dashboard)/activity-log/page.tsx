import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/prisma";
import { ActivityLogList } from "@/components/activity-log/activity-log-list";
import { SiteHeader } from "@/components/layout/site-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Log | Velos Inventory",
  description: "View system activity and changes.",
};

export default async function ActivityLogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  const logs = await prisma.activityLog.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      actor: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    take: 50,
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Activity Log
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Recent activity and changes in the system.
              </p>
            </div>
          </div>
          <ActivityLogList logs={logs} />
        </div>
      </main>
    </>
  );
}
