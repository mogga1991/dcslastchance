# SENTYR.md - Company Mission & Product Context

> **Company:** Sentyr
> **Product:** FedSpace Scout
> **Last Updated:** December 2025

---

## Company Overview

**Sentyr** is building intelligent automation tools for the federal real estate market, starting with **FedSpace Scout**—a platform that automates the discovery and qualification of GSA lease opportunities.

### The Problem We Solve

Federal leasing operates through a manual, time-intensive process that wastes countless hours:

- **GSA publishes RLPs** (Requests for Lease Proposals) through SAM.gov
- **Documents are complex**: 50-200 pages with delineated area maps, square footage requirements, parking ratios, security specs, accessibility standards
- **Manual review required**: Brokers and owners must download, read, and analyze each package individually
- **High rejection rate**: Most opportunities are incompatible with available properties, but you only discover this after hours of review
- **Repeated for every opportunity**: The process starts over for each new RLP

**The Result:** Most time spent on federal leasing is wasted on opportunities that were never viable in the first place.

---

## What FedSpace Scout Does

Scout automates the qualification process, helping brokers and property owners identify which federal lease opportunities to pursue—and why—without the manual grind.

### Core Capabilities

#### 1. Automated Ingestion
- **Daily SAM.gov sync**: Pulls new RLP solicitations automatically
- **Complete document capture**: Stores SAM.gov metadata + all attachments
- **External link following**: Discovers additional documents hosted on GSA pages
- **Amendment tracking**: Detects changes and re-processes updated packages
- **Opportunity Bundles**: All source documents in one place with parsing status

#### 2. AI-Powered Requirement Extraction
Creates structured **Requirement Graphs** from RLP documents:

- **Requirement classification**: Hard gates vs. scored preferences
- **Category tagging**: Location, size, parking, security, etc.
- **Value extraction**: Specific numbers, ranges, and criteria
- **Citation tracking**: Page numbers and direct quotes from source documents
- **Compliance focus**: Every requirement includes receipts showing exactly where it came from

**Why Citations Matter:**
Federal leasing is compliance-heavy. Brokers need to see exactly where requirements come from. Scout provides the receipts: "This requirement came from page 14 of the RLP, this one from the agency-specific attachment, this one from SAM.gov metadata."

When documents are missing or inaccessible, Scout builds a "thin graph" from SAM.gov metadata alone—with clearly marked confidence levels.

#### 3. Property Listing Management
**Simple, 2-minute listing creation:**

**Required Fields:**
- Address
- Available square footage
- Use type
- Availability date

**Optional Federal Readiness Fields:**
- Parking count
- ADA accessibility
- Seismic status
- Security readiness
- Loading dock availability

**'Unknown' is allowed**: Missing optional data affects confidence scores but doesn't prevent matching. The system works with what you provide.

#### 4. Intelligent Matching System

**Stage 1: Eligibility Gates (Pass/Fail)**
- Is property inside the delineated area?
- Does square footage fall within min/max window?
- Is use type compatible?
- Are 'must-have' requirements met?

Failing any gate = ineligible (shown greyed out with explanation).

**Stage 2: Scoring (0-100)**
Eligible properties scored on:
- Location fit within delineated area
- Size fit relative to ideal
- Building type alignment
- Parking adequacy
- Compliance indicators

**Every score includes:**
- **Reason cards**: Explaining what drove the score up or down
- **Specific suggestions**: "Parking is weak—adding 15 spaces would improve score by 12 points"
- **RLP-specific context**: Not generic tips—tailored to this opportunity and this property

#### 5. Map-First Interface
- **Visual delineated areas**: See geographic boundaries as polygons
- **RLP pins + Listing pins**: All opportunities and properties on one map
- **Score-based halos**: Eligible listings sized by match quality
- **Side panel rankings**: Top matches with detailed scores
- **Immediate spatial clarity**: See why properties qualify or don't at a glance

**Why a map?**
Federal leasing is inherently spatial. Delineated area is the first and most important filter. If your building isn't in the right place, nothing else matters.

---

## Why This Matters Now

### The Current Environment

Federal real estate is experiencing significant uncertainty:

