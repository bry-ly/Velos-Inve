import { prisma } from "@/lib/prisma/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconUsers,
  IconBuilding,
  IconPackage,
  IconActivity,
  IconUserPlus,
  IconBuildingStore,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import { AdminGrowthChart } from "@/components/admin/admin-growth-chart";
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { AdminSystemHealth } from "@/components/admin/admin-system-health";

export default async function AdminPage() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Gather all stats in parallel
  const [
    totalUsers,
    newUsersThisWeek,
    disabledUsers,
    totalCompanies,
    newCompaniesThisWeek,
    totalProducts,
    activeSessions,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { isDisabled: true } }),
    prisma.company.count(),
    prisma.company.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.product.count(),
    prisma.session.count({ where: { expiresAt: { gt: now } } }),
    prisma.activityLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { name: true, email: true, image: true } },
        owner: { select: { name: true } },
      },
    }),
  ]);

  // Calculate inventory value
  const inventoryData = await prisma.product.aggregate({
    _sum: { quantity: true },
  });

  // Get growth data for charts (last 30 days, grouped by day)
  const usersByDay = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as count
    FROM "user"
    WHERE "createdAt" >= ${monthAgo}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  `;

  const companiesByDay = await prisma.$queryRaw<
    { date: Date; count: bigint }[]
  >`
    SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as count
    FROM "company"
    WHERE "createdAt" >= ${monthAgo}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  `;

  // Format chart data
  const userGrowthData = usersByDay.map((row) => ({
    date: new Date(row.date).toISOString().split("T")[0],
    users: Number(row.count),
  }));

  const companyGrowthData = companiesByDay.map((row) => ({
    date: new Date(row.date).toISOString().split("T")[0],
    companies: Number(row.count),
  }));

  const activeUsers = totalUsers - disabledUsers;
  const totalUnits = inventoryData._sum.quantity || 0;

  // Calculate week-over-week trends
  const userTrend =
    totalUsers > 0 ? ((newUsersThisWeek / totalUsers) * 100).toFixed(1) : "0";
  const companyTrend =
    totalCompanies > 0
      ? ((newCompaniesThisWeek / totalCompanies) * 100).toFixed(1)
      : "0";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <IconUsers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IconTrendingUp className="size-3 text-green-500" />+
              {newUsersThisWeek} this week ({userTrend}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <IconUserPlus className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {disabledUsers} disabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <IconBuilding className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IconTrendingUp className="size-3 text-green-500" />+
              {newCompaniesThisWeek} this week ({companyTrend}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <IconPackage className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalUnits.toLocaleString()} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <IconActivity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
            <IconBuildingStore className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Active workspaces</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Activity Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminGrowthChart
            userGrowthData={userGrowthData}
            companyGrowthData={companyGrowthData}
          />
        </div>
        <div>
          <AdminSystemHealth
            activeSessions={activeSessions}
            totalUsers={totalUsers}
            totalProducts={totalProducts}
          />
        </div>
      </div>

      {/* Activity & Quick Actions Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminRecentActivity activities={recentActivity} />
        </div>
        <div>
          <AdminQuickActions />
        </div>
      </div>
    </div>
  );
}
