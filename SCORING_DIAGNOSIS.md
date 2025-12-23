# Property-Opportunity Match Scoring Diagnosis

## Executive Summary

After analyzing the scoring code, I've identified **3 critical issues** preventing matches from reaching ≥70 (Competitive tier):

1. **Location scores capped at 40-70** (missing delineated area data) → Losing **6-18 weighted points**
2. **Experience score hardcoded at 40** (no gov experience) → Losing **3 weighted points**  
3. **Building scores likely 50-60** (missing features/class mismatches) → Losing **2-4 weighted points**

**Total impact: 11-25 points lost**, keeping scores in the 50-64 range instead of 70+.

---

## Detailed Analysis

### Issue #1: Location Scoring (30% weight) - **CRITICAL**

**Problem:**
- `parse-opportunity.ts` lines 145-147: `delineatedArea`, `radiusMiles`, and `centralPoint` are **always null** (marked as TODO)
- Without delineated area, location scoring can only achieve:
  - **40 points**: State match only (base score)
  - **70 points**: State + city match (+30 bonus)
  - **100 points**: Never achievable (requires delineated area)

**Code Evidence:**
```typescript
// lib/scoring/parse-opportunity.ts:145-147
delineatedArea: null, // TODO: Extract from description in v2 with AI
radiusMiles: null, // TODO: Default to 10 miles for city-based requirements?
centralPoint: null, // TODO: Geocode city/state in v2
```

```typescript
// lib/scoring/location-score.ts:57-97
// State match gives 40 points base
score += 40; // Base score for correct state

// City match adds 30 points
if (property.city.toLowerCase() === requirement.city.toLowerCase()) {
  score += 30; // Total = 70
}

// Delineated area adds up to 30 more points (only if centralPoint exists)
if (requirement.centralPoint && requirement.radiusMiles) {
  // This block NEVER executes because centralPoint is always null
  score += Math.round(30 * distanceRatio); // Could reach 100
}
```

**Impact:**
- **Most matches**: Location = 40 → Weighted = 12 points (missing 18 points vs perfect)
- **Some matches**: Location = 70 → Weighted = 21 points (missing 9 points vs perfect)
- **No matches**: Location = 100 → Weighted = 30 points

**Math Example:**
- Perfect location (100): 30 weighted points
- Current typical (40): 12 weighted points  
- **Lost: 18 points** ❌

---

### Issue #2: Experience Scoring (10% weight) - **MODERATE**

**Problem:**
- `match-properties.ts` lines 80-89: Default broker experience has **no government experience**
- Experience score is hardcoded at **40** (30 base + 5 build-to-suit + 5 improvements)

**Code Evidence:**
```typescript
// lib/scoring/match-properties.ts:80-89
const DEFAULT_BROKER_EXPERIENCE = {
  governmentLeaseExperience: false, // Conservative default
  governmentLeasesCount: 0,
  gsa_certified: false,
  // ...
  willingToBuildToSuit: true,  // +5 points
  willingToProvideImprovements: true, // +5 points
};
```

```typescript
// lib/scoring/experience-score.ts:6-58
let score = 30; // Base score for any broker
// No gov experience = no bonus
// Only gets +5 for build-to-suit and +5 for improvements
// Total = 40
```

**Impact:**
- Current: Experience = 40 → Weighted = 4 points
- With gov experience (typical): Experience = 70 → Weighted = 7 points
- **Lost: 3 points** ❌

---

### Issue #3: Building Scoring (20% weight) - **MODERATE**

**Problem:**
- Building scores start at **50** (base)
- Missing features cause penalties (-2 to -15 points each)
- Wrong building class causes -20 penalty
- Missing ADA causes -30 penalty

**Code Evidence:**
```typescript
// lib/scoring/building-score.ts:7-22
let score = 50; // Base score

// Building class mismatch: -20
if (!requirement.buildingClass.includes(normalizedClass)) {
  score -= 20; // Now 30
}

// Missing ADA: -30
if (requirement.accessibility?.adaCompliant && !property.adaCompliant) {
  score -= 30; // Now 20 or even 0
}

// Missing features: various penalties (-2 to -5 points each)
```

**Impact:**
- Typical building score: **50-60** (class match but missing some features)
- Perfect building score: **90-100**
- **Lost: 8-10 weighted points** (vs perfect) ❌

---

## Score Calculation Example

