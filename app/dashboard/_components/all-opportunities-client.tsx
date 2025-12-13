"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, ExternalLink, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { SAMOpportunity } from "@/lib/sam-gov";

// Dynamically import the map to avoid SSR issues
const GSAMap = dynamic(() => import("@/components/gsa-map"), { ssr: false });

export default function AllOpportunitiesClient() {
  const [opportunities, setOpportunities] = useState<SAMOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<SAMOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<SAMOpportunity | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = opportunities.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.solicitationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.placeOfPerformance?.city?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.placeOfPerformance?.state?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOpportunities(filtered);
    } else {
      setFilteredOpportunities(opportunities);
    }
  }, [searchTerm, opportunities]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/opportunities?source=all&limit=100");
      const data = await response.json();

      if (data.success) {
        setOpportunities(data.data || []);
        setFilteredOpportunities(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel - Opportunities List */}
      <div className="w-[380px] bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <h1 className="text-lg font-semibold mb-1">All Opportunities</h1>
          <p className="text-sm text-gray-600 mb-3">
            {filteredOpportunities.length} active solicitations
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Opportunities List */}
        <div className="flex-1 overflow-y-auto">
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
            <div className="divide-y">
              {filteredOpportunities.map((opp) => {
                const daysLeft = getDaysUntilDeadline(opp.responseDeadLine);
                const isUrgent = daysLeft !== null && daysLeft <= 7;

                return (
                  <div
                    key={opp.noticeId}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedOpportunity?.noticeId === opp.noticeId
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : ""
                    }`}
                    onClick={() => setSelectedOpportunity(opp)}
                  >
                    {/* Type Badge */}
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {opp.type}
                      </Badge>
                      {isUrgent && (
                        <Badge variant="destructive" className="text-xs">
                          {daysLeft}d left
                        </Badge>
                      )}
                      {!isUrgent && daysLeft !== null && (
                        <Badge variant="outline" className="text-xs text-green-700 border-green-200">
                          {daysLeft}d left
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{opp.title}</h3>

                    {/* Department/Agency */}
                    <p className="text-xs text-gray-600 mb-2">
                      {opp.department || opp.subTier}
                    </p>

                    {/* Location */}
                    {opp.placeOfPerformance && (
                      <div className="flex items-center text-xs text-gray-600 mb-2">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {opp.placeOfPerformance.city?.name},{" "}
                          {opp.placeOfPerformance.state?.code}
                        </span>
                      </div>
                    )}

                    {/* Bottom Row - Deadline and Link */}
                    <div className="flex items-center justify-between text-xs mt-2">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Closes: {formatDate(opp.responseDeadLine)}</span>
                      </div>
                      {opp.uiLink && (
                        <a
                          href={opp.uiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative">
        <GSAMap opportunities={filteredOpportunities} selectedOpportunity={selectedOpportunity} />
      </div>
    </div>
  );
}
