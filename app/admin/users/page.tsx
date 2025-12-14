import { prisma } from "@/lib/prisma/prisma";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const perPage = 10;
  const search = params.search || "";
  const roleFilter = params.role || "";
  const statusFilter = params.status || "";

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (roleFilter) {
    where.role = roleFilter;
  }

  if (statusFilter === "active") {
    where.isDisabled = false;
  } else if (statusFilter === "disabled") {
    where.isDisabled = true;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { name: true },
        },
        _count: {
          select: { sessions: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users across the platform
        </p>
      </div>

      <AdminUsersTable
        users={users}
        page={page}
        totalPages={totalPages}
        total={total}
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
      />
    </div>
  );
}
