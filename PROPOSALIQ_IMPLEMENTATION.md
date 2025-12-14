# ProposalIQ Implementation Guide

## Overview

This guide covers the complete ProposalIQ PDF storage, viewer, and evidence system implementation.

## ✅ What's Been Implemented

### 1. Database Schema (Multi-tenant with RLS)

**File:** `supabase/migrations/20251213230000_create_proposaliq_schema.sql`

Tables created:
- `orgs` - Organizations
- `org_members` - Organization membership with roles
- `company_profiles` - AI personalization data (JSONB)
- `opportunities` - SAM.gov opportunities + manual imports
- `opportunity_documents` - PDF metadata linking to Supabase Storage
- `opportunity_analysis` - AI extraction results
- `opportunity_scorecards` - Bid/No-Bid decisions
- `opportunity_compliance_matrices` - Requirements tracking

**Storage:**
- Bucket: `opportunity-documents`
- RLS policies ensure users only access their org's documents
- Signed URLs for secure PDF access

### 2. Storage Utilities

**File:** `lib/proposaliq/storage.ts`

Functions:
- `uploadDocument()` - Upload PDF and create DB record
- `getSignedUrl()` - Generate time-limited signed URL (1 hour default)
- `getDocumentWithUrl()` - Get document metadata + signed URL
- `listOpportunityDocuments()` - List all docs for an opportunity
- `deleteDocument()` - Remove from storage + DB
- `updateDocumentMetadata()` - Update after text extraction

### 3. TypeScript Schemas

**File:** `lib/proposaliq/schemas.ts`

Types:
- `WorkflowStage` - 8-stage opportunity workflow
- `ComplianceMatrixRow` - Individual requirement
- `ComplianceMatrix` - Full requirements matrix
- `Scorecard` - Bid/No-Bid scoring
- `OpportunityAnalysis` - AI extraction output
- `EvidenceSource` - PDF citation (page, section, snippet)

Functions:
- `classifyRequirementToStage()` - Auto-classify requirements by content
- `tagMatrixRows()` - Add workflow stages to matrix

### 4. PDF Viewer Component

**File:** `components/proposaliq/pdf-viewer.tsx`

Features:
- React-PDF integration with PDF.js worker
- Page navigation (prev/next + jump to page)
- Zoom controls (50% - 300%)
- Download button
- Text selection support
- Annotation layer rendering

**Route:** `app/dashboard/documents/[documentId]/page.tsx`

URL params:
- `?page=12` - Jump to specific page
- `?highlight=text` - Show highlight indicator

### 5. Evidence Sheet Component

**File:** `components/proposaliq/evidence-sheet.tsx`

Features:
- Side drawer (Sheet) showing evidence details
- Displays requirement context
- Shows page number, section, text snippet
- Extraction confidence badge
- "View in Document" button → opens PDF at exact page
- Handles missing evidence gracefully

### 6. Compliance Matrix Table

**File:** `components/proposaliq/compliance-matrix-table.tsx`

Features:
- Search by requirement text, ID, or type
- Filter by priority (Must/Should/May)
- Filter by workflow stage (8 stages)
- Evidence button → opens Evidence Sheet
- Status dropdown (Not Started/In Progress/Completed/N/A)
- Export to CSV
- Summary counts at top
- Color-coded workflow stage badges

### 7. UI Components

**ScoreCardHeader** (`components/proposaliq/scorecard-header.tsx`):
- Opportunity title + agency
- Set-aside badge
- Decision badge (color-coded)
- Fit score progress bar
- Confidence progress bar
- Due date display

**HardStopBanner** (`components/proposaliq/hard-stop-banner.tsx`):
- Red alert for disqualifying factors
- List of hard-stop reasons
- Prominent warning icon

---

## 🚀 Quick Start

### 1. Run the Migration

```bash
# Link to your Supabase project
export SUPABASE_ACCESS_TOKEN=sbp_e006194037d8ae8051892dd89915bd627ad37861
supabase link

# Push the migration
supabase db push
```

