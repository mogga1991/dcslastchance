"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { SAMOpportunity } from "@/lib/sam-gov";
import type { PublicBrokerListing } from "@/types/broker-listing";
import { OpportunityCard } from "./opportunity-card";
import { BrokerListingCard } from "./broker-listing-card";
import { ListingDetailModal } from "./listing-detail-modal";
import { OpportunityDetailModal } from "./opportunity-detail-modal";
import { ExpressInterestModal } from "./express-interest-modal";
// ExpiringLeaseCard and ExpiringLeaseDetailPanel removed - IOLP data no longer available
import type { OpportunityFilters } from "./opportunity-filters";
import { useToast } from "@/hooks/use-toast";
import { calculateAllOpportunityMatches } from "@/lib/scoring/calculate-opportunity-matches";
import type { MatchScoreResult } from "@/lib/scoring/types";

// Map component - IOLP layer removed (component no longer exists)
// const GSAMap = dynamic(() => import("./gsa-map"), { ssr: false });

type TabType = "opportunities" | "listings";

interface GSALeasingClientProps {
  userEmail?: string;
}

export default function GSALeasingClient({ userEmail }: GSALeasingClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("opportunities");
  const [opportunities, setOpportunities] = useState<SAMOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<SAMOpportunity[]>([]);
  const [brokerListings, setBrokerListings] = useState<PublicBrokerListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<PublicBrokerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<SAMOpportunity | null>(null);
  const [selectedListing, setSelectedListing] = useState<PublicBrokerListing | null>(null);
  const [showListingDetail, setShowListingDetail] = useState(false);
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false);
  const [detailListing, setDetailListing] = useState<PublicBrokerListing | null>(null);
  const [detailOpportunity, setDetailOpportunity] = useState<SAMOpportunity | null>(null);
  const [showExpressInterest, setShowExpressInterest] = useState(false);
  const [expressInterestOpportunity, setExpressInterestOpportunity] = useState<SAMOpportunity | null>(null);
  const [submittedInquiries, setSubmittedInquiries] = useState<Set<string>>(new Set());
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [pinFilteredOpportunities, setPinFilteredOpportunities] = useState<SAMOpportunity[] | null>(null);

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

  const { toast } = useToast();

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setOpportunitiesError(null);

      const response = await fetch("/api/gsa-leasing?limit=1000");

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
  }, [toast]);

  const fetchBrokerListings = useCallback(async () => {
    try {
      setListingsError(null);

      const response = await fetch("/api/broker-listings?limit=1000");

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
  }, [toast]);

  // IOLP alerts removed - no longer available

  const fetchSavedOpportunities = useCallback(async () => {
    try {
      const response = await fetch("/api/saved-opportunities");

      if (!response.ok) {
        // If unauthorized, just skip (user not logged in)
        if (response.status === 401) return;
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const savedIds = new Set<string>(data.map((s: { notice_id: string }) => s.notice_id));
      setSavedOpportunities(savedIds);
    } catch (error) {
      console.error("Error fetching saved opportunities:", error);
    }
  }, []);

  const fetchSubmittedInquiries = useCallback(async () => {
    try {
      const response = await fetch("/api/opportunity-inquiries");

      if (!response.ok) {
        // If unauthorized, just skip (user not logged in)
        if (response.status === 401) return;
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const inquiryIds = new Set<string>(data.inquiries?.map((i: { opportunity_id: string }) => i.opportunity_id) || []);
      setSubmittedInquiries(inquiryIds);
    } catch (error) {
      console.error("Error fetching submitted inquiries:", error);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
    fetchBrokerListings();
    fetchSavedOpportunities();
    fetchSubmittedInquiries();
  }, [fetchOpportunities, fetchBrokerListings, fetchSavedOpportunities, fetchSubmittedInquiries]);

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

  const handlePinClick = (filteredOpps: SAMOpportunity[]) => {
    setPinFilteredOpportunities(filteredOpps);
  };

  const clearPinFilter = () => {
    setPinFilteredOpportunities(null);
  };

  // IOLP alert management removed - no longer available

  const handleViewOnMap = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  // Removed unused: availableOpportunityStates and availableSetAsides

  // Calculate match scores when broker listings are available
  const opportunityMatchScores = useMemo(() => {
    if (brokerListings.length === 0 || opportunities.length === 0) {
      return new Map<string, MatchScoreResult>();
    }
    return calculateAllOpportunityMatches(opportunities, brokerListings);
  }, [opportunities, brokerListings]);

  // Filter and sort opportunities
  const filteredAndSortedOpportunities = useMemo(() => {
    // Use pinFilteredOpportunities if available (when user clicks a pin), otherwise use all opportunities
    const baseOpportunities = pinFilteredOpportunities || opportunities;

    if (!baseOpportunities || baseOpportunities.length === 0) {
      return [];
    }

    let filtered = [...baseOpportunities];

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
  }, [opportunities, searchTerm, opportunityFilters, opportunityMatchScores, pinFilteredOpportunities]);

  // Removed unused: availableAgencies and availableStates
  // IOLP expiring leases functionality removed

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel */}
      <div className="w-full lg:w-[620px] bg-white border-r lg:border-b-0 border-b flex flex-col max-h-[60vh] lg:max-h-none overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">GSA Leasing</h1>
          </div>


          {/* Federal Footprint Toggle removed - IOLP data no longer available */}
        </div>


        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b-2 border-slate-200 bg-slate-50 h-auto p-0">
            <TabsTrigger
              value="opportunities"
              className="rounded-none text-sm sm:text-base font-bold px-3 sm:px-6 py-4 hover:bg-slate-100 cursor-pointer transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-b-4 data-[state=active]:border-indigo-700 data-[state=inactive]:text-slate-600"
            >
              <span className="hidden sm:inline">Opportunities</span>
              <span className="sm:hidden">Opps</span>
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="rounded-none text-sm sm:text-base font-bold px-3 sm:px-6 py-4 hover:bg-slate-100 cursor-pointer transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-b-4 data-[state=active]:border-indigo-700 data-[state=inactive]:text-slate-600"
            >
              <span className="hidden sm:inline">Available Listings</span>
              <span className="sm:hidden">Listings</span>
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
              <>
                {/* Pin Filter Notification */}
                {pinFilteredOpportunities && (
                  <div className="mb-4 p-3 bg-indigo-50 border-2 border-indigo-300 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {pinFilteredOpportunities.length}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-indigo-900">
                          Viewing {pinFilteredOpportunities.length} opportunit{pinFilteredOpportunities.length !== 1 ? 'ies' : 'y'} from {pinFilteredOpportunities[0]?.placeOfPerformance?.state?.code || 'selected location'}
                        </p>
                        <p className="text-xs text-indigo-700">Click on map pins to filter opportunities by location</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearPinFilter}
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                    >
                      Show All
                    </Button>
                  </div>
                )}

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
              </>
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
                    <p>No matches for &quot;{searchTerm}&quot;</p>
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

          {/* Expiring Leases Tab removed - IOLP data no longer available */}
        </Tabs>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative min-h-[40vh] lg:min-h-0">
        {/* Map component removed - IOLP layer no longer available */}
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
          <p>Map component unavailable - IOLP data removed</p>
        </div>

        {/* Detail Panels - Overlay the map */}
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

        {/* ExpiringLeaseDetailPanel removed - IOLP data no longer available */}
      </div>

      {/* Express Interest Modal (still a dialog, not a full panel) */}
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
