"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { getDaysUntilDeadline } from "@/lib/sam-gov";

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

  useEffect(() => {
    fetchOpportunities();
  }, [currentPage, noticeType, department, sortBy]);

  const fetchOpportunities = async () => {
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
  };

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
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">All Solicitations</h2>
          <p className="text-sm text-gray-600 mt-1">
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
      <div className="px-6 py-4 border-b bg-gray-50 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by keyword, notice ID, or agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={noticeType} onValueChange={setNoticeType}>
          <SelectTrigger className="w-[200px]">
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
          <SelectTrigger className="w-[220px]">
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
              className={`p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedOpportunity?.noticeId === opportunity.noticeId && isPanelOpen
                  ? "bg-orange-50 border-l-4 border-orange-500"
                  : ""
              }`}
            >
              {/* Top Row: Title and Notice Type */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-600 hover:underline text-base">
                    {opportunity.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Notice ID: {opportunity.noticeId}
                  </p>
                </div>
                <Badge variant="outline" className="ml-4 flex-shrink-0">
                  {getNoticeTypeLabel(opportunity.type)}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                {opportunity.description || "No description available"}
              </p>

              {/* Info Grid */}
              <div className="grid grid-cols-4 gap-4 text-sm mt-4">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Department</div>
                  <div className="font-medium line-clamp-1">{opportunity.department}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Subtier</div>
                  <div className="font-medium line-clamp-1">{opportunity.subTier}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Office</div>
                  <div className="font-medium line-clamp-1">{opportunity.office}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Response Due</div>
                  <div className="font-medium">
                    {formatDate(opportunity.responseDeadLine)}
                    {opportunity.responseDeadLine && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({getDaysUntilDeadline(opportunity.responseDeadLine)}d left)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Dates */}
              <div className="flex items-center gap-6 text-xs text-gray-500 mt-3 pt-3 border-t">
                <div>
                  <span className="font-medium">Posted:</span> {formatDate(opportunity.postedDate)}
                </div>
                {opportunity.typeOfSetAsideDescription && (
                  <div>
                    <span className="font-medium">Set-Aside:</span> {opportunity.typeOfSetAsideDescription}
                  </div>
                )}
                {opportunity.naicsCode && (
                  <div>
                    <span className="font-medium">NAICS:</span> {opportunity.naicsCode}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && opportunities.length > 0 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
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
