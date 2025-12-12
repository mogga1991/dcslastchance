# Security Guide - ProposalIQ

This document outlines the security measures implemented in ProposalIQ and best practices for maintaining security.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [API Security](#api-security)
3. [Authentication & Authorization](#authentication--authorization)
4. [Credit System Security](#credit-system-security)
5. [Data Protection](#data-protection)
6. [Rate Limiting](#rate-limiting)
7. [Environment Variables](#environment-variables)
8. [Security Headers](#security-headers)
9. [File Upload Security](#file-upload-security)
10. [Security Checklist](#security-checklist)
11. [Incident Response](#incident-response)

---

## Security Architecture

### Defense in Depth

ProposalIQ implements multiple layers of security:

1. **Network Layer**: HTTPS enforced, security headers, HSTS
2. **Application Layer**: Authentication, authorization, input validation
3. **API Layer**: Rate limiting, authentication checks, credit verification
4. **Data Layer**: Row-level security (RLS), encrypted connections
5. **Client Layer**: CSP headers, XSS prevention, sanitization

---

## API Security

### Protected Endpoints

All API endpoints are protected with the `protectApiRoute()` utility:

```typescript
const protection = await protectApiRoute({
  requireAuth: true,
  rateLimit: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
});

if (!protection.authorized || protection.response) {
  return protection.response;
}
```

### Authentication Flow

1. Client sends request with session cookie
2. `protectApiRoute()` verifies session via Better Auth
3. If authenticated, checks rate limit for user
4. Returns 401 if not authenticated, 429 if rate limited

### Current Protected Endpoints

- ✅ `/api/chat` - Requires auth, 20 req/min
- ✅ `/api/upload-image` - Requires auth, 10 req/min
- ✅ `/api/subscription` - Requires auth
- ⚠️ `/api/payments/webhooks` - Public (webhook signature verification required)

---

## Authentication & Authorization

### Session Management

- **Provider**: Better Auth
- **Storage**: Database-backed sessions
- **Session Duration**: Configurable via Better Auth
- **Refresh**: Automatic on activity

### Authorization Checks

```typescript
// lib/api-security.ts
export async function verifyAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session?.userId) {
    return { authenticated: false, userId: null };
  }
  return { authenticated: true, userId: session.session.userId };
}
```

### User Verification

```typescript
const { exists, user } = await verifyUserExists(userId);
if (!exists) {
  return createForbiddenResponse("User not found");
}
```

---

## Credit System Security

### Credit Verification

Before any credit-consuming operation:

```typescript
import { verifyAndConsumeCredit } from "@/lib/credit-security";

const creditCheck = await verifyAndConsumeCredit(userId, "chat");
if (!creditCheck.allowed) {
  return NextResponse.json(
    { error: creditCheck.reason },
    { status: 403 }
  );
}
```

### Multi-Layer Credit Protection

1. **Subscription Verification**: Check active subscription exists
2. **Expiration Check**: Verify subscription hasn't expired
3. **Usage Tracking**: Prevent abuse with per-user rate limits
4. **Audit Logging**: Log all credit usage for monitoring

### Credit Abuse Prevention

- **Rate Limiting**: 100 chat requests/hour per user
- **Analysis Limits**: 50 analyses/hour per user
- **Upload Limits**: 50 uploads/hour per user
- **Audit Logging**: All credit usage logged for fraud detection

### Audit Trail

```typescript
import { logCreditUsage } from "@/lib/credit-security";

logCreditUsage({
  userId: userId!,
  operation: "chat",
  timestamp: new Date(),
  success: true,
  metadata: { messageCount: messages.length },
});
```

---

## Data Protection

### Supabase Row-Level Security (RLS)

All database tables should have RLS policies:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can view own data"
ON public.analyses
FOR SELECT
USING (auth.uid() = user_id);
```

### Encrypted Storage

- **Database**: PostgreSQL SSL/TLS connections required
- **Storage Bucket**: Supabase Storage with access policies
- **API Keys**: Environment variables, never in code

### Data Sanitization

```typescript
import { sanitizeInput } from "@/lib/api-security";

const sanitized = sanitizeInput(userInput);
// Removes: <script>, javascript:, event handlers
// Limits: 10,000 characters max
```

---

## Rate Limiting

### Implementation

Rate limiting is implemented in `lib/api-security.ts` using in-memory storage.

**⚠️ PRODUCTION RECOMMENDATION**: Use Redis for distributed rate limiting.

### Current Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chat` | 20 requests | 1 minute |
| `/api/upload-image` | 10 uploads | 1 minute |
| Credit usage (chat) | 100 requests | 1 hour |
| Credit usage (analysis) | 50 requests | 1 hour |
| Credit usage (upload) | 50 requests | 1 hour |

### Rate Limit Headers

Rate limit responses include:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 42
X-RateLimit-Reset: 1702345678000
```

### Custom Rate Limits

```typescript
const protection = await protectApiRoute({
  rateLimit: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    identifier: `custom:${userId}:${operation}`,
  },
});
```

---

## Environment Variables

### Critical Secrets

Never commit these to version control:

```bash
SUPABASE_SERVICE_ROLE_KEY    # Full database access
BETTER_AUTH_SECRET           # Session encryption
OPENAI_API_KEY               # AI service access
DATABASE_URL                 # Database connection
POLAR_ACCESS_TOKEN           # Payment processing
POLAR_WEBHOOK_SECRET         # Webhook verification
```

### .env.local Protection

- ✅ Listed in `.gitignore`
- ✅ `.env.example` provided for reference
- ✅ Vercel environment variables used in production

### Secret Rotation

- Rotate `BETTER_AUTH_SECRET` every 90 days
- Rotate API keys on suspected compromise
- Use different keys for dev/staging/production

---

## Security Headers

### Implemented Headers

All responses include comprehensive security headers via `middleware.ts`:

```typescript
// Prevent clickjacking
"X-Frame-Options": "DENY"

// Prevent MIME sniffing
"X-Content-Type-Options": "nosniff"

// XSS Protection
"X-XSS-Protection": "1; mode=block"

// Referrer Policy
"Referrer-Policy": "strict-origin-when-cross-origin"

// Content Security Policy (CSP)
"Content-Security-Policy": "default-src 'self'; ..."

// Force HTTPS
"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"

// Permissions Policy
"Permissions-Policy": "camera=(), microphone=(), geolocation=()"
```

### CSP Configuration

The CSP allows:
- Self-hosted resources
- Stripe.js for payments
- Supabase for API calls
- OpenAI API for chat
- Google Fonts for styling
- Inline styles (Next.js requirement)

To tighten CSP, use nonces for inline scripts.

---

## File Upload Security

### Upload Endpoint Protection

`/api/upload-image` implements multiple security layers:

### 1. Authentication
```typescript
const protection = await protectApiRoute({ requireAuth: true });
```

### 2. Rate Limiting
```typescript
rateLimit: {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
}
```

### 3. File Type Validation
```typescript
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
```

### 4. File Size Limits
```typescript
maxSizeBytes: 10 * 1024 * 1024, // 10MB
```

### 5. Magic Byte Verification
```typescript
// Verify file content matches MIME type
const magicBytes = buffer.slice(0, 4).toString("hex");
const isValidImage =
  magicBytes.startsWith("ffd8ff") || // JPEG
  magicBytes === "89504e47" ||       // PNG
  magicBytes.startsWith("474946") || // GIF
  magicBytes.startsWith("52494646"); // WebP
```

### 6. Secure Filename Generation
```typescript
// Prevents path traversal and overwrites
const filename = `${userId}/${timestamp}-${randomString}.${sanitizedExt}`;
```

### Storage Bucket Security

Supabase storage bucket policies (RLS):

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads' AND name LIKE auth.uid() || '/%');

-- Public read access
CREATE POLICY "Public can view files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');
```

---

## Security Checklist

### Before Deployment

- [ ] All `.env.local` variables set in production environment
- [ ] `BETTER_AUTH_SECRET` is cryptographically random (32+ chars)
- [ ] Database has RLS policies enabled on all tables
- [ ] Supabase service role key is secured
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Rate limits tested under load
- [ ] Webhook signature verification implemented
- [ ] Error messages don't leak sensitive information
- [ ] SQL injection tests passed (use parameterized queries)
- [ ] XSS tests passed (input sanitization active)
- [ ] CSRF protection verified (SameSite cookies)

### Ongoing Monitoring

- [ ] Monitor rate limit violations
- [ ] Review credit audit logs weekly
- [ ] Check for suspicious upload patterns
- [ ] Monitor API error rates
- [ ] Review authentication failures
- [ ] Check for brute force attempts
- [ ] Verify Supabase RLS policies are working
- [ ] Test security headers with securityheaders.com

### Monthly Tasks

- [ ] Review access logs for anomalies
- [ ] Update dependencies (npm audit fix)
- [ ] Rotate development API keys
- [ ] Review and update rate limits
- [ ] Check for new security advisories

### Quarterly Tasks

- [ ] Rotate `BETTER_AUTH_SECRET` (requires user re-auth)
- [ ] Security audit of new features
- [ ] Penetration testing
- [ ] Review and update CSP

---

## Incident Response

### If a Key is Compromised

1. **Immediate**: Rotate the key in environment variables
2. **Revoke**: Deactivate old key in service provider (Supabase, OpenAI, etc.)
3. **Audit**: Check logs for unauthorized usage
4. **Notify**: Inform affected users if data was accessed
5. **Document**: Record incident and resolution

### If Unauthorized Access Detected

1. **Isolate**: Temporarily disable affected account
2. **Investigate**: Review audit logs and access patterns
3. **Revoke**: Invalidate all sessions for affected user
4. **Notify**: Contact user about suspicious activity
5. **Remediate**: Fix vulnerability that allowed access

### Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Email: [Your Security Email]
PGP Key: [If available]

We will respond within 48 hours.

---

## Upgrade Path

### Current Limitations

1. **In-Memory Rate Limiting**: Not suitable for multi-instance deployments
2. **No WAF**: Consider Cloudflare for DDoS protection
3. **Basic Input Validation**: Could be more comprehensive
4. **No IP Allowlisting**: For admin endpoints

### Recommended Upgrades

#### Short-term (1-3 months)

- [ ] Implement Redis for distributed rate limiting
- [ ] Add IP-based blocking for suspicious activity
- [ ] Implement more granular RLS policies
- [ ] Add request signing for critical operations
- [ ] Implement CAPTCHA for signup/login

#### Long-term (3-6 months)

- [ ] Implement Web Application Firewall (WAF)
- [ ] Add anomaly detection for fraud prevention
- [ ] Implement certificate pinning
- [ ] Add security event monitoring (SIEM)
- [ ] Implement automated security scanning in CI/CD

---

## Security Best Practices for Developers

1. **Never log sensitive data** (passwords, API keys, session tokens)
2. **Always use parameterized queries** (prevents SQL injection)
3. **Validate all user input** (never trust client-side validation)
4. **Use HTTPS everywhere** (no mixed content)
5. **Implement least privilege** (minimum necessary permissions)
6. **Keep dependencies updated** (npm audit regularly)
7. **Use security linters** (ESLint security plugins)
8. **Review code for security** (peer reviews, automated scans)

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Better Auth Security](https://www.better-auth.com/docs/concepts/security)

---

**Last Updated**: December 2024
**Review Frequency**: Monthly
**Next Review**: January 2025
