import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Rate limiting using in-memory store (for production, use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

export async function checkRateLimit(
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const key = config.identifier || "global";

  const current = rateLimitStore.get(key);

  if (!current || current.resetAt < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetAt: current.resetAt,
  };
}

/**
 * Verify authenticated user session
 */
export async function verifyAuth() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return {
        authenticated: false,
        userId: null,
        error: "Unauthorized - No valid session",
      };
    }

    return {
      authenticated: true,
      userId: authUser.id,
      user: authUser,
      error: null,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      authenticated: false,
      userId: null,
      error: "Authentication failed",
    };
  }
}

/**
 * Verify user exists and is active
 */
export async function verifyUserExists(userId: string) {
  try {
    const userRecord = await db.select().from(user).where(eq(user.id, userId));

    if (!userRecord.length) {
      return {
        exists: false,
        user: null,
        error: "User not found",
      };
    }

    return {
      exists: true,
      user: userRecord[0],
      error: null,
    };
  } catch (error) {
    console.error("User verification error:", error);
    return {
      exists: false,
      user: null,
      error: "User verification failed",
    };
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File, options: {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
}): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > options.maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${options.maxSizeBytes / 1024 / 1024}MB`,
    };
  }

  if (!options.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type",
    };
  }

  return { valid: true };
}

/**
 * Create a rate-limited response
 */
export function createRateLimitResponse(resetAt: number) {
  return NextResponse.json(
    {
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      resetAt: new Date(resetAt).toISOString(),
    },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
        "X-RateLimit-Reset": resetAt.toString(),
      },
    }
  );
}

/**
 * Create an unauthorized response
 */
export function createUnauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create a forbidden response
 */
export function createForbiddenResponse(message = "Forbidden") {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Comprehensive API protection middleware
 */
export async function protectApiRoute(options?: {
  rateLimit?: RateLimitConfig;
  requireAuth?: boolean;
}) {
  const requireAuth = options?.requireAuth !== false; // Default to true

  // 1. Check authentication
  if (requireAuth) {
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return {
        authorized: false,
        response: createUnauthorizedResponse(authResult.error || undefined),
        userId: null,
        user: null,
      };
    }

    // 2. Check rate limit with user-specific identifier
    if (options?.rateLimit) {
      const rateLimitResult = await checkRateLimit({
        ...options.rateLimit,
        identifier: authResult.userId || "anonymous",
      });

      if (!rateLimitResult.allowed) {
        return {
          authorized: false,
          response: createRateLimitResponse(rateLimitResult.resetAt),
          userId: authResult.userId,
          user: authResult.user,
        };
      }
    }

    return {
      authorized: true,
      response: null,
      userId: authResult.userId,
      user: authResult.user,
    };
  }

  // If auth not required, still check rate limit with IP-based identifier
  if (options?.rateLimit) {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";

    const rateLimitResult = await checkRateLimit({
      ...options.rateLimit,
      identifier: ip,
    });

    if (!rateLimitResult.allowed) {
      return {
        authorized: false,
        response: createRateLimitResponse(rateLimitResult.resetAt),
        userId: null,
        user: null,
      };
    }
  }

  return {
    authorized: true,
    response: null,
    userId: null,
    user: null,
  };
}
