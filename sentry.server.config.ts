/**
 * Sentry Server-Side Configuration
 * Captures errors from Next.js server-side code, API routes, and serverless functions
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Errors to ignore
  ignoreErrors: [
    // Database connection errors during builds
    'ECONNREFUSED',
    'ENOTFOUND',
    // Expected errors
    'Unauthorized',
    '401',
    '403',
  ],

  // Before sending events, modify them here
  beforeSend(event, hint) {
    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry]', hint.originalException || event);
      return null;
    }

    // Add custom context
    if (event.request) {
      event.request.headers = {
        ...event.request.headers,
        // Remove sensitive headers
        authorization: '[Filtered]',
        cookie: '[Filtered]',
      };
    }

    return event;
  },

  // Performance monitoring
  integrations: [
    // Database query monitoring
    Sentry.prismaIntegration(),
  ],
});