- **Increased scrutiny**: Government efficiency focus on every lease
- **Slower acquisitions**: Agencies cautious about commitments
- **Fewer opportunities**: Less frequent RLP postings
- **Higher competition**: More firms competing for available deals
- **Tighter windows**: Less time to respond effectively

### Scout's Value in This Environment

Scout doesn't change policy or create more RLPs. **What it does:**

✓ **Immediate awareness**: Know about qualified opportunities the moment they're posted
✓ **Clear requirements**: Understand exactly what's needed without hours of document review
✓ **Focused effort**: Spend time on deals where you have a realistic chance of winning
✓ **Competitive advantage**: Faster, better-informed responses than manual competitors

**The firms that win** will be those that can identify opportunities quickly and present compelling, well-documented offers. **The firms doing manual review** will struggle to keep up.

---

## What We're NOT Building

Scout is laser-focused on the matching problem. We're intentionally not solving (yet):

### ❌ Proposal Automation
Once you decide to pursue an RLP, the response process (offer letters, pricing, representations, negotiation) is a different workflow. **Scout helps you decide what to pursue**—it doesn't write your proposal.

### ❌ Non-Leasing SAM.gov Categories
Federal procurement includes products, services, construction, IT—each with unique document structures and requirements. **Starting with RLPs** gives us a focused problem where we can build something genuinely useful rather than superficially broad.

### ❌ Award Prediction / Agency Behavior Modeling
Predicting which RLPs will result in successful awards requires historical data we don't have yet. **We're building the foundation first**—reliable ingestion, accurate extraction, useful matching—before layering on predictive capabilities.

---

## The Bet We're Making

### Market Opportunity
- **Billions of dollars** in annual federal lease payments
- **Stable, creditworthy tenants** on long-term agreements
- **Manual processes** despite obvious automation potential

### Technology Readiness
The tools to solve this problem well now exist:
- ✅ Large language models can extract structured requirements with citations
- ✅ Geospatial tools can handle delineated areas and proximity calculations
- ✅ Modern web infrastructure can process SAM.gov data at scale

**The question isn't whether this is technically possible—it clearly is.**

### The Real Challenge: Earning Trust

Users are:
- Accustomed to doing this work themselves
- Rightfully skeptical of AI claiming to understand compliance-heavy documents
- Need confidence in outputs before changing their workflow

**Our approach:**
- **Citations on everything**: Show exactly where requirements come from
- **Explainability**: Every score includes detailed reasoning
- **Confidence levels**: Surface when data is incomplete or uncertain
- **Not replacing judgment**: Giving humans better information to make faster, better decisions

### Go-to-Market Strategy

1. **Start with pilot metros**: Work with real brokers and owners
2. **Measure what matters**: Does Scout help them win deals they would have missed? Avoid wasting time on non-viable deals?
3. **Iterate based on outcomes**: If it works, expand. If not, learn why and fix it.
4. **Earn trust through results**: Not hype—actual improvement in their workflow and win rate.

---

## Core Product Principles

### 1. Transparency
Every score, every match, every requirement extraction includes citations and reasoning. No black boxes.

### 2. Incomplete Data is OK
Properties can have 'unknown' values. Documents can be missing. Scout works with what it has and clearly communicates confidence levels.

### 3. Spatial First
Federal leasing is inherently geographic. The map interface makes eligibility logic immediately understandable.

### 4. Compliance-Ready
Federal real estate requires documentation. Scout provides the receipts: page numbers, quotes, source documents.

### 5. Speed Matters
In a tighter market with more competition, being first with a qualified response is a competitive advantage.

---

## Success Metrics

### User Success
- Time saved per opportunity review
- Number of qualified opportunities discovered that would have been missed
- Number of non-viable opportunities avoided
- Win rate improvement on pursued RLPs

### Product Performance
- RLP ingestion completeness (% of SAM.gov RLPs captured)
- Requirement extraction accuracy (validated against human review)
- Match relevance (% of top-scored properties that users pursue)
- Citation accuracy (requirements traceable to correct source pages)