### 2. Create Storage Bucket (if not auto-created)

Via Supabase Dashboard:
1. Go to Storage → Buckets
2. Create new bucket: `opportunity-documents`
3. Set to **Private** (not public)
4. RLS policies are already in the migration

### 3. Usage Example

```tsx
"use client";

import { useState } from "react";
import { ScoreCardHeader } from "@/components/proposaliq/scorecard-header";
import { HardStopBanner } from "@/components/proposaliq/hard-stop-banner";
import { ComplianceMatrixTable } from "@/components/proposaliq/compliance-matrix-table";
import { tagMatrixRows } from "@/lib/proposaliq/schemas";
import type { ComplianceMatrix, Scorecard } from "@/lib/proposaliq/schemas";

export default function OpportunityAnalysisPage({
  scorecard,
  matrix,
  documentId,
}: {
  scorecard: Scorecard;
  matrix: ComplianceMatrix;
  documentId: string;
}) {
  const [rows, setRows] = useState(tagMatrixRows(matrix));

  function handleRowUpdate(reqId: string, updates: Partial<ComplianceMatrixRow>) {
    setRows((prev) =>
      prev.map((r) => (r.req_id === reqId ? { ...r, ...updates } : r))
    );
    // TODO: Save to database
  }

  return (
    <div className="space-y-6 p-6">
      {/* Scorecard Header */}
      <ScoreCardHeader
        title="FBI Cloud Infrastructure RFP"
        agency="Department of Justice"
        due="2025-01-15 2:00 PM EST"
        setAside="Small Business"
        decision={scorecard.decision}
        score={scorecard.overall_score}
        confidence={scorecard.confidence}
      />

      {/* Hard Stops */}
      {scorecard.hard_stops && (
        <HardStopBanner items={scorecard.hard_stops} />
      )}

      {/* Compliance Matrix */}
      <ComplianceMatrixTable
        rows={rows}
        documentId={documentId}
        showWorkflowStage={true}
        onRowUpdate={handleRowUpdate}
      />
    </div>
  );
}
```

### 4. Upload a Document

```typescript
import { uploadDocument } from "@/lib/proposaliq/storage";

async function handleFileUpload(file: File) {
  try {
    const doc = await uploadDocument({
      orgId: "user-org-id",
      opportunityId: "opp-uuid",
      file: file,
      userId: "user-uuid",
    });

    console.log("Uploaded:", doc.id);
    console.log("Storage path:", doc.storage_path);

    // Now send to AI for extraction...
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
```

### 5. View a Document

```typescript
import { getDocumentWithUrl } from "@/lib/proposaliq/storage";

async function viewDocument(documentId: string) {
  const doc = await getDocumentWithUrl(documentId);

  // Open in new tab
  window.open(`/dashboard/documents/${documentId}?page=5`, "_blank");

  // Or use the signed URL directly
  console.log("PDF URL:", doc.url); // Valid for 1 hour
}
```

---

## 📊 Workflow Integration

The 8-stage workflow classifier automatically tags requirements:

| Stage | Examples |
|-------|----------|
| **Intake** | Submit by email, PDF format, page limit |
| **StrategicAssessment** | Evaluation factors, Best Value, LPTA |
| **CompanyAssessment** | Security clearance, CMMC, ISO certification |
| **BidScorecard** | CLIN pricing, labor categories, cost realism |
| **DecisionDashboard** | Mandatory site visit, incumbent advantage |
| **ProposalAssembly** | Past performance refs, resumes, org chart |
| **DraftStudio** | Technical approach narrative, management plan |
| **OpportunityGateway** | All other requirements |

Access in your code:

```typescript
import { classifyRequirementToStage } from "@/lib/proposaliq/schemas";

const stage = classifyRequirementToStage({
  requirement_type: "technical",
  requirement_statement: "Provide a technical approach narrative...",
});
// → "DraftStudio"
```

---

## 🔐 Security Notes

### RLS Policies

