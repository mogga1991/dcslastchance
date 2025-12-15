"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Bell, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { SAMOpportunity } from "@/lib/sam-gov";
import type { BrokerListing } from "@/types/broker-listing";
import type { IOLPFeatureCollection } from "@/lib/iolp";
import { OpportunityCard } from "./opportunity-card";
import { BrokerListingCard } from "./broker-listing-card";
import { ListingDetailModal } from "./listing-detail-modal";
import { OpportunityDetailModal } from "./opportunity-detail-modal";
import { ExpiringLeaseCard } from "./expiring-lease-card";
import { IOLPFiltersComponent, IOLPFilters } from "./iolp-filters";
import { useExpiringLeases } from "@/lib/hooks/use-iolp";
import { useToast } from "@/hooks/use-toast";

// Dynamically import the map to avoid SSR issues
const GSAMapWithIOLP = dynamic(() => import("./gsa-map-with-iolp"), { ssr: false });

type TabType = "opportunities" | "listings" | "expiring";

export default function GSALeasingClient() {
  const [activeTab, setActiveTab] = useState<TabType>("opportunities");
  const [opportunities, setOpportunities] = useState<SAMOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<SAMOpportunity[]>([]);
  const [brokerListings, setBrokerListings] = useState<BrokerListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<BrokerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<SAMOpportunity | null>(null);
  const [selectedListing, setSelectedListing] = useState<BrokerListing | null>(null);
  const [showIOLPLayer, setShowIOLPLayer] = useState(false);
  const [iolpLoading, setIolpLoading] = useState(false);
  const [showListingDetail, setShowListingDetail] = useState(false);
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false);
  const [detailListing, setDetailListing] = useState<BrokerListing | null>(null);
  const [detailOpportunity, setDetailOpportunity] = useState<SAMOpportunity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [userAlerts, setUserAlerts] = useState<Set<string>>(new Set());

  // IOLP Filters
  const [iolpFilters, setIolpFilters] = useState<IOLPFilters>({
    propertyType: 'all',
    agencies: []
  });

  // Fetch expiring leases
  const { data: expiringLeasesData, isLoading: expiringLoading } = useExpiringLeases(24);

  const { toast } = useToast();

  useEffect(() => {
    fetchOpportunities();
    fetchBrokerListings();
    fetchUserAlerts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      // Filter opportunities
      const filteredOpps = opportunities.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.solicitationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.placeOfPerformance?.city?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.placeOfPerformance?.state?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOpportunities(filteredOpps);

      // Filter listings
      const filteredLstgs = brokerListings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.street_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredListings(filteredLstgs);
    } else {
      setFilteredOpportunities(opportunities);
      setFilteredListings(brokerListings);
    }
  }, [searchTerm, opportunities, brokerListings]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gsa-leasing?limit=100");
      const data = await response.json();

      if (data.opportunitiesData) {
        setOpportunities(data.opportunitiesData || []);
        setFilteredOpportunities(data.opportunitiesData || []);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokerListings = async () => {
    try {
      const response = await fetch("/api/broker-listings?limit=100");
      const data = await response.json();

      if (data.success) {
        setBrokerListings(data.data || []);
        setFilteredListings(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching broker listings:", error);
    }
  };

  const fetchUserAlerts = async () => {
    try {
      const response = await fetch("/api/iolp/alerts");
      const data = await response.json();

      if (data.success) {
        const alertCodes = new Set(data.alerts.map((a: any) => a.location_code));
        setUserAlerts(alertCodes);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleSetAlert = async (lease: any) => {
    try {
      const isAlertSet = userAlerts.has(lease.location_code);

      if (isAlertSet) {
        // Remove alert
        await fetch(`/api/iolp/alerts?location_code=${lease.location_code}`, {
          method: 'DELETE'
        });

        setUserAlerts(prev => {
          const next = new Set(prev);
          next.delete(lease.location_code);
          return next;
        });

        toast({
          title: "Alert removed",
          description: `You will no longer receive notifications for ${lease.building_name || lease.address}`
        });
      } else {
        // Create alert
        await fetch('/api/iolp/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lease)
        });

        setUserAlerts(prev => new Set([...prev, lease.location_code]));

        toast({
          title: "Alert created",
          description: `You'll be notified when this lease is expiring soon`
        });
      }
    } catch (error) {
      console.error("Error managing alert:", error);
      toast({
        title: "Error",
        description: "Failed to manage alert",
        variant: "destructive"
      });
    }
  };

  const handleViewOnMap = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  // Extract unique agencies from expiring leases
  const availableAgencies = useMemo(() => {
    if (!expiringLeasesData?.leases) return [];

    const agencies = new Set<string>();
    expiringLeasesData.leases.forEach((lease: any) => {
      if (lease.agency_abbr) {
        agencies.add(lease.agency_abbr);
      }
    });

    return Array.from(agencies).sort();
  }, [expiringLeasesData]);

  // Filter expiring leases based on filters
  const filteredExpiringLeases = useMemo(() => {
    if (!expiringLeasesData?.leases) return [];

    let filtered = [...expiringLeasesData.leases];

    // Filter by property type
    if (iolpFilters.propertyType === 'leased') {
      filtered = filtered.filter(l => l.owned_or_leased_indicator === 'L');
    } else if (iolpFilters.propertyType === 'owned') {
      filtered = filtered.filter(l => l.owned_or_leased_indicator === 'F');
    }

    // Filter by agencies
    if (iolpFilters.agencies.length > 0) {
      filtered = filtered.filter(l =>
        l.agency_abbr && iolpFilters.agencies.includes(l.agency_abbr)
      );
    }

    // Filter by minimum RSF
    if (iolpFilters.minRSF) {
      filtered = filtered.filter(l =>
        l.building_rsf && l.building_rsf >= iolpFilters.minRSF!
      );
    }

    // Filter by vacancy
    if (iolpFilters.hasVacancy) {
      filtered = filtered.filter(l => l.vacant_rsf && l.vacant_rsf > 0);
    }

    return filtered;
  }, [expiringLeasesData, iolpFilters]);

  // Get urgency counts
  const urgencyCounts = useMemo(() => {
    if (!filteredExpiringLeases) return { critical: 0, warning: 0, normal: 0 };

    return {
      critical: filteredExpiringLeases.filter(l => l.urgency === 'critical').length,
      warning: filteredExpiringLeases.filter(l => l.urgency === 'warning').length,
      normal: filteredExpiringLeases.filter(l => l.urgency === 'normal').length
    };
  }, [filteredExpiringLeases]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel */}
      <div className="w-[380px] bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">GSA Leasing</h1>
            {activeTab === 'expiring' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8"
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide' : 'Filters'}
              </Button>
            )}
          </div>

          {/* Search */}
          {activeTab !== 'expiring' && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          )}

          {/* Federal Footprint Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="iolp-layer" className="text-sm cursor-pointer">
              Federal Footprint
            </Label>
            <div className="flex items-center gap-2">
              {iolpLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
              <Switch
                id="iolp-layer"
                checked={showIOLPLayer}
                onCheckedChange={setShowIOLPLayer}
              />
            </div>
          </div>
        </div>

        {/* Filters (for expiring leases) */}
        {activeTab === 'expiring' && showFilters && (
          <IOLPFiltersComponent
            filters={iolpFilters}
            onChange={setIolpFilters}
            availableAgencies={availableAgencies}
          />
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="opportunities" className="rounded-none text-xs">
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="listings" className="rounded-none text-xs">
              Listings
            </TabsTrigger>
            <TabsTrigger value="expiring" className="rounded-none text-xs relative">
              Expiring
              {urgencyCounts.critical > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {urgencyCounts.critical}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="flex-1 overflow-y-auto m-0 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Loading opportunities...</p>
                </div>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No opportunities found</div>
            ) : (
              <div className="space-y-4">
                {filteredOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.noticeId}
                    opportunity={opp}
                    isSelected={selectedOpportunity?.noticeId === opp.noticeId}
                    onClick={() => setSelectedOpportunity(opp)}
                    onViewDetails={(e) => {
                      e.stopPropagation();
                      setDetailOpportunity(opp);
                      setShowOpportunityDetail(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Available Listings Tab */}
          <TabsContent value="listings" className="flex-1 overflow-y-auto m-0 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Loading listings...</p>
                </div>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No broker listings found</div>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <BrokerListingCard
                    key={listing.id}
                    listing={listing}
                    isSelected={selectedListing?.id === listing.id}
                    onClick={() => setSelectedListing(listing)}
                    onViewDetails={(e) => {
                      e.stopPropagation();
                      setDetailListing(listing);
                      setShowListingDetail(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expiring Leases Tab */}
          <TabsContent value="expiring" className="flex-1 overflow-y-auto m-0 p-4">
            {expiringLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Loading expiring leases...</p>
                </div>
              </div>
            ) : filteredExpiringLeases.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No expiring leases found
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Lease Expiration Summary</h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Critical</p>
                      <p className="text-lg font-bold text-red-600">{urgencyCounts.critical}</p>
                      <p className="text-gray-500">{'<'}6 months</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Warning</p>
                      <p className="text-lg font-bold text-orange-600">{urgencyCounts.warning}</p>
                      <p className="text-gray-500">{'<'}12 months</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Normal</p>
                      <p className="text-lg font-bold text-blue-600">{urgencyCounts.normal}</p>
                      <p className="text-gray-500">12+ months</p>
                    </div>
                  </div>
                </div>

                {/* Lease Cards */}
                <div className="space-y-4">
                  {filteredExpiringLeases.map((lease: any) => (
                    <ExpiringLeaseCard
                      key={lease.location_code || lease.OBJECTID}
                      lease={lease}
                      onViewOnMap={handleViewOnMap}
                      onSetAlert={handleSetAlert}
                      hasAlert={userAlerts.has(lease.location_code)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative">
        <GSAMapWithIOLP
          opportunities={activeTab === "opportunities" ? filteredOpportunities : []}
          listings={activeTab === "listings" ? filteredListings : []}
          selectedOpportunity={selectedOpportunity}
          selectedListing={selectedListing}
          showIOLPLayer={showIOLPLayer}
          onIOLPLoadingChange={setIolpLoading}
        />
      </div>

      {/* Detail Modals */}
      <ListingDetailModal
        listing={detailListing}
        open={showListingDetail}
        onOpenChange={setShowListingDetail}
      />

      <OpportunityDetailModal
        opportunity={detailOpportunity}
        open={showOpportunityDetail}
        onOpenChange={setShowOpportunityDetail}
      />
    </div>
  );
}
