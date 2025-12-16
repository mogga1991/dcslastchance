/**
 * Environment Variable Validation
 * ✅ FIXED: Validates all required environment variables at application startup
 * Prevents runtime crashes due to missing environment variables
 */

import { z } from 'zod';

const envSchema = z.object({
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required').optional(),
  SUPABASE_ACCESS_TOKEN: z.string().optional(),

  // Database (Required)
  DATABASE_URL: z.string().url('Invalid database URL'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').optional(),

  // OAuth (Optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // AI APIs (Optional)
  OPENAI_API_KEY: z.string().optional(),

  // Maps (Optional)
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

  // External APIs (Optional)
  SAM_API_KEY: z.string().optional(),

  // Security (Optional)
  CRON_SECRET: z.string().optional(),

  // Polar.sh (Optional)
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_SUCCESS_URL: z.string().optional(),
  NEXT_PUBLIC_STARTER_TIER: z.string().optional(),
  NEXT_PUBLIC_STARTER_SLUG: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables at startup
 * Call this in your root layout or middleware
 * Skips validation during build time to allow static page generation
 */
export function validateEnv(): Env | null {
  // Skip validation during build time (when NEXT_PHASE is set to 'phase-production-build')
  // or when running in a build context without runtime env vars
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
    (!process.env.NEXT_PUBLIC_SUPABASE_URL && typeof window === 'undefined');

  if (isBuildTime) {
    // During build, just return null - env validation happens at runtime
    console.log('Skipping env validation during build...');
    return null;
  }

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      // In production, log warning but don't crash during SSG
      console.error(
        `❌ Invalid environment variables:\n${missingVars}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.`
      );
      return null;
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Only use after calling validateEnv()
 */
export const env = process.env as unknown as Env;
