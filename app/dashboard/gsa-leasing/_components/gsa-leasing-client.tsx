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
import { ExpressInterestModal } from "./express-interest-modal";
import { ExpiringLeaseCard } from "./expiring-lease-card";
import { IOLPFiltersComponent, IOLPFilters } from "./iolp-filters";
import { OpportunityFiltersComponent, OpportunityFilters } from "./opportunity-filters";
import { FederalScoreCard } from "./federal-score-card";
import { useExpiringLeases } from "@/lib/hooks/use-iolp";
import { useToast } from "@/hooks/use-toast";
import { calculateAllOpportunityMatches } from "@/lib/scoring/calculate-opportunity-matches";
import type { MatchScoreResult } from "@/lib/scoring/types";

// Dynamically import the map to avoid SSR issues
const GSAMapWithIOLP = dynamic(() => import("./gsa-map-with-iolp"), { ssr: false });

type TabType = "opportunities" | "listings" | "expiring";

interface GSALeasingClientProps {
  userEmail?: string;
}

export default function GSALeasingClient({ userEmail }: GSALeasingClientProps) {
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
  const [showExpressInterest, setShowExpressInterest] = useState(false);
  const [expressInterestOpportunity, setExpressInterestOpportunity] = useState<SAMOpportunity | null>(null);
  const [submittedInquiries, setSubmittedInquiries] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [currentViewport, setCurrentViewport] = useState<{ lat: number; lng: number } | null>(null);
  const [userAlerts, setUserAlerts] = useState<Set<string>>(new Set());
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [iolpError, setIolpError] = useState<string | null>(null);
  const [iolpCount, setIolpCount] = useState<number>(0);

  // IOLP Filters
  const [iolpFilters, setIolpFilters] = useState<IOLPFilters>({
    propertyType: 'all',
    agencies: [],
    states: [],
    timeframe: 24,
    sortBy: 'expiration',
    urgencyFilter: undefined
  });

  // Opportunity Filters
  const [opportunityFilters, setOpportunityFilters] = useState<OpportunityFilters>({
    states: [],
    postedWithin: 'all',
    setAsideTypes: [],
    sortBy: 'newest',
    onlyMatches: undefined
  });

  // Saved opportunities
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());

  // Fetch expiring leases (using timeframe from filters)
  const { data: expiringLeasesData, isLoading: expiringLoading } = useExpiringLeases(iolpFilters.timeframe);

  const { toast } = useToast();

  useEffect(() => {
    fetchOpportunities();
    fetchBrokerListings();
    fetchUserAlerts();
    fetchSavedOpportunities();
    fetchSubmittedInquiries();
  }, []);

  // Filter listings based on search term
  useEffect(() => {
    if (searchTerm) {
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
      setFilteredListings(brokerListings);
    }
  }, [searchTerm, brokerListings]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setOpportunitiesError(null);

      const response = await fetch("/api/gsa-leasing?limit=100");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.opportunitiesData) {
        setOpportunities(data.opportunitiesData || []);
        setFilteredOpportunities(data.opportunitiesData || []);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to load opportunities. Please try again.";
      setOpportunitiesError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokerListings = async () => {
    try {
      setListingsError(null);

      const response = await fetch("/api/broker-listings?limit=100");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setBrokerListings(data.data || []);
        setFilteredListings(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching broker listings:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to load listings. Please try again.";
      setListingsError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
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

  const fetchSavedOpportunities = async () => {
    try {
      const response = await fetch("/api/saved-opportunities");

      if (!response.ok) {
        // If unauthorized, just skip (user not logged in)
        if (response.status === 401) return;
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const savedIds = new Set(data.map((s: any) => s.notice_id));
      setSavedOpportunities(savedIds);
    } catch (error) {
      console.error("Error fetching saved opportunities:", error);
    }
  };

  const fetchSubmittedInquiries = async () => {
    try {
      const response = await fetch("/api/opportunity-inquiries");

      if (!response.ok) {
        // If unauthorized, just skip (user not logged in)
        if (response.status === 401) return;
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const inquiryIds = new Set(data.inquiries?.map((i: any) => i.opportunity_id) || []);
      setSubmittedInquiries(inquiryIds);
    } catch (error) {
      console.error("Error fetching submitted inquiries:", error);
    }
  };

  const handleSaveOpportunity = async (opportunity: SAMOpportunity) => {
    try {
      const isSaved = savedOpportunities.has(opportunity.noticeId);

      if (isSaved) {
        // Unsave
        await fetch(`/api/saved-opportunities/${opportunity.noticeId}`, {
          method: 'DELETE'
        });

        setSavedOpportunities(prev => {
          const next = new Set(prev);
          next.delete(opportunity.noticeId);
          return next;
        });

        toast({
          title: "Opportunity unsaved",
          description: "Removed from your saved opportunities"
        });
      } else {
        // Save
        await fetch('/api/saved-opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notice_id: opportunity.noticeId,
            opportunity_data: opportunity
          })
        });

        setSavedOpportunities(prev => new Set([...prev, opportunity.noticeId]));

        toast({
          title: "Opportunity saved",
          description: "Added to your saved opportunities"
        });
      }
    } catch (error) {
      console.error("Error managing saved opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to save opportunity",
        variant: "destructive"
      });
    }
  };

  const handleExpressInterest = (opportunity: SAMOpportunity) => {
    setExpressInterestOpportunity(opportunity);
    setShowExpressInterest(true);
  };

  const handleInquirySubmitted = (opportunityId: string) => {
    setSubmittedInquiries(prev => {
      const next = new Set(prev);
      next.add(opportunityId);
      return next;
    });
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

  // Extract unique states and set-aside types from opportunities
  const availableOpportunityStates = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return [];

    const states = new Set<string>();
    opportunities.forEach(opp => {
      const stateCode = opp.placeOfPerformance?.state?.code;
      if (stateCode) {
        states.add(stateCode);
      }
    });

    return Array.from(states).sort();
  }, [opportunities]);

  const availableSetAsides = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return [];

    const setAsides = new Set<string>();
    opportunities.forEach(opp => {
      if (opp.typeOfSetAsideDescription && opp.typeOfSetAsideDescription !== 'None') {
        setAsides.add(opp.typeOfSetAsideDescription);
      }
    });

    return Array.from(setAsides).sort();
  }, [opportunities]);

  // Calculate match scores when broker listings are available
  const opportunityMatchScores = useMemo(() => {
    if (brokerListings.length === 0 || opportunities.length === 0) {
      return new Map<string, MatchScoreResult>();
    }
    return calculateAllOpportunityMatches(opportunities, brokerListings);
  }, [opportunities, brokerListings]);

  // Filter and sort opportunities
  const filteredAndSortedOpportunities = useMemo(() => {
    if (!opportunities || opportunities.length === 0) {
      return [];
    }

    let filtered = [...opportunities];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.solicitationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.placeOfPerformance?.city?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.placeOfPerformance?.state?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by states
    if (opportunityFilters.states.length > 0) {
      filtered = filtered.filter(opp =>
        opp.placeOfPerformance?.state?.code &&
        opportunityFilters.states.includes(opp.placeOfPerformance.state.code)
      );
    }

    // Filter by posted date
    if (opportunityFilters.postedWithin !== 'all') {
      const daysAgo = parseInt(opportunityFilters.postedWithin);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      filtered = filtered.filter(opp => {
        if (!opp.postedDate) return false;
        const postedDate = new Date(opp.postedDate);
        return postedDate >= cutoffDate;
      });
    }

    // Filter by set-aside type
    if (opportunityFilters.setAsideTypes.length > 0) {
      filtered = filtered.filter(opp =>
        opp.typeOfSetAsideDescription &&
        opportunityFilters.setAsideTypes.includes(opp.typeOfSetAsideDescription)
      );
    }

    // Filter by RSF range
    if (opportunityFilters.minRSF || opportunityFilters.maxRSF) {
      filtered = filtered.filter(opp => {
        const text = `${opp.title} ${opp.description}`.toLowerCase();
        const rsfMatch = text.match(/(\d{1,3}(?:,\d{3})*)\s*(?:rsf|sf|square\s+feet)/i);
        if (!rsfMatch) return true; // Include if RSF not found

        const rsf = parseInt(rsfMatch[1].replace(/,/g, ''));
        if (opportunityFilters.minRSF && rsf < opportunityFilters.minRSF) return false;
        if (opportunityFilters.maxRSF && rsf > opportunityFilters.maxRSF) return false;
        return true;
      });
    }

    // Filter by match score (only show 70%+ matches)
    if (opportunityFilters.onlyMatches && opportunityMatchScores.size > 0) {
      filtered = filtered.filter(opp => {
        const matchScore = opportunityMatchScores.get(opp.noticeId);
        return matchScore && matchScore.overallScore >= 70;
      });
    }

    // Sort
    switch (opportunityFilters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const aDate = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          const bDate = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'deadline':
        filtered.sort((a, b) => {
          const aDate = a.responseDeadLine ? new Date(a.responseDeadLine).getTime() : Infinity;
          const bDate = b.responseDeadLine ? new Date(b.responseDeadLine).getTime() : Infinity;
          return aDate - bDate;
        });
        break;
      case 'bestMatch':
        if (opportunityMatchScores.size > 0) {
          filtered.sort((a, b) => {
            const aScore = opportunityMatchScores.get(a.noticeId)?.overallScore || 0;
            const bScore = opportunityMatchScores.get(b.noticeId)?.overallScore || 0;
            return bScore - aScore;
          });
        }
        break;
      case 'rsf':
        filtered.sort((a, b) => {
          const aText = `${a.title} ${a.description}`.toLowerCase();
          const bText = `${b.title} ${b.description}`.toLowerCase();
          const aMatch = aText.match(/(\d{1,3}(?:,\d{3})*)\s*(?:rsf|sf|square\s+feet)/i);
          const bMatch = bText.match(/(\d{1,3}(?:,\d{3})*)\s*(?:rsf|sf|square\s+feet)/i);
          const aRsf = aMatch ? parseInt(aMatch[1].replace(/,/g, '')) : 0;
          const bRsf = bMatch ? parseInt(bMatch[1].replace(/,/g, '')) : 0;
          return bRsf - aRsf; // Largest first
        });
        break;
    }

    return filtered;
  }, [opportunities, searchTerm, opportunityFilters, opportunityMatchScores]);

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

  // Extract unique states from expiring leases
  const availableStates = useMemo(() => {
    if (!expiringLeasesData?.leases) return [];

    const states = new Set<string>();
    expiringLeasesData.leases.forEach((lease: any) => {
      if (lease.state) {
        states.add(lease.state);
      }
    });

    return Array.from(states).sort();
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

    // Filter by states
    if (iolpFilters.states.length > 0) {
      filtered = filtered.filter(l =>
        l.state && iolpFilters.states.includes(l.state)
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

    // Filter by urgency
    if (iolpFilters.urgencyFilter) {
      filtered = filtered.filter(l => l.urgency === iolpFilters.urgencyFilter);
    }

    // Sort
    switch (iolpFilters.sortBy) {
      case 'expiration':
        // Sort by soonest expiration
        filtered.sort((a, b) => {
          const aDate = a.daysUntilExpiration ?? Infinity;
          const bDate = b.daysUntilExpiration ?? Infinity;
          return aDate - bDate;
        });
        break;
      case 'rsf':
        // Sort by largest RSF
        filtered.sort((a, b) => {
          const aRsf = a.building_rsf ?? 0;
          const bRsf = b.building_rsf ?? 0;
          return bRsf - aRsf;
        });
        break;
      case 'recent':
        // Sort by most recently added (using OBJECTID as proxy)
        filtered.sort((a, b) => {
          const aId = a.OBJECTID ?? 0;
          const bId = b.OBJECTID ?? 0;
          return bId - aId;
        });
        break;
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel */}
      <div className="w-full md:w-[380px] bg-white border-r md:border-b-0 border-b flex flex-col max-h-[50vh] md:max-h-none">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">GSA Leasing</h1>
            {(activeTab === 'opportunities' || activeTab === 'expiring') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 relative"
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide' : 'Filters'}
                {activeTab === 'expiring' && (iolpFilters.urgencyFilter || iolpFilters.states.length > 0 || iolpFilters.agencies.length > 0 || iolpFilters.minRSF || iolpFilters.hasVacancy || iolpFilters.timeframe !== 24 || iolpFilters.sortBy !== 'expiration') && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                    {[
                      iolpFilters.urgencyFilter ? 1 : 0,
                      iolpFilters.states.length,
                      iolpFilters.agencies.length,
                      iolpFilters.minRSF ? 1 : 0,
                      iolpFilters.hasVacancy ? 1 : 0,
                      iolpFilters.timeframe !== 24 ? 1 : 0,
                      iolpFilters.sortBy !== 'expiration' ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
                {activeTab === 'opportunities' && (opportunityFilters.states.length > 0 || opportunityFilters.postedWithin !== 'all' || opportunityFilters.setAsideTypes.length > 0 || opportunityFilters.minRSF || opportunityFilters.maxRSF || opportunityFilters.onlyMatches || opportunityFilters.sortBy !== 'newest') && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                    {[
                      opportunityFilters.states.length,
                      opportunityFilters.postedWithin !== 'all' ? 1 : 0,
                      opportunityFilters.setAsideTypes.length,
                      opportunityFilters.minRSF ? 1 : 0,
                      opportunityFilters.maxRSF ? 1 : 0,
                      opportunityFilters.onlyMatches ? 1 : 0,
                      opportunityFilters.sortBy !== 'newest' ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
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
          <div className="space-y-2">
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

            {/* Feedback text */}
            {showIOLPLayer && (
              <div className="text-xs">
                {iolpLoading ? (
                  <p className="text-blue-600 animate-pulse">Loading federal properties...</p>
                ) : iolpError ? (
                  <p className="text-red-600">{iolpError}</p>
                ) : iolpCount > 0 ? (
                  <p className="text-green-600">Showing {iolpCount.toLocaleString()} federal properties</p>
                ) : (
                  <p className="text-gray-500">No properties in current view</p>
                )}
              </div>
            )}

            {/* Legend (when layer is active) */}
            {showIOLPLayer && !iolpLoading && (
              <div className="text-xs space-y-1 pt-2 border-t">
                <p className="font-semibold text-gray-700 mb-1">Legend:</p>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-white"></div>
                  <span className="text-gray-600">Leased</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white"></div>
                  <span className="text-gray-600">Owned</span>
                </div>
              </div>
            )}

            {/* Federal Neighborhood Score (when footprint is enabled) */}
            {/* Temporarily disabled to debug opportunities display */}
            {false && showIOLPLayer && !iolpLoading && (
              <div className="pt-2 border-t">
                <FederalScoreCard
                  latitude={currentViewport?.lat}
                  longitude={currentViewport?.lng}
                  radiusMiles={5}
                />
              </div>
            )}
          </div>
        </div>

        {/* Filters (for opportunities) */}
        {activeTab === 'opportunities' && showFilters && (
          <OpportunityFiltersComponent
            filters={opportunityFilters}
            onChange={setOpportunityFilters}
            availableStates={availableOpportunityStates}
            availableSetAsides={availableSetAsides}
            hasListings={brokerListings.length > 0}
          />
        )}

        {/* Filters (for expiring leases) */}
        {activeTab === 'expiring' && showFilters && (
          <IOLPFiltersComponent
            filters={iolpFilters}
            onChange={setIolpFilters}
            availableAgencies={availableAgencies}
            availableStates={availableStates}
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
            {opportunitiesError ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center max-w-sm">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Failed to Load Opportunities
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    {opportunitiesError}
                  </p>
                  <Button
                    onClick={fetchOpportunities}
                    size="sm"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4 bg-white">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
                    <div className="flex gap-4 mt-3">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedOpportunities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm || opportunityFilters.states.length > 0 || opportunityFilters.postedWithin !== 'all' || opportunityFilters.setAsideTypes.length > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <p>No opportunities match your filters</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setOpportunityFilters({
                          states: [],
                          postedWithin: 'all',
                          setAsideTypes: [],
                          sortBy: 'newest',
                          onlyMatches: undefined
                        });
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <p>No opportunities available</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedOpportunities.map((opp) => (
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
                    onExpressInterest={(e) => {
                      e.stopPropagation();
                      handleExpressInterest(opp);
                    }}
                    onSave={handleSaveOpportunity}
                    isSaved={savedOpportunities.has(opp.noticeId)}
                    hasInquiry={submittedInquiries.has(opp.noticeId || opp.solicitationNumber)}
                    matchScore={opportunityMatchScores.get(opp.noticeId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Available Listings Tab */}
          <TabsContent value="listings" className="flex-1 overflow-y-auto m-0 p-4">
            {listingsError ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center max-w-sm">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Failed to Load Listings
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    {listingsError}
                  </p>
                  <Button
                    onClick={fetchBrokerListings}
                    size="sm"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4 bg-white">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
                    <div className="flex gap-4 mt-3">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? (
                  <div className="flex flex-col items-center gap-2">
                    <p>No matches for "{searchTerm}"</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <p>No broker listings available</p>
                )}
              </div>
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
              <div className="space-y-4">
                {/* Urgency Summary Skeleton */}
                <div className="animate-pulse p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="text-center">
                        <div className="h-3 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                        <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lease Cards Skeleton */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4 bg-white">
                    <div className="flex justify-between mb-3">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredExpiringLeases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="mb-3 text-gray-400">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  {iolpFilters.urgencyFilter || iolpFilters.states.length > 0 || iolpFilters.agencies.length > 0 || iolpFilters.minRSF || iolpFilters.hasVacancy
                    ? 'No leases match your filters'
                    : expiringLeasesData?.leases?.length === 0
                    ? 'No expiring lease data available'
                    : 'No expiring leases found'
                  }
                </h3>
                <p className="text-xs text-gray-500 mb-4 max-w-xs">
                  {iolpFilters.urgencyFilter || iolpFilters.states.length > 0 || iolpFilters.agencies.length > 0 || iolpFilters.minRSF || iolpFilters.hasVacancy
                    ? 'Try adjusting your filters to see more results'
                    : 'There are no expiring leases in the selected timeframe'
                  }
                </p>
                {(iolpFilters.urgencyFilter || iolpFilters.states.length > 0 || iolpFilters.agencies.length > 0 || iolpFilters.minRSF || iolpFilters.hasVacancy) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIolpFilters({
                      propertyType: 'all',
                      agencies: [],
                      states: [],
                      timeframe: iolpFilters.timeframe,
                      sortBy: iolpFilters.sortBy,
                      urgencyFilter: undefined
                    })}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Results Counter */}
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-xs text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredExpiringLeases.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{expiringLeasesData?.leases?.length || 0}</span> leases
                  </p>
                  {iolpFilters.urgencyFilter && (
                    <button
                      onClick={() => setIolpFilters(prev => ({ ...prev, urgencyFilter: undefined }))}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear Urgency
                    </button>
                  )}
                </div>

                {/* Summary */}
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Lease Expiration Summary</h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => setIolpFilters(prev => ({
                        ...prev,
                        urgencyFilter: prev.urgencyFilter === 'critical' ? undefined : 'critical'
                      }))}
                      className={`text-left p-2 rounded hover:bg-white/50 transition-colors ${
                        iolpFilters.urgencyFilter === 'critical' ? 'bg-white ring-2 ring-red-500' : ''
                      }`}
                    >
                      <p className="text-gray-600">Critical</p>
                      <p className="text-lg font-bold text-red-600">{urgencyCounts.critical}</p>
                      <p className="text-gray-500">{'<'}6 months</p>
                    </button>
                    <button
                      onClick={() => setIolpFilters(prev => ({
                        ...prev,
                        urgencyFilter: prev.urgencyFilter === 'warning' ? undefined : 'warning'
                      }))}
                      className={`text-left p-2 rounded hover:bg-white/50 transition-colors ${
                        iolpFilters.urgencyFilter === 'warning' ? 'bg-white ring-2 ring-orange-500' : ''
                      }`}
                    >
                      <p className="text-gray-600">Warning</p>
                      <p className="text-lg font-bold text-orange-600">{urgencyCounts.warning}</p>
                      <p className="text-gray-500">6-12 months</p>
                    </button>
                    <button
                      onClick={() => setIolpFilters(prev => ({
                        ...prev,
                        urgencyFilter: prev.urgencyFilter === 'normal' ? undefined : 'normal'
                      }))}
                      className={`text-left p-2 rounded hover:bg-white/50 transition-colors ${
                        iolpFilters.urgencyFilter === 'normal' ? 'bg-white ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <p className="text-gray-600">Normal</p>
                      <p className="text-lg font-bold text-blue-600">{urgencyCounts.normal}</p>
                      <p className="text-gray-500">12+ months</p>
                    </button>
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
      <div className="flex-1 relative min-h-[50vh] md:min-h-0">
        <GSAMapWithIOLP
          opportunities={activeTab === "opportunities" ? filteredOpportunities : []}
          listings={activeTab === "listings" ? filteredListings : []}
          selectedOpportunity={selectedOpportunity}
          selectedListing={selectedListing}
          showIOLPLayer={showIOLPLayer}
          onIOLPLoadingChange={setIolpLoading}
          center={mapCenter}
          onIOLPCountChange={setIolpCount}
          onIOLPError={setIolpError}
          onViewportChange={setCurrentViewport}
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
        onExpressInterest={() => {
          if (detailOpportunity) {
            handleExpressInterest(detailOpportunity);
          }
        }}
      />

      <ExpressInterestModal
        opportunity={expressInterestOpportunity}
        open={showExpressInterest}
        onOpenChange={setShowExpressInterest}
        userEmail={userEmail || ""}
        onInquirySubmitted={handleInquirySubmitted}
      />
    </div>
  );
}
