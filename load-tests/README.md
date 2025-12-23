# k6 Load Tests

## Overview

This directory contains k6 load testing scripts for the FedSpace API.

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Windows (using Chocolatey)
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Or download from: https://k6.io/docs/getting-started/installation/
```

## Running Tests

### Local Development

```bash
# Run against local dev server (default)
k6 run match-properties.js

# Specify custom URL
k6 run match-properties.js -e API_URL=http://localhost:3002
```

### Staging Environment

```bash
k6 run match-properties.js \
  -e API_URL=https://staging.fedspace.ai \
  -e API_TOKEN=your-staging-token
```

### Production (Use with Caution!)

```bash
# Only run during planned load testing windows
k6 run match-properties.js \
  -e API_URL=https://fedspace.ai \
  -e API_TOKEN=your-production-token
```

### k6 Cloud (Recommended)

```bash
# Sign up for free at https://app.k6.io/
k6 login cloud

# Run test in k6 Cloud for detailed metrics
k6 cloud match-properties.js -e API_URL=https://staging.fedspace.ai
```

## Test Scenarios

The load test simulates realistic traffic patterns:

| Stage | Duration | Users | Description |
|-------|----------|-------|-------------|
| Warm Up | 30s | 2 | Initialize connections |
| Ramp Up | 1m | 5 | Gradual load increase |
| Stress | 2m | 10 | Sustained normal load |
| Peak | 1m | 15 | Maximum expected load |
| Scale Down | 1m | 10 | Recovery verification |
| Cool Down | 30s | 0 | Cleanup |

**Total Duration:** ~6 minutes

## Performance Thresholds

Tests will fail if:

- P95 response time > 5 seconds
- P99 response time > 8 seconds
- HTTP failure rate > 1%
- Error rate > 5%
- Match duration P95 > 4 seconds

## Custom Metrics

- `errorRate`: Percentage of failed requests
- `matchDuration`: Time to complete property matching
- `matchesFound`: Average matches discovered per request
- `earlyTerminations`: Early termination optimization count

## Test Endpoints

1. **Health Check** (`/api/health`)
   - Validates API availability
   - Expected: < 500ms

2. **Match Properties** (`/api/match-properties`)
   - Primary workload
   - POST with minScore=40, chunkSize=50
   - Expected: < 5s P95

3. **Query Matches** (`/api/property-matches`)
   - Database read performance
   - Expected: < 1s

## Environment Variables

- `API_URL`: Base URL (default: `http://localhost:3002`)
- `API_TOKEN`: Authentication token (optional for local)

## Output Metrics

After running, you'll see metrics like:

```
checks.........................: 100.00% ✓ 1234  ✗ 0
data_received..................: 125 MB  21 MB/s
data_sent......................: 12 MB   2.0 MB/s
http_req_duration..............: avg=2.5s  min=1.2s med=2.3s max=7.8s p(90)=3.9s p(95)=4.5s
http_req_failed................: 0.00%   ✓ 0     ✗ 1234
iterations.....................: 1234    205/s
vus............................: 15      min=0   max=15
vus_max........................: 15      min=15  max=15
```

## Troubleshooting

### Connection Refused

```bash
# Check if server is running
curl http://localhost:3002/api/health

# Verify URL is correct
k6 run match-properties.js -e API_URL=http://localhost:3002
```

### Authentication Errors

```bash
# Ensure API_TOKEN is set
k6 run match-properties.js -e API_TOKEN=your-token

# Or omit for local testing without auth
k6 run match-properties.js
```

### Timeout Errors

```bash
# Increase timeout (default: 30s)
# Edit match-properties.js and adjust:
# timeout: '60s'
```

## Best Practices

1. **Never run load tests against production without planning**
   - Coordinate with team
   - Schedule during off-peak hours
   - Monitor server metrics

2. **Start with staging**
   - Verify tests work correctly
   - Validate thresholds
   - Check for errors

3. **Monitor server resources**
   - CPU usage
   - Memory consumption
   - Database connections
   - Network bandwidth

4. **Use k6 Cloud for detailed insights**
   - Distributed load generation
   - Geographic distribution
   - Detailed metrics and visualizations

## Related Documentation

- Main documentation: `../LOAD_TESTING.md`
- k6 Documentation: https://k6.io/docs/
- Performance benchmarks: `../lib/scoring/__tests__/performance.bench.test.ts`

## Support

For issues or questions:
- Open an issue on GitHub
- Contact the performance testing team
- Review k6 documentation

---

*Last Updated: December 2024*
