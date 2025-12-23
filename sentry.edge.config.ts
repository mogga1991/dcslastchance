/**
 * Sentry Edge Runtime Configuration
 * For API routes and middleware running on the edge
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Lower sample rate for edge functions (high volume)
  tracesSampleRate: 0.1,

  // Before sending events
  beforeSend(event, hint) {
    // Don't send from development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    return event;
  },
});
