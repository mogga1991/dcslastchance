"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PropertyFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  matchFilter: string;
  onMatchFilterChange: (value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

export default function PropertyFilters({
  statusFilter,
  onStatusChange,
  matchFilter,
  onMatchFilterChange,
  onClearFilters,
  resultCount,
  totalCount,
}: PropertyFiltersProps) {
  const hasActiveFilters = statusFilter !== "all" || matchFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Match Status Filter */}
        <Select value={matchFilter} onValueChange={onMatchFilterChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="has_matches">Has Matches</SelectItem>
            <SelectItem value="no_matches">No Matches</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full md:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium text-gray-900">{resultCount}</span> of{" "}
        <span className="font-medium text-gray-900">{totalCount}</span> properties
      </div>
    </div>
  );
}
