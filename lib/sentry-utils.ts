/**
 * Sentry Utility Functions
 * Helper functions for error tracking, performance monitoring, and user feedback
 */

import * as Sentry from '@sentry/nextjs';

// =============================================================================
// ERROR TRACKING
// =============================================================================

/**
 * Track an error with additional context
 */
export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Track an error with severity level
 */
export function trackErrorWithLevel(
  error: Error,
  level: 'fatal' | 'error' | 'warning' | 'info',
  context?: Record<string, any>
) {
  Sentry.captureException(error, {
    level,
    extra: context,
  });
}

/**
 * Track a message (not an exception)
 */
export function trackMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

// =============================================================================
// USER CONTEXT
// =============================================================================

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

// =============================================================================
// CUSTOM CONTEXT
// =============================================================================

/**
 * Add tags to errors (for filtering in Sentry dashboard)
 */
export function setTags(tags: Record<string, string>) {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

/**
 * Add custom context to errors
 */
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Start a performance span (modern Sentry API)
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({
    name,
    op,
  }, (span) => span);
}

/**
 * Measure async operation performance
 */
export async function measurePerformance<T>(
  operationName: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: operationName,
      op: 'function',
    },
    async () => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        trackError(error as Error, {
          operation: operationName,
          ...context,
        });
        throw error;
      }
    }
  );
}

// =============================================================================
// BREADCRUMBS (Event Trail)
// =============================================================================

/**
 * Add a breadcrumb (trail of events leading to error)
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

// =============================================================================
// API ERROR TRACKING
// =============================================================================

/**
 * Track API errors with request/response context
 */
export function trackAPIError(error: Error, context: {
  endpoint: string;
  method: string;
  statusCode?: number;
  requestBody?: any;
  responseBody?: any;
}) {
  Sentry.captureException(error, {
    extra: {
      endpoint: context.endpoint,
      method: context.method,
      statusCode: context.statusCode,
      requestBody: context.requestBody,
      responseBody: context.responseBody,
    },
    tags: {
      api_endpoint: context.endpoint,
      http_method: context.method,
      http_status: context.statusCode?.toString() || 'unknown',
    },
  });
}

// =============================================================================
// AI EXTRACTION ERROR TRACKING
// =============================================================================

/**
 * Track AI extraction failures
 */
export function trackAIExtractionError(error: Error, context: {
  opportunityId: string;
  extractionMethod: 'ai' | 'regex-fallback';
  tokensUsed?: number;
  cost?: number;
}) {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      extraction_method: context.extractionMethod,
      opportunity_id: context.opportunityId,
    },
    fingerprint: ['ai-extraction-error', context.opportunityId],
  });
}

/**
 * Track AI extraction fallback (not an error, but important to monitor)
 */
export function trackAIExtractionFallback(context: {
  opportunityId: string;
  reason: string;
  fallbackAccuracy: number;
}) {
  Sentry.captureMessage('AI extraction fallback to regex', {
    level: 'warning',
    extra: context,
    tags: {
      extraction_fallback: 'true',
      opportunity_id: context.opportunityId,
    },
  });
}

// =============================================================================
// CACHE CLEANUP ERROR TRACKING
// =============================================================================

/**
 * Track cache cleanup failures
 */
export function trackCacheCleanupError(error: Error, context: {
  recordsDeleted?: number;
  executionTime?: number;
}) {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      cron_job: 'cache-cleanup',
    },
    fingerprint: ['cache-cleanup-error'],
  });
}

// =============================================================================
// DATABASE ERROR TRACKING
// =============================================================================

/**
 * Track database errors
 */
export function trackDatabaseError(error: Error, context: {
  operation: 'read' | 'write' | 'delete' | 'update';
  table: string;
  query?: string;
}) {
  Sentry.captureException(error, {
    extra: {
      ...context,
      // Sanitize query (remove sensitive data)
      query: context.query?.substring(0, 500) || undefined,
    },
    tags: {
      db_operation: context.operation,
      db_table: context.table,
    },
  });
}

export default {
  trackError,
  trackErrorWithLevel,
  trackMessage,
  setUserContext,
  clearUserContext,
  setTags,
  setContext,
  startTransaction,
  measurePerformance,
  addBreadcrumb,
  trackAPIError,
  trackAIExtractionError,
  trackAIExtractionFallback,
  trackCacheCleanupError,
  trackDatabaseError,
};
