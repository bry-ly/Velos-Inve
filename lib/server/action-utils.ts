/**
 * Shared utilities for server actions
 */
import 'server-only'

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { z } from "zod";

/**
 * Standard action result shape for consistency across all actions
 * Uses discriminated union for better type safety
 */
export type ActionSuccess<T = unknown> = {
  success: true;
  message: string;
  data?: T;
  errors?: never;
};

export type ActionFailure = {
  success: false;
  message: string;
  errors: Record<string, string[]>;
  data?: never;
};

/**
 * Discriminated union type for action results
 * Provides better type narrowing when checking success/failure
 * 
 * @example
 * const result = await someAction()
 * if (result.success) {
 *   // TypeScript knows result is ActionSuccess here
 *   console.log(result.message)
 *   if (result.data) console.log(result.data)
 * } else {
 *   // TypeScript knows result.errors exists here
 *   console.log(result.errors)
 * }
 */
export type ActionResult<T = unknown> = ActionSuccess<T> | ActionFailure;

/**
 * Require an authenticated user or throw an error
 * Returns the authenticated user
 */
export async function requireAuthedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  return session.user;
}

/**
 * Format Zod validation errors into a consistent error object
 */
export function formatZodErrors(
  issues: z.ZodIssue[]
): Record<string, string[]> {
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

/**
 * Create a success action result
 */
export function successResult<T = unknown>(
  message: string,
  data?: T
): ActionSuccess<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Create a failure action result
 */
export function failureResult(
  message: string,
  errors?: Record<string, string[]>
): ActionFailure {
  return {
    success: false,
    message,
    errors: errors || {},
  };
}