All tables use `is_org_member(org_id)` helper function:
- Users can ONLY access data from orgs they're members of
- Service role bypasses RLS for admin operations
- Storage RLS linked to `opportunity_documents` table

### Storage Security

- **Private bucket** - No public access
- **Signed URLs** expire after 1 hour (configurable)
- **Path structure**: `{org_id}/{opportunity_id}/{timestamp}_{filename}`
- Users can only generate signed URLs for their org's docs

### Best Practices

1. Always validate `org_id` matches current user's org
2. Regenerate signed URLs on-demand (they expire)
3. Use `supabaseAdmin` (service role) only in server-side API routes
4. Never expose `SUPABASE_SERVICE_ROLE_KEY` to client

---

## 🎨 Customization

### Change Evidence Sheet Style

Edit `components/proposaliq/evidence-sheet.tsx`:

```tsx
// Change width
<SheetContent className="w-full sm:max-w-2xl">

// Add more fields
{evidence.custom_field && (
  <div>Custom: {evidence.custom_field}</div>
)}
```

### Adjust Workflow Stages

Edit `lib/proposaliq/schemas.ts`:

```typescript
// Add new stage
export type WorkflowStage =
  | "Intake"
  | "MyCustomStage" // Add here
  | ...

// Update classifier
function classifyRequirementToStage(...) {
  if (/custom pattern/.test(s)) {
    return "MyCustomStage";
  }
  ...
}
```

### Change Score Thresholds

In `scorecard-header.tsx`:

```typescript
const DECISION_STYLES = {
  STRONG_BID: "bg-green-500...", // Darker green
  ...
};
```

---

## 📦 Dependencies Added

```json
{
  "react-pdf": "^latest",
  "pdfjs-dist": "^latest"
}
```

Already installed in your project.

---

## 🐛 Troubleshooting

### "PDF.js worker not found"

The PDF viewer auto-loads from unpkg CDN. For offline use:

```tsx
// In pdf-viewer.tsx, change:
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// Then copy to public/:
// public/pdf.worker.min.mjs (from node_modules/pdfjs-dist/build/)
```

### "Bucket not found"

Manually create via Supabase Dashboard:
1. Storage → New Bucket → `opportunity-documents`
2. Set to Private
3. Policies are auto-applied from migration

### "RLS policy violation"

User may not be in `org_members` table:

```sql
-- Add user to org
INSERT INTO public.org_members (org_id, user_id, role)
VALUES ('org-uuid', 'user-uuid', 'member');
```

---

## 🚢 Next Steps

Recommended enhancements:

1. **Text Extraction Pipeline**
   - Use `pdfjs-dist` to extract full text on upload
   - Store in `opportunity_documents.extracted_text`
   - Enable full-text search with `pg_trgm`

2. **PDF Highlighting**
   - Add react-pdf-highlighter for in-document markup
   - Store highlights in new `document_annotations` table

3. **Batch Upload**
   - Multi-file upload component
   - Progress indicators
   - Concurrent uploads with rate limiting

4. **Evidence Auto-Linking**
   - When AI extracts requirements, auto-create `document_id` references
   - Deep-link evidence buttons directly to PDF page

5. **Real-time Collaboration**
   - Supabase Realtime subscriptions for matrix updates
   - Show who's editing which requirement
   - Live cursor positions

---

## 📚 Related Files

- Migration: `supabase/migrations/20251213230000_create_proposaliq_schema.sql`
- Storage utils: `lib/proposaliq/storage.ts`
- Schemas: `lib/proposaliq/schemas.ts`
- PDF viewer: `components/proposaliq/pdf-viewer.tsx`
- Evidence sheet: `components/proposaliq/evidence-sheet.tsx`
- Matrix table: `components/proposaliq/compliance-matrix-table.tsx`
- Scorecard: `components/proposaliq/scorecard-header.tsx`
- Hard stops: `components/proposaliq/hard-stop-banner.tsx`
- Viewer route: `app/dashboard/documents/[documentId]/page.tsx`

---

*Last updated: December 13, 2024*
