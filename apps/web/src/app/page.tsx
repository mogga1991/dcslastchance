'use client';

// ============================================================================
// Dashboard Page
// ============================================================================

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/lib/auth-context';
import { Target, Archive, FileText, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Active Opportunities',
      value: '0',
      icon: Target,
      color: 'bg-blue-500',
    },
    {
      name: 'Capability Documents',
      value: '0',
      icon: Archive,
      color: 'bg-green-500',
    },
    {
      name: 'Active Proposals',
      value: '0',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      name: 'Avg Bid Score',
      value: '-',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your opportunities today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white rounded-lg shadow p-6 border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className={`${stat.color} rounded-lg p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Target className="h-5 w-5 mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Add Opportunity
                </span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Archive className="h-5 w-5 mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Upload Capability Doc
                </span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Create Proposal
                </span>
              </button>
            </div>
          </div>

          {/* Sprint 1 Complete Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🎉 Sprint 1 Complete!
            </h3>
            <p className="text-sm text-green-800">
              Foundation is ready: Auth, RBAC, Capability Evidence Locker tables, and
              Bid/No-Bid scoring schema are all in place.
            </p>
            <p className="text-sm text-green-800 mt-2">
              Next steps: Sprint 2 (Opportunities), Sprint 3 (Documents), Sprint 4
              (Extraction), Sprint 5 (Compliance Matrix), Sprint 5.5 (Capability
              Evidence + Bid/No-Bid UI)
            </p>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
