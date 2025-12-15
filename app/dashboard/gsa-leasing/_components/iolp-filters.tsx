"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export interface IOLPFilters {
  propertyType: 'all' | 'leased' | 'owned';
  agencies: string[];
  minRSF?: number;
  hasVacancy?: boolean;
}

interface IOLPFiltersProps {
  filters: IOLPFilters;
  onChange: (filters: IOLPFilters) => void;
  availableAgencies?: string[];
}

export function IOLPFiltersComponent({
  filters,
  onChange,
  availableAgencies = []
}: IOLPFiltersProps) {
  const handlePropertyTypeChange = (value: string) => {
    onChange({
      ...filters,
      propertyType: value as 'all' | 'leased' | 'owned'
    });
  };

  const handleAgencyToggle = (agency: string) => {
    const newAgencies = filters.agencies.includes(agency)
      ? filters.agencies.filter(a => a !== agency)
      : [...filters.agencies, agency];

    onChange({
      ...filters,
      agencies: newAgencies
    });
  };

  const handleMinRSFChange = (value: string) => {
    onChange({
      ...filters,
      minRSF: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleVacancyToggle = (checked: boolean) => {
    onChange({
      ...filters,
      hasVacancy: checked ? true : undefined
    });
  };

  const clearAgencies = () => {
    onChange({
      ...filters,
      agencies: []
    });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 border-t">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Filter Federal Properties</h3>
        {(filters.propertyType !== 'all' || filters.agencies.length > 0 || filters.minRSF || filters.hasVacancy) && (
          <button
            onClick={() => onChange({ propertyType: 'all', agencies: [] })}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Property Type Filter */}
      <div>
        <Label className="text-xs text-gray-600 mb-2 block">Property Type</Label>
        <Select value={filters.propertyType} onValueChange={handlePropertyTypeChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="leased">Leased Only</SelectItem>
            <SelectItem value="owned">Federally Owned Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Size Filter */}
      <div>
        <Label className="text-xs text-gray-600 mb-2 block">Minimum Size (RSF)</Label>
        <Select
          value={filters.minRSF?.toString() || 'all'}
          onValueChange={handleMinRSFChange}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Size</SelectItem>
            <SelectItem value="10000">10,000+ SF</SelectItem>
            <SelectItem value="25000">25,000+ SF</SelectItem>
            <SelectItem value="50000">50,000+ SF</SelectItem>
            <SelectItem value="100000">100,000+ SF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vacancy Filter */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="has-vacancy"
          checked={filters.hasVacancy || false}
          onCheckedChange={handleVacancyToggle}
        />
        <Label htmlFor="has-vacancy" className="text-xs cursor-pointer">
          Has Vacant Space
        </Label>
      </div>

      {/* Agency Filter */}
      {availableAgencies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-gray-600">Agencies</Label>
            {filters.agencies.length > 0 && (
              <button
                onClick={clearAgencies}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Selected Agencies */}
          {filters.agencies.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {filters.agencies.map(agency => (
                <Badge
                  key={agency}
                  variant="secondary"
                  className="text-xs h-6 px-2"
                >
                  {agency}
                  <button
                    onClick={() => handleAgencyToggle(agency)}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Agency List */}
          <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2 bg-white">
            {availableAgencies.slice(0, 15).map(agency => (
              <div key={agency} className="flex items-center gap-2">
                <Checkbox
                  id={`agency-${agency}`}
                  checked={filters.agencies.includes(agency)}
                  onCheckedChange={() => handleAgencyToggle(agency)}
                />
                <Label
                  htmlFor={`agency-${agency}`}
                  className="text-xs cursor-pointer flex-1"
                >
                  {agency}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
