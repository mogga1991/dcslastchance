"use client";

import { useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import PropertyActionsMenu from "./property-actions-menu";
import ExpandedMatchesView from "./expanded-matches-view";
import { Button } from "@/components/ui/button";

interface BrokerListing {
  id: string;
  title: string | null;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  total_sf: number;
  available_sf: number;
  asking_rent_sf: number | null;
  property_type: string | null;
  building_class: string | null;
  status: string;
  federal_score: number | null;
  views_count: number | null;
  created_at: string;
  available_date: string;
}

interface PropertyMatch {
  property_id: string;
  opportunity_count: number;
  best_match_score: number;
  opportunities: Array<{
    id: string;
    solicitation_number: string;
    title: string;
    agency: string;
    match_score: number;
  }>;
}

interface PropertiesTableProps {
  properties: BrokerListing[];
  matches: Record<string, PropertyMatch>;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

type SortField = "available_date" | "asking_rent_sf" | "status" | "available_sf";
type SortDirection = "asc" | "desc";

export default function PropertiesTable({
  properties,
  matches,
  onDelete,
  deletingId,
}: PropertiesTableProps) {
  const [sortField, setSortField] = useState<SortField>("available_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleRowExpansion = (propertyId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedProperties = [...properties].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "available_date":
        return (
          multiplier *
          (new Date(a.available_date).getTime() -
            new Date(b.available_date).getTime())
        );
      case "asking_rent_sf":
        return (
          multiplier * ((a.asking_rent_sf || 0) - (b.asking_rent_sf || 0))
        );
      case "status":
        return multiplier * a.status.localeCompare(b.status);
      case "available_sf":
        return multiplier * (a.available_sf - b.available_sf);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; className: string }
    > = {
      active: {
        label: "Active",
        className: "bg-green-50 text-green-700 border-green-200",
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      inactive: {
        label: "Inactive",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      },
      archived: {
        label: "Archived",
        className: "bg-red-50 text-red-700 border-red-200",
      },
    };

    const config = statusMap[status] || statusMap.active;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1 text-indigo-600" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-indigo-600" />
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[300px]">
              <span className="text-xs font-semibold uppercase text-gray-600">
                Property
              </span>
            </TableHead>
            <TableHead className="w-[120px]">
              <span className="text-xs font-semibold uppercase text-gray-600">
                Location
              </span>
            </TableHead>
            <TableHead className="w-[120px]">
              <button
                onClick={() => handleSort("available_sf")}
                className="flex items-center text-xs font-semibold uppercase text-gray-600 hover:text-gray-900"
              >
                Available SF
                <SortIcon field="available_sf" />
              </button>
            </TableHead>
            <TableHead className="w-[120px]">
              <button
                onClick={() => handleSort("asking_rent_sf")}
                className="flex items-center text-xs font-semibold uppercase text-gray-600 hover:text-gray-900"
              >
                Price
                <SortIcon field="asking_rent_sf" />
              </button>
            </TableHead>
            <TableHead className="w-[140px]">
              <button
                onClick={() => handleSort("available_date")}
                className="flex items-center text-xs font-semibold uppercase text-gray-600 hover:text-gray-900"
              >
                Date
                <SortIcon field="available_date" />
              </button>
            </TableHead>
            <TableHead className="w-[120px]">
              <button
                onClick={() => handleSort("status")}
                className="flex items-center text-xs font-semibold uppercase text-gray-600 hover:text-gray-900"
              >
                Status
                <SortIcon field="status" />
              </button>
            </TableHead>
            <TableHead className="w-[100px] text-center">
              <span className="text-xs font-semibold uppercase text-gray-600">
                Matches
              </span>
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProperties.map((property) => {
            const propertyMatches = matches[property.id];
            const hasMatches =
              propertyMatches && propertyMatches.opportunity_count > 0;
            const isExpanded = expandedRows.has(property.id);

            return (
              <Fragment key={property.id}>
                <TableRow
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleRowExpansion(property.id)}
                >
                  <TableCell>
                    {hasMatches ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {property.title ||
                            `${property.street_address}, ${property.city}`}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {property.street_address}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {property.city}, {property.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">
                      {property.available_sf.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(property.asking_rent_sf)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {formatDate(property.available_date)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(property.status)}</TableCell>
                  <TableCell className="text-center">
                    {hasMatches ? (
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700 border-indigo-200"
                      >
                        {propertyMatches.opportunity_count}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <PropertyActionsMenu
                      propertyId={property.id}
                      propertyStatus={property.status}
                      onDelete={() => onDelete(property.id)}
                      onViewMatches={() => toggleRowExpansion(property.id)}
                      disabled={deletingId === property.id}
                    />
                  </TableCell>
                </TableRow>
                {isExpanded && hasMatches && (
                  <ExpandedMatchesView
                    opportunities={propertyMatches.opportunities}
                    totalCount={propertyMatches.opportunity_count}
                    propertyId={property.id}
                  />
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
