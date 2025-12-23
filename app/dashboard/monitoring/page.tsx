/**
 * Performance Monitoring Dashboard
 *
 * Displays real-time system metrics:
 * - System health status
 * - AI extraction costs and accuracy
 * - Cache cleanup performance
 * - API response times
 * - Error rates
 * - Database performance
 *
 * Auto-refreshes every 30 seconds
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, AlertCircle, XCircle, Activity, Database, Cloud, Zap } from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      details: {
        connected: boolean;
        queryTime: number;
        version?: string;
        error?: string;
      };
    };
    apis: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      responseTime: number;
      details?: {
        samGov: { status: string; responseTime: number; error?: string };
        claude: { status: string; responseTime: number; error?: string };
      };
      error?: string;
    };
    cache: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      details: {
        lastCleanup: string | null;
        staleRecords: number;
        cleanupOverdue: boolean;
        error?: string;
      };
    };
  };
}

interface AIMetrics {
  totalExtractions: number;
  totalCost: number;
  avgCostPerExtraction: number;
  avgConfidence: number;
  successRate: number;
  fallbackRate: number;
}

interface CacheMetrics {
  staleRecords: number;
  lastCleanupTime: string | null;
  cleanupOverdue: boolean;
  avgExecutionTime: number;
}

export default function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [aiMetrics, setAIMetrics] = useState<AIMetrics | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    }
  };

  const fetchAIMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/ai-metrics');
      const data = await response.json();
      setAIMetrics(data);
    } catch (error) {
      console.error('Failed to fetch AI metrics:', error);
      // Set default values on error
      setAIMetrics({
        totalExtractions: 0,
        totalCost: 0,
        avgCostPerExtraction: 0,
        avgConfidence: 0,
        successRate: 0,
        fallbackRate: 0,
      });
    }
  };

  const fetchCacheMetrics = async () => {
    try {
      const response = await fetch('/api/health/cache');
      const data = await response.json();
      setCacheMetrics({
        staleRecords: data.details.staleRecords,
        lastCleanupTime: data.details.lastCleanup,
        cleanupOverdue: data.details.cleanupOverdue,
        avgExecutionTime: data.responseTime,
      });
    } catch (error) {
      console.error('Failed to fetch cache metrics:', error);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchHealthStatus(), fetchAIMetrics(), fetchCacheMetrics()]);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();

    if (autoRefresh) {
      const interval = setInterval(refreshAll, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(cost);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Performance Monitoring</h1>
          <p className="text-gray-600">
            Real-time system metrics and health status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Overall System Status */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Overall System Status
              </CardTitle>
              <CardDescription>
                {health?.environment} environment - Version {health?.version}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={health ? getStatusColor(health.status) : ''}
            >
              <div className="flex items-center gap-2">
                {health && getStatusIcon(health.status)}
                {health?.status.toUpperCase() || 'UNKNOWN'}
              </div>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Database Status */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">Database</h3>
                </div>
                {health && getStatusIcon(health.checks.database.status)}
              </div>
              <div className="text-sm space-y-1">
                <p className="text-gray-600">
                  Response: {health && formatResponseTime(health.checks.database.responseTime)}
                </p>
                <p className="text-gray-600">
                  Version: {health?.checks.database.details.version || 'Unknown'}
                </p>
                {health?.checks.database.details.error && (
                  <p className="text-red-600 text-xs">{health.checks.database.details.error}</p>
                )}
              </div>
            </div>

            {/* External APIs Status */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">External APIs</h3>
                </div>
                {health && getStatusIcon(health.checks.apis.status)}
              </div>
              <div className="text-sm space-y-1">
                <p className="text-gray-600">
                  Response: {health && formatResponseTime(health.checks.apis.responseTime)}
                </p>
                {health?.checks.apis.details && (
                  <>
                    <p className="text-xs">
                      SAM.gov: {health.checks.apis.details.samGov.status}
                      {health.checks.apis.details.samGov.error && ` (${health.checks.apis.details.samGov.error})`}
                    </p>
                    <p className="text-xs">
                      Claude: {health.checks.apis.details.claude.status}
                      {health.checks.apis.details.claude.error && ` (${health.checks.apis.details.claude.error})`}
                    </p>
                  </>
                )}
                {health?.checks.apis.error && (
                  <p className="text-red-600 text-xs">{health.checks.apis.error}</p>
                )}
              </div>
            </div>

            {/* Cache Status */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">Cache Cleanup</h3>
                </div>
                {health && getStatusIcon(health.checks.cache.status)}
              </div>
              <div className="text-sm space-y-1">
                <p className="text-gray-600">
                  Stale: {health?.checks.cache.details.staleRecords.toLocaleString() || 0} records
                </p>
                <p className="text-gray-600">
                  Cleanup: {health?.checks.cache.details.cleanupOverdue ? 'Overdue' : 'On Schedule'}
                </p>
                {health?.checks.cache.details.error && (
                  <p className="text-red-600 text-xs">{health.checks.cache.details.error}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Extraction Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>AI Extraction Metrics</CardTitle>
            <CardDescription>Claude Sonnet API usage and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Extractions</span>
                <span className="text-2xl font-bold">{aiMetrics?.totalExtractions.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Cost</span>
                <span className="text-2xl font-bold">{aiMetrics ? formatCost(aiMetrics.totalCost) : '$0.0000'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Cost/Extraction</span>
                <span className="text-lg font-semibold">{aiMetrics ? formatCost(aiMetrics.avgCostPerExtraction) : '$0.0000'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Confidence</span>
                <span className="text-lg font-semibold">{aiMetrics?.avgConfidence.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-lg font-semibold">{aiMetrics?.successRate.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fallback Rate</span>
                <span className="text-lg font-semibold">{aiMetrics?.fallbackRate.toFixed(1) || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cache Cleanup Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Cache Cleanup Metrics</CardTitle>
            <CardDescription>Automated cleanup job performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stale Records</span>
                <span className="text-2xl font-bold">{cacheMetrics?.staleRecords.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Cleanup</span>
                <span className="text-lg font-semibold">
                  {cacheMetrics?.lastCleanupTime
                    ? new Date(cacheMetrics.lastCleanupTime).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cleanup Status</span>
                <Badge variant={cacheMetrics?.cleanupOverdue ? 'destructive' : 'default'}>
                  {cacheMetrics?.cleanupOverdue ? 'Overdue' : 'On Schedule'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Execution Time</span>
                <span className="text-lg font-semibold">
                  {cacheMetrics && formatResponseTime(cacheMetrics.avgExecutionTime)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Deployment and runtime details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Environment</p>
              <p className="font-semibold">{health?.environment || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Version</p>
              <p className="font-semibold font-mono">{health?.version || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Timestamp</p>
              <p className="font-semibold">
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Auto-Refresh</p>
              <p className="font-semibold">{autoRefresh ? 'Enabled (30s)' : 'Disabled'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
