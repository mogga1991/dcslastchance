"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { SAMOpportunity } from "@/lib/sam-gov";
import { SolicitationDetailPanel } from "./solicitation-detail-panel";

export function SolicitationsTable() {
  const [opportunities, setOpportunities] = useState<SAMOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<SAMOpportunity | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [noticeType, setNoticeType] = useState("all");
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("postedDate");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 25;

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (noticeType !== "all") {
        params.append("noticeTypes", noticeType);
      }

      if (department !== "all") {
        params.append("department", department);
      }

      const response = await fetch(`/api/solicitations?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch solicitations");
      }

      const data = await response.json();
      setOpportunities(data.opportunitiesData || []);
      setTotalRecords(data.totalRecords || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [currentPage, noticeType, department]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleRowClick = (opportunity: SAMOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsPanelOpen(true);
  };

  const handleSave = async () => {
    if (!selectedOpportunity) return;

    try {
      const response = await fetch("/api/saved-opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notice_id: selectedOpportunity.noticeId,
          opportunity_data: selectedOpportunity,
        }),
      });

      if (response.ok) {
        alert("Opportunity saved successfully!");
      } else if (response.status === 409) {
        alert("Opportunity already saved!");
      } else {
        throw new Error("Failed to save opportunity");
      }
    } catch (error) {
      console.error("Error saving opportunity:", error);
      alert("Failed to save opportunity");
    }
  };

  const totalPages = Math.ceil(totalRecords / limit);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getNoticeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      o: "Combined Synopsis/Solicitation",
      p: "Presolicitation",
      k: "Solicitation",
      r: "Sources Sought",
      s: "Special Notice",
      a: "Award Notice",
      i: "Intent to Bundle",
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header - SAM.gov style */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
        <div>
          <p className="text-base font-medium text-gray-900">
            Showing {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalRecords)} of {totalRecords.toLocaleString()} results
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postedDate">Posted Date</SelectItem>
              <SelectItem value="responseDeadLine">Response Deadline</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 py-4 border-b bg-gray-50 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by keyword, notice ID, or agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <div className="flex gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          <Select value={noticeType} onValueChange={setNoticeType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Notice Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="o">Combined Synopsis/Solicitation</SelectItem>
              <SelectItem value="p">Presolicitation</SelectItem>
              <SelectItem value="k">Solicitation</SelectItem>
              <SelectItem value="r">Sources Sought</SelectItem>
              <SelectItem value="s">Special Notice</SelectItem>
            </SelectContent>
          </Select>

          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Agency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agencies</SelectItem>
              <SelectItem value="DEPT OF DEFENSE">Dept of Defense</SelectItem>
              <SelectItem value="VETERANS AFFAIRS, DEPARTMENT OF">Veterans Affairs</SelectItem>
              <SelectItem value="General Services Administration">General Services Admin</SelectItem>
              <SelectItem value="DEPT OF HOMELAND SECURITY">Homeland Security</SelectItem>
              <SelectItem value="DEPT OF ENERGY">Energy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="divide-y">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading solicitations...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">
            Error: {error}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No solicitations found
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <div
              key={opportunity.noticeId}
              onClick={() => handleRowClick(opportunity)}
              className="p-8 cursor-pointer transition-all hover:bg-blue-50/30 border-b border-gray-100 last:border-b-0"
            >
              {/* SAM.gov Style Layout */}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left: Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-semibold text-[#005EA2] hover:underline mb-3 leading-snug">
                    {opportunity.title}
                  </h3>

                  {/* Notice ID */}
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mb-3 break-all">
                    Notice ID: <span className="font-mono">{opportunity.solicitationNumber || opportunity.noticeId}</span>
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2 mb-4">
                    {typeof opportunity.description === "string" && opportunity.description.startsWith("http")
                      ? "View full description on SAM.gov"
                      : opportunity.description || "No description available"}
                  </p>

                  {/* Agency Info - SAM.gov style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600">Department/Ind.Agency</span>
                      <p className="font-medium text-[#005EA2] mt-0.5">
                        {opportunity.fullParentPathName?.split('.')[0] || opportunity.department || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Subtier</span>
                      <p className="font-medium text-[#005EA2] mt-0.5">
                        {opportunity.fullParentPathName?.split('.')[1] || opportunity.subTier || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Office</span>
                      <p className="font-medium text-[#005EA2] mt-0.5 line-clamp-1">
                        {opportunity.office || opportunity.fullParentPathName?.split('.')[2] || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Metadata Sidebar - SAM.gov style */}
                <div className="w-full lg:w-64 flex-shrink-0 bg-gray-50 lg:-mr-8 lg:-my-8 p-4 lg:p-6 lg:border-l border-t lg:border-t-0 border-gray-200 rounded lg:rounded-none">
                  <div className="space-y-4">
                    {/* Contract Opportunities Badge */}
                    <div className="bg-white border border-gray-300 px-3 py-1.5 rounded text-center">
                      <span className="text-xs font-medium text-gray-700">Contract Opportunities</span>
                    </div>

                    {/* Response Deadline */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Current Date Offers Due</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {opportunity.responseDeadLine
                          ? new Date(opportunity.responseDeadLine).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZoneName: "short",
                            })
                          : "Not specified"}
                      </p>
                    </div>

                    {/* Notice Type */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Notice Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getNoticeTypeLabel(opportunity.baseType || opportunity.type)}
                      </p>
                    </div>

                    {/* Updated Date */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Updated Date</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(opportunity.postedDate)}
                      </p>
                    </div>

                    {/* Published Date */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Published Date</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(opportunity.postedDate)}
                      </p>
                    </div>

                    {/* NAICS */}
                    {opportunity.naicsCode && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">NAICS Code</p>
                        <p className="text-sm font-mono text-gray-900">{opportunity.naicsCode}</p>
                      </div>
                    )}

                    {/* Set-Aside */}
                    {opportunity.typeOfSetAsideDescription && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Set-Aside</p>
                        <p className="text-sm text-gray-900">{opportunity.typeOfSetAsideDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && opportunities.length > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none h-10"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none h-10"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      <SolicitationDetailPanel
        opportunity={selectedOpportunity}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onCheckQualification={() => alert("Qualification check coming soon!")}
        onBidDecision={() => alert("Bid/No-Bid decision coming soon!")}
        onSave={handleSave}
      />
    </div>
  );
}
