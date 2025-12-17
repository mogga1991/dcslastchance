"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  Bell,
  BellOff,
  X,
  ExternalLink,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";

interface LeaseData {
  building_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  location_code?: string;
  building_rsf?: number;
  vacant_rsf?: number;
  lease_expiration_date?: string;
  lessor_name?: string;
  agency_abbr?: string;
  latitude?: number;
  longitude?: number;
  daysUntilExpiration?: number;
  monthsUntilExpiration?: number;
  urgency?: 'critical' | 'warning' | 'normal';
}

interface ExpiringLeaseDetailPanelProps {
  lease: LeaseData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetAlert?: (lease: LeaseData) => void;
  hasAlert?: boolean;
  onViewOnMap?: (lat: number, lng: number) => void;
}

export function ExpiringLeaseDetailPanel({
  lease,
  open,
  onOpenChange,
  onSetAlert,
  hasAlert = false,
  onViewOnMap
}: ExpiringLeaseDetailPanelProps) {
  if (!lease || !open) return null;

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getUrgencyLabel = (urgency?: string) => {
    switch (urgency) {
      case 'critical':
        return 'CRITICAL - Less than 6 months';
      case 'warning':
        return 'WARNING - 6-12 months';
      default:
        return 'NORMAL - 12+ months';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatSquareFeet = (sf?: number) => {
    if (!sf) return 'N/A';
    return new Intl.NumberFormat('en-US').format(sf);
  };

  return (
    <div className="absolute inset-0 bg-slate-50 z-50 overflow-y-auto">
      {/* Close Button - Fixed Position */}
      <button
        onClick={() => onOpenChange(false)}
        className="fixed top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-w-5xl mx-auto p-6">
        {/* Header with urgency styling */}
        <div className={`${getUrgencyColor(lease.urgency)} -mx-6 -mt-6 px-6 py-5 mb-6`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                  Federal Leased Property
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight pr-8">
                {lease.building_name || lease.address || 'Federal Property'}
              </h1>
              {lease.location_code && (
                <p className="text-sm font-mono mt-2 opacity-90">{lease.location_code}</p>
              )}
            </div>
            {lease.daysUntilExpiration !== null && (
              <Badge className={`${
                lease.urgency === 'critical' ? "bg-red-800 animate-pulse" :
                lease.urgency === 'warning' ? "bg-orange-700" :
                "bg-blue-800"
              } text-white font-bold text-sm px-4 py-2`}>
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                {lease.daysUntilExpiration} DAYS LEFT
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Urgency Alert */}
          <div className={`border-2 rounded-lg p-5 ${
            lease.urgency === 'critical' ? 'bg-red-50 border-red-300' :
            lease.urgency === 'warning' ? 'bg-orange-50 border-orange-300' :
            'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-5 w-5 ${
                lease.urgency === 'critical' ? 'text-red-700' :
                lease.urgency === 'warning' ? 'text-orange-700' :
                'text-blue-700'
              }`} />
              <span className={`font-bold uppercase text-sm ${
                lease.urgency === 'critical' ? 'text-red-900' :
                lease.urgency === 'warning' ? 'text-orange-900' :
                'text-blue-900'
              }`}>
                {getUrgencyLabel(lease.urgency)}
              </span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Property Details</h3>
            </div>
            <div className="p-6 grid grid-cols-3 gap-6">
              {/* Location */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Location</span>
                </div>
                <p className="font-semibold text-slate-900 text-sm">
                  {lease.address && <>{lease.address}<br /></>}
                  {lease.city}, {lease.state} {lease.zipcode}
                </p>
              </div>

              {/* Total RSF */}
              {lease.building_rsf && (
                <div className="bg-blue-50 -m-2 p-4 rounded border-2 border-blue-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Building2 className="h-4 w-4 text-blue-700" />
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total RSF</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{formatSquareFeet(lease.building_rsf)}</p>
                </div>
              )}

              {/* Vacant RSF */}
              {lease.vacant_rsf && lease.vacant_rsf > 0 && (
                <div className="bg-amber-50 -m-2 p-4 rounded border-2 border-amber-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-4 w-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Vacant RSF</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">{formatSquareFeet(lease.vacant_rsf)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lease Expiration - Full Width Prominent */}
          <div className={`border-2 rounded-lg p-5 ${
            lease.urgency === 'critical' ? 'bg-red-100 border-red-300' :
            lease.urgency === 'warning' ? 'bg-orange-100 border-orange-300' :
            'bg-slate-100 border-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-slate-700" />
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Lease Expiration Date</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{formatDate(lease.lease_expiration_date)}</p>
              </div>
              {lease.daysUntilExpiration !== null && (
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-1">Time Remaining</p>
                  <Badge className={`${
                    lease.urgency === 'critical' ? "bg-red-600" :
                    lease.urgency === 'warning' ? "bg-orange-500" :
                    "bg-slate-600"
                  } text-white font-bold text-lg px-4 py-2`}>
                    {lease.daysUntilExpiration} DAYS
                  </Badge>
                  {lease.monthsUntilExpiration !== undefined && (
                    <p className="text-xs text-slate-600 mt-1">
                      ({Math.round(lease.monthsUntilExpiration)} months)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Agency & Lessor Info */}
          <div className="grid grid-cols-2 gap-4">
            {lease.agency_abbr && (
              <div className="bg-white border-2 border-slate-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-slate-600" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Agency</h4>
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {lease.agency_abbr}
                </div>
              </div>
            )}

            {lease.lessor_name && (
              <div className="bg-white border-2 border-slate-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-slate-600" />
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Current Lessor</h4>
                </div>
                <div className="text-sm text-slate-700">
                  {lease.lessor_name}
                </div>
              </div>
            )}
          </div>

          {/* Opportunity Highlight */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5">
            <h3 className="font-bold text-green-900 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Leasing Opportunity
            </h3>
            <p className="text-sm text-green-800 mb-4">
              This federal lease is approaching expiration, presenting a potential opportunity for property owners
              and brokers to compete for the next lease term.
            </p>
            {lease.urgency === 'critical' && (
              <div className="bg-red-100 border border-red-300 rounded p-3 text-sm text-red-900">
                <strong>Action Required:</strong> With less than 6 months until expiration, GSA will likely be
                initiating the procurement process soon. Now is the time to prepare your submission.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {lease.latitude && lease.longitude && onViewOnMap && (
              <Button
                onClick={() => onViewOnMap(lease.latitude!, lease.longitude!)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wide"
                size="lg"
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            )}
            {onSetAlert && (
              <Button
                onClick={() => onSetAlert(lease)}
                variant={hasAlert ? "default" : "outline"}
                className={`flex-1 font-bold uppercase tracking-wide ${
                  hasAlert ? "bg-green-600 hover:bg-green-700 text-white" : ""
                }`}
                size="lg"
              >
                {hasAlert ? (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Alert Active
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Set Alert
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
