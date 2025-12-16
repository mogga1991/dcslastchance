"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { SAMOpportunity } from "@/lib/sam-gov";
import { Card } from "@/components/ui/card";

export default function AllOpportunitiesClient() {
  const [opportunities, setOpportunities] = useState<SAMOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<SAMOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      const response = await fetch("/api/sam-opportunities?mode=all&limit=100");
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">All Solicitations</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredOpportunities.length} active opportunities
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, number, agency, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading opportunities...</p>
          </div>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No opportunities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpportunities.map((opp) => {
            const daysLeft = getDaysUntilDeadline(opp.responseDeadLine);
            const isUrgent = daysLeft !== null && daysLeft <= 7;

            return (
              <Card
                key={opp.noticeId}
                className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Type and Urgency Badges */}
                <div className="flex items-start justify-between mb-3">
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
                <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-[3rem]">
                  {opp.title}
                </h3>

                {/* Solicitation Number */}
                {opp.solicitationNumber && (
                  <p className="text-xs text-gray-500 mb-2 font-mono">
                    {opp.solicitationNumber}
                  </p>
                )}

                {/* Department/Agency */}
                <p className="text-sm text-gray-700 mb-3 line-clamp-1">
                  {opp.department || opp.subTier}
                </p>

                {/* Location */}
                {opp.placeOfPerformance && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">
                      {opp.placeOfPerformance.city?.name},{" "}
                      {opp.placeOfPerformance.state?.code}
                    </span>
                  </div>
                )}

                {/* Deadline */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Closes: {formatDate(opp.responseDeadLine)}</span>
                </div>

                {/* Link */}
                {opp.uiLink && (
                  <a
                    href={opp.uiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on SAM.gov
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
