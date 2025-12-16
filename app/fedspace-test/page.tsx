"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FedSpaceTestPage() {
  const [loading, setLoading] = useState(false);
  const [federalScoreResult, setFederalScoreResult] = useState<any>(null);
  const [matchScoreResult, setMatchScoreResult] = useState<any>(null);
  const [analyticsResult, setAnalyticsResult] = useState<any>(null);

  // Test Federal Neighborhood Score
  const testFederalScore = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        '/api/fedspace/neighborhood-score?lat=38.9072&lng=-77.0369&radius=5'
      );
      const data = await response.json();
      setFederalScoreResult(data);
    } catch (error) {
      console.error('Error:', error);
      setFederalScoreResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  // Test Analytics
  const testAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fedspace/analytics?type=all');
      const data = await response.json();
      setAnalyticsResult(data);
    } catch (error) {
      console.error('Error:', error);
      setAnalyticsResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">FedSpace Patent-Pending Algorithms Test</h1>
        <p className="text-gray-600">
          Test the deployed Federal Neighborhood Score and Property-Opportunity Matching algorithms.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Federal Score Test */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            PATENT #1: Federal Neighborhood Score
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            6-factor weighted algorithm with R-Tree spatial indexing
          </p>
          <Button
            onClick={testFederalScore}
            disabled={loading}
            className="w-full mb-4"
          >
            {loading ? 'Testing...' : 'Test Washington DC Score'}
          </Button>

          {federalScoreResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Results:</h3>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(federalScoreResult, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        {/* Analytics Test */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Performance monitoring and insights
          </p>
          <Button
            onClick={testAnalytics}
            disabled={loading}
            className="w-full mb-4"
          >
            {loading ? 'Loading...' : 'Load Analytics'}
          </Button>

          {analyticsResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Results:</h3>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(analyticsResult, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>

      {/* API Endpoints Reference */}
      <Card className="p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4">Available API Endpoints</h2>
        <div className="space-y-2 text-sm font-mono">
          <div className="p-3 bg-blue-50 rounded">
            <strong className="text-blue-700">GET</strong> /api/fedspace/neighborhood-score
            <p className="text-xs text-gray-600 mt-1">
              Calculate federal neighborhood score for a location
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <strong className="text-green-700">POST</strong> /api/fedspace/property-match
            <p className="text-xs text-gray-600 mt-1">
              Calculate property-opportunity match with early-termination pipeline
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <strong className="text-purple-700">GET</strong> /api/fedspace/analytics
            <p className="text-xs text-gray-600 mt-1">
              Get performance analytics and insights
            </p>
          </div>
        </div>
      </Card>

      {/* Algorithm Details */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-3">PATENT #1 Features</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ 6-factor weighted scoring (0-100)</li>
            <li>✅ R-Tree spatial indexing (O(log n))</li>
            <li>✅ 24-hour caching with TTL</li>
            <li>✅ Batch processing support</li>
            <li>✅ Grade assignment (A+ to F)</li>
          </ul>
          <div className="mt-4 text-xs text-gray-600">
            <strong>Factors:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Density (25%)</li>
              <li>• Lease Activity (25%)</li>
              <li>• Expiring Leases (20%)</li>
              <li>• Demand (15%)</li>
              <li>• Vacancy (10%)</li>
              <li>• Growth (5%)</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-3">PATENT #2 Features</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ Early-termination pipeline (73% reduction)</li>
            <li>✅ 5-factor weighted matching</li>
            <li>✅ Constraint checking ordered by disqualification rate</li>
            <li>✅ Qualification & competitiveness scoring</li>
            <li>✅ Actionable recommendations</li>
          </ul>
          <div className="mt-4 text-xs text-gray-600">
            <strong>Factors:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Location (30%)</li>
              <li>• Space (25%)</li>
              <li>• Building (20%)</li>
              <li>• Timeline (15%)</li>
              <li>• Experience (10%)</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
