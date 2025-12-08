"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SavedFilterSchema, FilterDataSchema } from "@/lib/validations/filters";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return null;
  }
  return session.user;
}

function formatValidationErrors(issues: z.ZodIssue[]) {
  const errors: Record<string, string[]> = {};
  issues.forEach((issue) => {
    const path = issue.path.join(".") || "form";
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });
  return errors;
}

export async function listSavedFilters() {
  const user = await requireUser();

  if (!user) {
    return {
      success: false,
      message: "Please sign in to view saved filters.",
      filters: [],
    };
  }

  const filters = await prisma.inventoryFilter.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return {
    success: true,
    filters: filters.map((f) => ({
      id: f.id,
      name: f.name,
      filters: f.filters,
      isDefault: f.isDefault,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
  };
}

export async function createSavedFilter(formData: FormData) {
  const user = await requireUser();

  if (!user) {
    return {
      success: false,
      message: "Please sign in to save filters.",
    };
  }

  const parsedName = SavedFilterSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsedName.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(parsedName.error.issues),
    };
  }

  const filtersData = formData.get("filters");
  let filters: unknown;

  try {
    filters = filtersData ? JSON.parse(String(filtersData)) : {};
  } catch {
    return {
      success: false,
      message: "Invalid filter data",
    };
  }

  const parsedFilters = FilterDataSchema.safeParse(filters);

  if (!parsedFilters.success) {
    return {
      success: false,
      message: "Invalid filter data",
      errors: formatValidationErrors(parsedFilters.error.issues),
    };
  }

  const normalizedName = parsedName.data.name;

  const existing = await prisma.inventoryFilter.findFirst({
    where: {
      userId: user.id,
      name: normalizedName,
    },
  });

  if (existing) {
    return {
      success: false,
      message: "A filter with this name already exists.",
      errors: { name: ["Filter name already in use."] },
    };
  }

  const isDefault = formData.get("isDefault") === "true";

  if (isDefault) {
    await prisma.inventoryFilter.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const savedFilter = await prisma.inventoryFilter.create({
    data: {
      userId: user.id,
      name: normalizedName,
      filters: parsedFilters.data,
      isDefault,
    },
  });

  revalidatePath("/inventory");

  return {
    success: true,
    message: "Filter saved successfully.",
    filter: {
      id: savedFilter.id,
      name: savedFilter.name,
      filters: savedFilter.filters,
      isDefault: savedFilter.isDefault,
      createdAt: savedFilter.createdAt.toISOString(),
      updatedAt: savedFilter.updatedAt.toISOString(),
    },
  };
}

export async function setDefaultFilter(formData: FormData) {
  const user = await requireUser();

  if (!user) {
    return {
      success: false,
      message: "Please sign in to manage filters.",
    };
  }

  const id = String(formData.get("id") || "").trim();
  if (!id) {
    return {
      success: false,
      message: "Filter identifier is required.",
    };
  }

  const filter = await prisma.inventoryFilter.findFirst({
    where: { id, userId: user.id },
  });

  if (!filter) {
    return {
      success: false,
      message: "Filter not found or access denied.",
    };
  }

  await prisma.$transaction([
    prisma.inventoryFilter.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    }),
    prisma.inventoryFilter.update({
      where: { id },
      data: {
        isDefault: true,
      },
    }),
  ]);

  revalidatePath("/inventory");

  return {
    success: true,
    message: "Default filter updated successfully.",
  };
}

export async function deleteSavedFilter(formData: FormData) {
  const user = await requireUser();

  if (!user) {
    return {
      success: false,
      message: "Please sign in to manage filters.",
    };
  }

  const id = String(formData.get("id") || "").trim();
  if (!id) {
    return {
      success: false,
      message: "Filter identifier is required.",
    };
  }

  const filter = await prisma.inventoryFilter.findFirst({
    where: { id, userId: user.id },
  });

  if (!filter) {
    return {
      success: false,
      message: "Filter not found or access denied.",
    };
  }

  await prisma.inventoryFilter.delete({
    where: { id },
  });

  revalidatePath("/inventory");

  return {
    success: true,
    message: "Filter deleted successfully.",
  };
}
