"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { SAMOpportunity } from "@/lib/sam-gov";
import type { BrokerListing } from "@/types/broker-listing";
import { OpportunityCard } from "./opportunity-card";
import { BrokerListingCard } from "./broker-listing-card";
import { ListingDetailModal } from "./listing-detail-modal";
import { OpportunityDetailModal } from "./opportunity-detail-modal";

// Dynamically import the map to avoid SSR issues
const GSAMapWithIOLP = dynamic(() => import("./gsa-map-with-iolp"), { ssr: false });

export default function GSALeasingClient() {
  const [activeTab, setActiveTab] = useState<"opportunities" | "listings">("opportunities");
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

  useEffect(() => {
    fetchOpportunities();
    fetchBrokerListings();
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

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel */}
      <div className="w-[380px] bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <h1 className="text-lg font-semibold mb-3">GSA Leasing</h1>

          {/* Search */}
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

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "opportunities" | "listings")}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="opportunities" className="rounded-none">
              GSA Opportunities
            </TabsTrigger>
            <TabsTrigger value="listings" className="rounded-none">
              Available Listings
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
