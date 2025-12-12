# API Route Authorization Migration Guide

**Status**: Routes currently use Clerk authentication but lack organization-level and role-based authorization.

---

## 🚨 Current Security Gaps

### Critical Issues
1. **No org-level data isolation** - Users can only see their own data, not their team's
2. **No role enforcement** - Admins have no special privileges
3. **Credits can be added by anyone** - POST /api/credits has no admin guard
4. **Dashboard shows only user data** - Teams can't see org-wide stats

---

## 📋 Route-by-Route Migration Plan

### ✅ Routes That Are OK (But Could Be Better)

#### `/api/profile/route.ts` - GET, POST, PUT
**Current**: ✅ Auth required, user can only access their own profile
**Recommendation**: Add org validation when updating org-related fields

---

### ⚠️ Routes That Need Updates

### 1. `/api/analyses/route.ts`

#### Current Behavior
```typescript
// GET - Returns only user's own analyses
// POST - Creates analysis for current user only
```

#### Security Gaps
- ❌ Teams in same org can't see each other's analyses
- ❌ Admins can't view all org analyses
- ❌ No credit validation before creating

#### Required Guards
| Method | Guard | Purpose |
|--------|-------|---------|
| GET | `requireAuth()` | Basic auth ✅ (already have) |
| GET | Org-scoped query | Show all analyses in user's org |
| POST | `requireAuth()` | Basic auth ✅ (already have) |
| POST | `requireCredits(userId, 1)` | Verify user has credits |

#### Migration Code
```typescript
import { requireAuth, requireCredits, AuthError } from "@/lib/auth-guards";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // ✅ NEW - Show all analyses in user's organization
    const analyses = await sql`
      SELECT
        a.*,
        u.name as created_by_name,
        u.email as created_by_email
      FROM analysis a
      JOIN "user" u ON a.user_id = u.id
      WHERE u.organization_id = ${session.organizationId}
      ORDER BY a."createdAt" DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ analyses });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // ✅ NEW - Check credits before creating
    await requireCredits(session.userId, 1);

    const body = await request.json();

    const analysis = await createAnalysis({
      user_id: session.userId,
      organization_id: session.organizationId,
      document_type: body.document_type || "rfp",
      document_name: body.document_name,
      document_url: body.document_url,
      opportunity_id: body.opportunity_id,
    });

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}
```

---

### 2. `/api/analyses/[id]/route.ts`

#### Current Behavior
```typescript
// GET - Returns analysis if user owns it
// PUT - Updates analysis if user owns it
```

#### Security Gaps
- ❌ Team members in same org can't view each other's analyses
- ❌ Admins can't access all analyses

#### Required Guards
| Method | Guard | Purpose |
|--------|-------|---------|
| GET | `requireAuth()` | Basic auth ✅ |
| GET | Org access validation | Allow org members to view |
| PUT | `requireAuth()` | Basic auth ✅ |
| PUT | Ownership validation | Only owner or admin can edit |

#### Migration Code
```typescript
import { requireAuth, requireOwnershipOrAdmin, requireResourceOrgAccess, AuthError } from "@/lib/auth-guards";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // ✅ NEW - Allow viewing if user is in same org
    await requireResourceOrgAccess(session.userId, "analysis", id);

    const analysis = await sql`
      SELECT
        a.*,
        u.name as created_by_name,
        u.email as created_by_email
      FROM analysis a
      JOIN "user" u ON a.user_id = u.id
      WHERE a.id = ${id}
      LIMIT 1
    `;

    if (!analysis[0]) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis: analysis[0] });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // ✅ NEW - Only owner or admin can edit
    await requireOwnershipOrAdmin(session.userId, "analysis", id);

    const body = await request.json();
    const analysis = await updateAnalysis(id, session.userId, body);

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}
```

---

### 3. `/api/credits/route.ts` 🚨 CRITICAL

#### Current Behavior
```typescript
// GET - Returns user's credits ✅
// POST - Adds credits to user (NO VALIDATION!) ❌❌❌
```

#### Security Gaps
- 🚨 **CRITICAL**: Anyone can add credits to themselves!
- ❌ No admin check on POST

#### Required Guards
| Method | Guard | Purpose |
|--------|-------|---------|
| GET | `requireAuth()` | Basic auth ✅ |
| POST | `requireAdmin(userId)` | **Only admins can add credits** |

#### Migration Code
```typescript
import { requireAuth, requireAdmin, AuthError } from "@/lib/auth-guards";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const [credits, total] = await Promise.all([
      getCredits(session.userId),
      getTotalCredits(session.userId),
    ]);

    return NextResponse.json({ credits, total });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // 🚨 CRITICAL FIX - Only admins can add credits
    await requireAdmin(session.userId);

    const body = await request.json();

    const credit = await addCredits({
      user_id: body.user_id || session.userId, // Allow admin to add to any user
      credit_type: body.credit_type || "one_time",
      total_credits: body.total_credits,
      expires_at: body.expires_at ? new Date(body.expires_at) : undefined,
    });

    return NextResponse.json({ credit }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}
