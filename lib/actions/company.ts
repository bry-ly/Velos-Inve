"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  currency: z.string().default("USD"),
  logo: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value || value === "") return true;
        return (
          z.string().url().safeParse(value).success ||
          value.startsWith("data:image/")
        );
      },
      { message: "Logo must be a valid URL or base64 image" }
    ),
  industry: z.string().optional().or(z.literal("")),
  teamSize: z.string().optional().or(z.literal("")),
});

export type CreateCompanyState = {
  errors?: {
    name?: string[];
    email?: string[];
    website?: string[];
    currency?: string[];
    logo?: string[];
    industry?: string[];
    teamSize?: string[];
    _form?: string[];
  };
  message?: string;
} | null;

export async function createCompany(
  prevState: CreateCompanyState,
  formData: FormData
): Promise<CreateCompanyState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      message: "You must be logged in to create a company.",
    };
  }

  const validatedFields = createCompanySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    website: formData.get("website"),
    currency: formData.get("currency"),
    logo: formData.get("logo"),
    industry: formData.get("industry"),
    teamSize: formData.get("teamSize"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Company.",
    };
  }

  const { name, email, website, currency, logo, industry, teamSize } =
    validatedFields.data;

  try {
    // Check if user already has a company
    const existingCompany = await prisma.company.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (existingCompany) {
      return {
        message: "You already have a company associated with your account.",
      };
    }

    await prisma.company.create({
      data: {
        userId: session.user.id,
        name,
        email: email || null,
        website: website || null,
        currency,
        logo: logo || null,
        industry: industry || null,
        teamSize: teamSize || null,
        onboardingCompleted: true,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Failed to Create Company.",
    };
  }

  revalidatePath("/dashboard");
  return { message: "success" };
}

export async function getCompany() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const company = await prisma.company.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  return company;
}
