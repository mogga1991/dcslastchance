# AI Extraction Demo

This demo shows how to use the new AI-powered requirement extraction system.

## Quick Start

### 1. Set Up API Key

Add to `.env.local`:
```bash
ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

Get a key from: https://console.anthropic.com

### 2. Basic Usage

```typescript
import { extractRequirements } from '@/lib/ai/extract-requirements';
import type { SAMOpportunity } from '@/lib/sam-gov';

// Sample GSA lease opportunity
const opportunity: SAMOpportunity = {
  noticeId: 'LEASE-DC-2024-001',
  title: 'Office Space - Washington, DC',
  description: `
    GSA seeks approximately 50,000 rentable square feet (RSF) of Class A
    office space in downtown Washington, DC. Space must be contiguous and
    ADA compliant. Building must have fiber optic connectivity, backup power,
    and 24/7 security. LEED Gold or Platinum certification preferred.

    Delineated area: Within 0.5 miles of Metro Center station.

    Occupancy date: January 1, 2025
    Lease term: 10 years firm, 5 years option
  `,
  placeOfPerformance: {
    city: { name: 'Washington' },
    state: { code: 'DC' }
  },
  responseDeadLine: '2024-12-31'
};

// Extract requirements with AI
const result = await extractRequirements(opportunity);

console.log('Extraction Method:', result.requirements.extractionMethod);
console.log('Overall Confidence:', result.requirements.confidence.overall);
console.log('Cost:', `$${result.cost.toFixed(4)}`);
console.log('Time:', `${result.extractionTimeMs}ms`);

// Access extracted data
console.log('Requirements:', {
  location: result.requirements.location,
  space: result.requirements.space,
  building: result.requirements.building,
  timeline: result.requirements.timeline
});
```

### 3. Expected Output

```
Extraction Method: ai
Overall Confidence: 95
Cost: $0.0234
Time: 1250ms

Requirements: {
  location: {
    state: 'DC',
    city: 'Washington',
    delineatedArea: 'Within 0.5 miles of Metro Center station',
    radiusMiles: 0.5,
    centralPoint: {
      lat: 38.8983,
      lng: -77.0287,
      description: 'Metro Center station'
    }
  },
  space: {
    minSqFt: 45000,  // AI infers ~10% tolerance
    maxSqFt: 55000,
    targetSqFt: 50000,
    usableOrRentable: 'rentable',
    contiguous: true,
    divisible: false
  },
  building: {
    buildingClass: ['A'],
    accessibility: {
      adaCompliant: true,
      publicTransit: true,  // Metro mention
      parkingRequired: null  // Not mentioned
    },
    features: {
      fiber: true,
      backupPower: true,
      security24x7: true,
      scifCapable: false,  // Not mentioned
      // ... other features
    },
    certifications: ['LEED Gold', 'LEED Platinum']
  },
  timeline: {
    occupancyDate: '2025-01-01',
    firmTermMonths: 120,  // 10 years
    totalTermMonths: 180,  // 15 years (10 + 5)
    responseDeadline: '2024-12-31'
  }
}
```

### 4. Compare AI vs Regex

```typescript
import { extractRequirementsWithAI, extractRequirementsWithRegex } from '@/lib/ai/extract-requirements';

// AI extraction
const aiResult = await extractRequirementsWithAI(opportunity);

// Regex extraction (fallback)
const regexResult = extractRequirementsWithRegex(opportunity);

console.log('Comparison:');
console.log('  AI delineated area:', aiResult.requirements.location.delineatedArea);
console.log('  Regex delineated area:', regexResult.requirements.location.delineatedArea);
// AI: "Within 0.5 miles of Metro Center station"
// Regex: null (can't extract this)

console.log('  AI confidence:', aiResult.requirements.confidence.overall);
console.log('  Regex confidence:', regexResult.requirements.confidence.overall);
// AI: 95
// Regex: 60

console.log('  AI certifications:', aiResult.requirements.building.certifications);
console.log('  Regex certifications:', regexResult.requirements.building.certifications);
// AI: ['LEED Gold', 'LEED Platinum']
// Regex: ['LEED Gold', 'LEED Platinum'] (simple keyword match, works here)
```

### 5. Fallback Behavior

```typescript
// AI will automatically fallback to regex if:
// - ANTHROPIC_API_KEY not set
// - API request fails
// - API timeout

const result = await extractRequirements(opportunity);

if (result.requirements.extractionMethod === 'regex-fallback') {
  console.warn('Using regex fallback - consider reviewing extraction manually');

  // Log for monitoring
  await logExtractionFallback({
    noticeId: opportunity.noticeId,
    reason: 'AI unavailable'
  });
}
```

## Advanced Usage

### Batch Processing

```typescript
import { extractRequirementsBatch } from '@/lib/ai/extract-requirements';

const opportunities = await fetchGSALeases({ limit: 100 });