### Market Validation
- Pilot metro expansion rate
- User retention and engagement
- Conversion from free trial to paid subscription
- Referrals and word-of-mouth growth

---

## Target Users

### Primary
- **Commercial real estate brokers** specializing in federal leasing
- **Property owners** seeking federal tenants
- **Tenant rep firms** working with government agencies

### Characteristics
- Active in metros with significant federal presence (DC, San Diego, Denver, etc.)
- Handle 10+ RLP reviews per month
- Value time savings on qualification vs. proposal effort
- Need compliance documentation for clients/owners
- Comfortable with technology but skeptical of AI hype

---

## Competitive Landscape

### Current Alternatives

**Manual SAM.gov Monitoring**
- Time-intensive
- Prone to missing opportunities
- Inconsistent document availability
- No matching intelligence

**Generic CRE Platforms**
- Don't understand federal requirements
- Can't parse RLP documents
- No delineated area support
- Generic scoring that doesn't match federal evaluation criteria

**Enterprise GovCon Tools**
- Focused on products/services procurement, not real estate
- Expensive, complex, built for large contractors
- Don't integrate property listings
- Not designed for broker workflows

### Scout's Differentiation
- **Only platform** purpose-built for federal lease opportunity matching
- **AI extraction** with compliance-grade citations
- **Property-first design** for broker/owner workflows
- **Accessible pricing** for small/mid-size firms
- **Spatial intelligence** via map-first interface

---

## Technology Philosophy

### Build for Trust
- Cite sources for every extracted requirement
- Show confidence scores, not false certainty
- Make reasoning visible, not hidden
- Allow validation of AI outputs

### Handle Reality
- Documents will be incomplete
- Property data will have gaps
- Requirements will be ambiguous
- The system should degrade gracefully

### Optimize for Speed
- Daily SAM.gov syncs, not weekly
- Real-time matching updates
- Fast map interactions
- Instant property listing creation

### Scale Intelligently
- Start with pilot metros, expand methodically
- Build feedback loops before scaling
- Validate accuracy before adding complexity
- Keep the core workflow simple

---

## Future Vision (Not Building Yet)

Ideas for future development after core matching is proven:

- **Proposal templates** pre-populated with RLP requirements
- **Historical win rate** analysis by agency/property type
- **Predictive modeling** for award likelihood
- **Automated RLP monitoring** with custom alerts
- **Team collaboration** features for multi-person firms
- **Integration with** CRE listing platforms (CoStar, LoopNet)
- **Expansion to** other federal real estate categories (sales, build-to-suit)

But first: **nail the matching problem**.

---

## Contact & Resources

### Product
- **FedSpace Scout**: [Product URL]
- **Support**: [Support email/portal]
- **Documentation**: [Docs URL]

### Company
- **Sentyr Website**: [Company URL]
- **Founder**: [Founder info]
- **Location**: [HQ location]

### Key Integrations
- **SAM.gov**: Source of RLP data
- **GSA**: Delineated area maps and documents
- **Supabase**: Database and backend infrastructure
- **AI Services**: Claude Sonnet for extraction

---

## Appendix: Federal Leasing Terms

**RLP (Request for Lease Proposal)**
GSA's solicitation document for federal office space leasing. Contains all requirements, evaluation criteria, and submission instructions.

**Delineated Area**
Geographic boundary within which properties must be located to be eligible. Usually defined as polygon coordinates or described via street boundaries.

**Set-Aside**
Designation that gives preference to certain property owners (Veteran-Owned, Historic Properties, etc.).

**LPTA (Lowest Price Technically Acceptable)**
Evaluation method where lowest-cost compliant offer wins. Less common in leasing.

**Best Value / Tradeoff**
Evaluation method considering both price and non-price factors (location quality, building features, etc.). Most common in federal leasing.

**Agency-Specific Requirements**
Additional criteria beyond GSA's standard requirements, unique to the tenant agency (e.g., FBI security requirements, VA accessibility needs).

**SF-1217**
Standard form used for federal lease offers, includes pricing and property details.

---

*This document serves as the mission context for Sentyr and FedSpace Scout. It should be referenced whenever clarification is needed about our company vision, product focus, or strategic direction.*
