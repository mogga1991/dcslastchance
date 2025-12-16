"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building2, AlertTriangle, Bell, BellOff } from "lucide-react";
import { useState } from "react";

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

interface ExpiringLeaseCardProps {
  lease: LeaseData;
  onViewOnMap?: (lat: number, lng: number) => void;
  onSetAlert?: (lease: LeaseData) => void;
  hasAlert?: boolean;
}

export function ExpiringLeaseCard({
  lease,
  onViewOnMap,
  onSetAlert,
  hasAlert = false
}: ExpiringLeaseCardProps) {
  const [alertSet, setAlertSet] = useState(hasAlert);

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getUrgencyLabel = (urgency?: string) => {
    switch (urgency) {
      case 'critical':
        return '< 6 months';
      case 'warning':
        return '6-12 months';
      default:
        return '12+ months';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSetAlert = () => {
    setAlertSet(!alertSet);
    onSetAlert?.(lease);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">
              {lease.building_name || lease.address || 'Federal Leased Property'}
            </h3>
            {lease.location_code && (
              <p className="text-xs text-gray-500 font-mono">
                {lease.location_code}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`ml-2 text-xs ${getUrgencyColor(lease.urgency)}`}
          >
            {getUrgencyLabel(lease.urgency)}
          </Badge>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600">
            {lease.address && <span>{lease.address}<br /></span>}
            {lease.city}, {lease.state} {lease.zipcode}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 mb-3 text-xs">
          {/* Expiration Date */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-orange-500" />
            <div>
              <p className="text-gray-500">Expires</p>
              <p className="font-semibold text-gray-900">
                {formatDate(lease.lease_expiration_date)}
              </p>
            </div>
          </div>

          {/* Days Until Expiration */}
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <div>
              <p className="text-gray-500">Time Left</p>
              <p className="font-semibold text-gray-900">
                {lease.daysUntilExpiration !== null
                  ? `${lease.daysUntilExpiration} days`
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          {/* RSF */}
          {lease.building_rsf && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-500" />
              <div>
                <p className="text-gray-500">Total RSF</p>
                <p className="font-semibold text-gray-900">
                  {lease.building_rsf.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Agency */}
          {lease.agency_abbr && (
            <div>
              <p className="text-gray-500">Agency</p>
              <p className="font-semibold text-gray-900">
                {lease.agency_abbr}
              </p>
            </div>
          )}
        </div>

        {/* Lessor */}
        {lease.lessor_name && (
          <div className="mb-3 pb-3 border-b">
            <p className="text-xs text-gray-500">Current Lessor</p>
            <p className="text-xs font-medium text-gray-700">
              {lease.lessor_name}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {lease.latitude && lease.longitude && onViewOnMap && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-10 sm:h-9"
              onClick={() => onViewOnMap(lease.latitude!, lease.longitude!)}
            >
              <MapPin className="h-3 w-3 mr-1" />
              View on Map
            </Button>
          )}
          {onSetAlert && (
            <Button
              variant={alertSet ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs h-10 sm:h-9"
              onClick={handleSetAlert}
            >
              {alertSet ? (
                <>
                  <Bell className="h-3 w-3 mr-1" />
                  Alert Set
                </>
              ) : (
                <>
                  <BellOff className="h-3 w-3 mr-1" />
                  Set Alert
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