```

---

### 4. `/api/dashboard/stats/route.ts`

#### Current Behavior
```typescript
// GET - Returns only user's own stats
```

#### Security Gaps
- ❌ Teams can't see org-wide stats
- ❌ Admins can't see aggregated data

#### Required Guards
| Method | Guard | Purpose |
|--------|-------|---------|
| GET | `requireAuth()` | Basic auth ✅ |
| GET | Org-scoped query | Show org-wide stats |

#### Migration Code
```typescript
import { requireAuth, AuthError } from "@/lib/auth-guards";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // ✅ NEW - Org-wide stats instead of just user's
    const [analyses, credits, teamStats] = await Promise.all([
      // Analysis stats for the organization
      sql`
        SELECT
          COUNT(*) as total_analyses,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_analyses,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_analyses,
          COUNT(CASE WHEN bid_recommendation = 'STRONG_BID' THEN 1 END) as strong_bids
        FROM analysis a
        JOIN "user" u ON a.user_id = u.id
        WHERE u.organization_id = ${session.organizationId}
      `,

      // User's personal credits
      getTotalCredits(session.userId),

      // Team member count
      sql`
        SELECT COUNT(*) as team_members
        FROM "user"
        WHERE organization_id = ${session.organizationId}
      `
    ]);

    return NextResponse.json({
      stats: {
        // Org-wide analysis stats
        total_analyses: Number(analyses[0].total_analyses),
        completed_analyses: Number(analyses[0].completed_analyses),
        processing_analyses: Number(analyses[0].processing_analyses),
        strong_bids: Number(analyses[0].strong_bids),

        // User's personal stats
        credits_remaining: credits,

        // Team stats
        team_members: Number(teamStats[0].team_members),
      }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}
```

---

### 5. `/api/sam-opportunities/route.ts`

#### Current Behavior
```typescript
// GET - Public endpoint, no auth
```

#### Security Gaps
- ⚠️ SAM.gov data is public, so this might be intentional
- ❌ No rate limiting
- ❌ No usage tracking

#### Recommendation
**Option A**: Keep public but add rate limiting
**Option B**: Require auth to prevent abuse

If you want to require auth:

```typescript
import { requireAuth, AuthError } from "@/lib/auth-guards";

export async function GET(request: NextRequest) {
  try {
    // ✅ Optional - Require auth to prevent abuse
    const session = await requireAuth();

    // ... existing code
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}
```

---

## 📊 Summary Table

| Route | Current Auth | Needs | Priority |
|-------|--------------|-------|----------|
| `/api/profile` | ✅ User-only | Org validation on updates | Low |
| `/api/analyses` (GET) | ✅ User-only | ⚠️ Org-wide view | **High** |
| `/api/analyses` (POST) | ✅ Auth | 🚨 Credit validation | **Critical** |
| `/api/analyses/[id]` (GET) | ✅ Ownership | ⚠️ Org access | High |
| `/api/analyses/[id]` (PUT) | ✅ Ownership | ⚠️ Admin override | Medium |
| `/api/credits` (GET) | ✅ User-only | None | Low |
| `/api/credits` (POST) | ❌ None | 🚨 **Admin only** | **CRITICAL** |
| `/api/dashboard/stats` | ✅ User-only | ⚠️ Org-wide stats | High |
| `/api/sam-opportunities` | ❌ Public | ⚠️ Optional auth | Low |

---

## 🔄 Migration Steps

### Phase 1: Critical Security (Do First) ⚡
1. ✅ Add admin guard to `/api/credits` POST
2. ✅ Add credit validation to `/api/analyses` POST

### Phase 2: Team Collaboration (Do Soon) 📊
3. ✅ Update `/api/analyses` GET to show org-wide
4. ✅ Update `/api/analyses/[id]` GET to allow org access
5. ✅ Update `/api/dashboard/stats` to show org stats

### Phase 3: Enhancement (Optional) 🎨
6. Add role checks where needed
7. Add rate limiting to public endpoints
8. Add audit logging

---

## 🧪 Testing Checklist

After migration, test these scenarios:

### Multi-User Org Testing
- [ ] User A and User B in same org
  - [ ] User A creates analysis
  - [ ] User B can view it in GET /api/analyses
  - [ ] User B can view detail in GET /api/analyses/:id
  - [ ] User B cannot edit in PUT /api/analyses/:id
- [ ] Dashboard shows combined stats for both users

### Cross-Org Isolation
- [ ] User A in Org 1, User B in Org 2
  - [ ] User A cannot see User B's analyses
  - [ ] User B cannot access User A's analysis by ID
  - [ ] Each sees only their org's dashboard stats

### Role Testing
- [ ] Regular user cannot POST /api/credits
- [ ] Admin can POST /api/credits
- [ ] Admin can edit any org member's analysis

### Credit Testing
- [ ] User with 0 credits cannot POST /api/analyses
- [ ] User with 1 credit can POST /api/analyses
- [ ] Credit balance decrements after creating

---

## 📝 Code Pattern Reference

### Standard Error Handling Pattern
```typescript
export async function HANDLER(request: NextRequest) {
  try {
    const session = await requireAuth();
    // ... your logic
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    // Log unexpected errors
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Org-Scoped Query Pattern
```typescript
// Instead of:
const data = await sql`SELECT * FROM table WHERE user_id = ${userId}`;

// Use:
const data = await sql`
  SELECT t.*
  FROM table t
  JOIN "user" u ON t.user_id = u.id
  WHERE u.organization_id = ${session.organizationId}
`;
```

---

**Next**: Let's update the actual route files!
