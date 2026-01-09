import 'server-only'
import { z } from 'zod'

/**
 * Environment variable validation schema
 * 
 * This module provides type-safe access to environment variables
 * with runtime validation. If required variables are missing,
 * the application will fail fast at startup with clear error messages.
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Better Auth (required)
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // OAuth providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // AWS S3 (optional - for image uploads)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  
  // ImageKit (optional - for image CDN)
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validated environment variables
 * 
 * @example
 * import { env } from '@/lib/env'
 * 
 * // Type-safe access
 * const dbUrl = env.DATABASE_URL // string
 * const googleId = env.GOOGLE_CLIENT_ID // string | undefined
 */
function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  
  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    )
    throw new Error('Invalid environment variables')
  }
  
  return parsed.data
}

export const env = getEnv()