const results = await extractRequirementsBatch(opportunities, {
  concurrency: 3,      // Process 3 at a time
  delayMs: 500,        // Rate limiting (2 req/sec)
  useAI: true,         // Try AI first
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total} (${Math.round(current/total * 100)}%)`);
  }
});

// Results is a Map<noticeId, ExtractionResult>
for (const [noticeId, result] of results) {
  console.log(`${noticeId}: ${result.requirements.confidence.overall}% confidence`);
}
```

### Cost Monitoring

```typescript
let totalCost = 0;
let extractionCount = 0;

for (const opportunity of opportunities) {
  const result = await extractRequirements(opportunity);

  if (result.requirements.extractionMethod === 'ai') {
    totalCost += result.cost;
    extractionCount++;
  }
}

console.log(`Total AI cost: $${totalCost.toFixed(2)}`);
console.log(`Average cost/extraction: $${(totalCost / extractionCount).toFixed(4)}`);

// Project monthly cost
const monthlyOpportunities = 500;
const projectedCost = (totalCost / extractionCount) * monthlyOpportunities;
console.log(`Projected monthly cost: $${projectedCost.toFixed(2)}`);
```

### Selective AI (Cost Optimization)

```typescript
// Only use AI for high-value contracts
const contractValueThreshold = 1_000_000; // $1M

async function smartExtract(opportunity: SAMOpportunity) {
  // Estimate contract value from description
  const estimatedValue = estimateContractValue(opportunity);

  if (estimatedValue >= contractValueThreshold) {
    // High-value: Use AI for accuracy
    return await extractRequirements(opportunity, { useAI: true });
  } else {
    // Low-value: Use regex to save costs
    return await extractRequirements(opportunity, { useAI: false });
  }
}
```

## A/B Testing

See `scripts/test-ai-extraction.ts` for complete A/B testing example.

```bash
# Run A/B test
npx tsx scripts/test-ai-extraction.ts
```

## Integration with Existing Code

### Before (Regex)

```typescript
// Old code in lib/scoring/calculate-opportunity-matches.ts
import { parseOpportunityRequirements } from '@/lib/scoring/parse-opportunity';

const requirements = parseOpportunityRequirements(opportunity);
const score = calculateScore(property, requirements);
```

### After (AI with Fallback)

```typescript
// New code
import { extractRequirements } from '@/lib/ai/extract-requirements';

const result = await extractRequirements(opportunity);
const requirements = result.requirements;
const score = calculateScore(property, requirements);

// Optional: Log low-confidence extractions for review
if (result.requirements.confidence.overall < 70) {
  console.warn(`Low confidence extraction for ${opportunity.noticeId}`);
}
```

## Monitoring Dashboard

Track AI extraction performance in production:

```typescript
interface ExtractionMetrics {
  totalExtractions: number;
  aiExtractions: number;
  regexFallbacks: number;
  avgConfidence: number;
  totalCost: number;
  avgLatency: number;
}

async function getExtractionMetrics(since: Date): Promise<ExtractionMetrics> {
  const logs = await fetchExtractionLogs(since);

  return {
    totalExtractions: logs.length,
    aiExtractions: logs.filter(l => l.method === 'ai').length,
    regexFallbacks: logs.filter(l => l.method === 'regex-fallback').length,
    avgConfidence: average(logs.map(l => l.confidence)),
    totalCost: sum(logs.filter(l => l.method === 'ai').map(l => l.cost)),
    avgLatency: average(logs.map(l => l.latency))
  };
}

// Example output
{
  totalExtractions: 500,
  aiExtractions: 485,      // 97% AI usage
  regexFallbacks: 15,      // 3% fallback
  avgConfidence: 91.5,     // ✅ Above 90% target
  totalCost: 11.70,        // ✅ Under $100/month
  avgLatency: 1250         // 1.25 seconds
}
```

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY is required"

**Solution**: Add API key to `.env.local`

```bash
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

### Issue: All extractions using regex-fallback

**Cause**: API key invalid or API down

**Check**:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hi"}]
  }'
```

### Issue: Costs higher than expected

**Solutions**:
1. Increase cache TTL (reduce re-extractions)
2. Use selective AI (only for high-value opportunities)
3. Batch process during off-peak hours
4. Review prompt token usage (optimize if needed)

### Issue: Accuracy below 90%

**Solutions**:
1. Collect more ground truth samples
2. Refine extraction prompt with examples
3. Add validation rules for extracted values
4. Check if specific fields are consistently wrong

## Next Steps

1. **Run A/B test**: Validate 90% accuracy target
2. **Monitor costs**: Track daily/weekly spend
3. **Collect feedback**: Ask users to verify extractions
4. **Iterate prompt**: Improve based on errors
5. **Optimize**: Implement caching and selective AI

## Related Files

- `lib/ai/extract-requirements.ts` - Main extraction service
- `lib/ai/extraction-ab-test.ts` - A/B testing framework
- `scripts/test-ai-extraction.ts` - Test runner
- `SPRINT_3_AI_EXTRACTION.md` - Complete documentation