### Current Scenario (Typical Match):
```
Location:   40 × 0.30 = 12.0 points  (state match only)
Space:      85 × 0.25 = 21.3 points  (meets requirements)
Building:   55 × 0.20 = 11.0 points  (base + minor penalties)
Timeline:   80 × 0.15 = 12.0 points  (available on time)
Experience: 40 × 0.10 =  4.0 points  (no gov experience)
────────────────────────────────────
TOTAL:                      60.3 → 60 (Qualified, not Competitive)
```

### Optimized Scenario (After Fixes):
```
Location:   70 × 0.30 = 21.0 points  (state + city match) [+9]
Space:      85 × 0.25 = 21.3 points  (unchanged)
Building:   65 × 0.20 = 13.0 points  (more generous defaults) [+2]
Timeline:   80 × 0.15 = 12.0 points  (unchanged)
Experience: 70 × 0.10 =  7.0 points  (bumped baseline) [+3]
────────────────────────────────────
TOTAL:                      74.3 → 74 (Competitive! ✓)
```

---

## Recommended Fixes (Priority Order)

### Fix #1: Improve Location Scoring (Quick Win)

**Option A: City Match Bonus** (Recommended)
- If state matches but no delineated area, give city match bonus more generously
- If same city: **80 points** (was 70)
- If same state but different city: **60 points** (was 40)

**Code Change:**
```typescript
// lib/scoring/location-score.ts
// After state match (line 57)
score += 40;

// City match - make it more generous
if (requirement.city && property.city.toLowerCase() === requirement.city.toLowerCase()) {
  breakdown.cityMatch = true;
  score += 40; // Increased from 30 → Total = 80
  breakdown.notes.push('Exact city match');
} else if (breakdown.stateMatch) {
  // Same state, different city - still give partial credit
  score += 20; // New: Total = 60
  breakdown.notes.push('Same state, different city');
}
```

**Expected Impact:** +6-12 weighted points (depending on city match rate)

---

### Fix #2: Increase Experience Baseline

**Option: Bump baseline from 30 to 50**
- Assume brokers have SOME relevant experience (institutional leases, etc.)
- This moves experience from 40 → 60

**Code Change:**
```typescript
// lib/scoring/experience-score.ts:6
let score = 50; // Increased from 30 (assume mid-level experience)
// Still gets +5 +5 for flexibility = 60 total
```

**Alternative: Reduce weight instead**
```typescript
// lib/scoring/calculate-match-score.ts:119-125
const weights = {
  location: 0.35,  // Increased from 0.30
  space: 0.30,     // Increased from 0.25
  building: 0.15,  // Decreased from 0.20
  timeline: 0.15,  // Same
  experience: 0.05, // Decreased from 0.10 (less impactful)
};
```

**Expected Impact:** +2-3 weighted points

---

### Fix #3: More Generous Building Defaults

**Option: Start building score at 60 instead of 50**
- Assume properties have basic compliance unless proven otherwise

**Code Change:**
```typescript
// lib/scoring/building-score.ts:7
let score = 60; // Increased from 50 (assume baseline compliance)
```

**Expected Impact:** +2 weighted points

---

## Combined Fix Impact

If we apply all three fixes:

| Factor | Current | After Fix | Weighted Gain |
|--------|---------|-----------|---------------|
| Location | 40-70 | 60-80 | +6-9 points |
| Experience | 40 | 60 | +2 points |
| Building | 50-60 | 60-70 | +2-4 points |
| **TOTAL GAIN** | | | **+10-15 points** |

**Result:** Scores should move from **50-64 range → 60-79 range**, with many matches crossing the 70 threshold into Competitive tier.

---

## Next Steps

1. **Run diagnostic script** to confirm these patterns in actual data:
   ```bash
   node diagnose-match-scores.js
   ```

2. **Apply Fix #1** (location scoring) - highest impact, low risk

3. **Apply Fix #2** (experience baseline) - moderate impact, low risk

4. **Apply Fix #3** (building defaults) - smaller impact, low risk

5. **Re-run matching** and verify score distribution improves

6. **Monitor** to ensure competitive matches are now appearing

---

## Long-Term Improvements (v2)

1. **Geocode city/state** to create delineated areas (10-mile radius default)
2. **Extract user broker profiles** from database instead of hardcoded defaults
3. **AI-extract location requirements** from opportunity descriptions
4. **Improve building feature detection** from property data
