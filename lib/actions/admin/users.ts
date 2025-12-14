"use server";

import { prisma } from "@/lib/prisma/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to verify admin access
async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return session.user;
}

// Get paginated users list
export async function getUsers({
  page = 1,
  perPage = 10,
  search = "",
  roleFilter = "",
  statusFilter = "",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  roleFilter?: string;
  statusFilter?: string;
}) {
  await verifyAdmin();

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

  return {
    users,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

// Update user role
export async function updateUserRole(userId: string, role: "user" | "admin") {
  const admin = await verifyAdmin();

  if (admin.id === userId) {
    return { success: false, message: "Cannot change your own role" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as any }, // Cast to match Prisma enum
  });

  revalidatePath("/admin/users");
  return { success: true, message: `User role updated to ${role}` };
}

// Disable/Enable user (soft delete)
export async function toggleUserStatus(userId: string) {
  const admin = await verifyAdmin();

  if (admin.id === userId) {
    return { success: false, message: "Cannot disable your own account" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isDisabled: true },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const newStatus = !user.isDisabled;

  await prisma.user.update({
    where: { id: userId },
    data: { isDisabled: newStatus },
  });

  revalidatePath("/admin/users");
  return {
    success: true,
    message: newStatus ? "User disabled" : "User enabled",
  };
}

// Hard delete user (with all data)
export async function deleteUser(userId: string) {
  const admin = await verifyAdmin();

  if (admin.id === userId) {
    return { success: false, message: "Cannot delete your own account" };
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
  return { success: true, message: "User deleted permanently" };
}

// Get admin dashboard stats
export async function getAdminStats() {
  await verifyAdmin();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisWeek,
    totalCompanies,
    newCompaniesThisWeek,
    totalProducts,
    activeSessions,
    disabledUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.company.count(),
    prisma.company.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.product.count(),
    prisma.session.count({ where: { expiresAt: { gt: now } } }),
    prisma.user.count({ where: { isDisabled: true } }),
  ]);

  // Get inventory value (sum of price * quantity for all products)
  const inventoryValue = await prisma.product.aggregate({
    _sum: {
      quantity: true,
    },
  });

  // Get user growth data for last 30 days
  const userGrowth = await prisma.user.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: monthAgo } },
    _count: true,
    orderBy: { createdAt: "asc" },
  });

  // Get company growth data for last 30 days
  const companyGrowth = await prisma.company.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: monthAgo } },
    _count: true,
    orderBy: { createdAt: "asc" },
  });

  return {
    totalUsers,
    newUsersThisWeek,
    totalCompanies,
    newCompaniesThisWeek,
    totalProducts,
    activeSessions,
    disabledUsers,
    activeUsers: totalUsers - disabledUsers,
    totalUnits: inventoryValue._sum.quantity || 0,
    userGrowth,
    companyGrowth,
  };
}

// Get recent activity for admin dashboard
export async function getRecentActivity(limit = 10) {
  await verifyAdmin();

  const activities = await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: { name: true, email: true, image: true },
      },
      owner: {
        select: { name: true, email: true },
      },
    },
  });

  return activities;
}

// Impersonate user - creates a session token for the target user
// This is for debugging/support purposes only
export async function impersonateUser(userId: string) {
  const admin = await verifyAdmin();

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!targetUser) {
    return { success: false, message: "User not found" };
  }

  if (targetUser.role === "admin") {
    return { success: false, message: "Cannot impersonate other admins" };
  }

  // Log this action
  await prisma.activityLog.create({
    data: {
      userId: targetUser.id,
      actorId: admin.id,
      entityType: "USER",
      entityId: userId,
      action: "IMPERSONATE",
      note: `Admin ${admin.email} impersonated user ${targetUser.email}`,
    },
  });

  // Return the user info - actual impersonation would need to be handled
  // by creating a session on the client-side
  return {
    success: true,
    message: `Impersonating ${targetUser.name}`,
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      hasCompany: !!targetUser.company,
    },
  };
}
