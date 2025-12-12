import { db } from "@/db/drizzle";
import { subscription } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Credit usage tracking to prevent abuse
 * In production, this should use Redis for distributed rate limiting
 */
const creditUsageCache = new Map<
  string,
  { count: number; resetAt: number }
>();

interface CreditCheckResult {
  allowed: boolean;
  reason?: string;
  subscription?: {
    id: string;
    status: string;
    productId: string;
  };
}

/**
 * Verify user has an active subscription or available credits
 */
export async function verifyUserHasCredits(
  userId: string
): Promise<CreditCheckResult> {
  try {
    // 1. Check for active subscription
    const userSubscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId));

    if (!userSubscriptions.length) {
      return {
        allowed: false,
        reason: "No subscription found. Please subscribe to use this feature.",
      };
    }

    // Get the most recent active subscription
    const activeSubscription = userSubscriptions
      .filter((sub) => sub.status === "active")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

    if (!activeSubscription) {
      return {
        allowed: false,
        reason: "No active subscription. Please renew your subscription.",
      };
    }

    // 2. Verify subscription is not expired
    const now = new Date();
    const periodEnd = new Date(activeSubscription.currentPeriodEnd);

    if (periodEnd < now) {
      return {
        allowed: false,
        reason: "Subscription has expired. Please renew to continue.",
      };
    }

    // 3. Check if subscription is set to cancel
    if (activeSubscription.cancelAtPeriodEnd) {
      // Still allow usage until period ends
      if (periodEnd < now) {
        return {
          allowed: false,
          reason: "Subscription has been cancelled and period has ended.",
        };
      }
    }

    return {
      allowed: true,
      subscription: {
        id: activeSubscription.id,
        status: activeSubscription.status,
        productId: activeSubscription.productId,
      },
    };
  } catch (error) {
    console.error("Credit verification error:", error);
    return {
      allowed: false,
      reason: "Failed to verify subscription status",
    };
  }
}

/**
 * Track credit usage to prevent abuse within a time window
 * This prevents users from hammering the API even with valid subscriptions
 */
export async function trackCreditUsage(
  userId: string,
  maxUsagePerHour: number = 100
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const key = `credit-usage:${userId}`;

  const current = creditUsageCache.get(key);

  if (!current || current.resetAt < now) {
    // New window
    const resetAt = now + oneHour;
    creditUsageCache.set(key, {
      count: 1,
      resetAt,
    });
    return {
      allowed: true,
      remaining: maxUsagePerHour - 1,
      resetAt,
    };
  }

  if (current.count >= maxUsagePerHour) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: maxUsagePerHour - current.count,
    resetAt: current.resetAt,
  };
}

/**
 * Verify and consume a credit atomically
 * This should be called when actually using a credit (e.g., running an analysis)
 */
export async function verifyAndConsumeCredit(
  userId: string,
  operation: "chat" | "analysis" | "upload" = "chat"
): Promise<CreditCheckResult> {
  // 1. Verify user has credits
  const creditCheck = await verifyUserHasCredits(userId);
  if (!creditCheck.allowed) {
    return creditCheck;
  }

  // 2. Check usage limits to prevent abuse
  const usageLimits = {
    chat: 100, // 100 chat requests per hour
    analysis: 50, // 50 analyses per hour
    upload: 50, // 50 uploads per hour
  };

  const usageCheck = await trackCreditUsage(
    `${userId}:${operation}`,
    usageLimits[operation]
  );

  if (!usageCheck.allowed) {
    return {
      allowed: false,
      reason: `Rate limit exceeded for ${operation}. Resets at ${new Date(usageCheck.resetAt).toISOString()}`,
    };
  }

  // 3. TODO: Actually consume the credit from database
  // This would decrement the user's credit balance or log usage
  // For now, we're just checking subscription status

  return creditCheck;
}

/**
 * Get remaining credits for a user
 */
export async function getRemainingCredits(userId: string): Promise<{
  hasUnlimitedCredits: boolean;
  remainingCredits?: number;
  subscription?: {
    status: string;
    periodEnd: Date;
  };
}> {
  try {
    const userSubscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId));

    if (!userSubscriptions.length) {
      return {
        hasUnlimitedCredits: false,
        remainingCredits: 0,
      };
    }

    const activeSubscription = userSubscriptions
      .filter((sub) => sub.status === "active")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

    if (!activeSubscription) {
      return {
        hasUnlimitedCredits: false,
        remainingCredits: 0,
      };
    }

    // Most subscriptions provide unlimited usage
    // Specific plans might have credit limits stored elsewhere
    return {
      hasUnlimitedCredits: true,
      subscription: {
        status: activeSubscription.status,
        periodEnd: new Date(activeSubscription.currentPeriodEnd),
      },
    };
  } catch (error) {
    console.error("Error getting remaining credits:", error);
    return {
      hasUnlimitedCredits: false,
      remainingCredits: 0,
    };
  }
}

/**
 * Audit log for credit usage (important for security and debugging)
 */
interface CreditAuditLog {
  userId: string;
  operation: string;
  timestamp: Date;
  success: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

const auditLogs: CreditAuditLog[] = [];

export function logCreditUsage(log: CreditAuditLog) {
  auditLogs.push(log);

  // In production, send to logging service
  console.log("[CREDIT_AUDIT]", JSON.stringify(log));

  // Keep only last 1000 logs in memory
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }
}

export function getRecentAuditLogs(userId?: string, limit = 100) {
  const logs = userId
    ? auditLogs.filter((log) => log.userId === userId)
    : auditLogs;

  return logs.slice(-limit);
}
