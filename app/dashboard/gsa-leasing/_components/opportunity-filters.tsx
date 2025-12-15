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
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export interface OpportunityFilters {
  states: string[];
  postedWithin: 'all' | '7' | '30' | '90';
  minRSF?: number;
  maxRSF?: number;
  setAsideTypes: string[];
  sortBy: 'newest' | 'deadline' | 'bestMatch' | 'rsf';
  onlyMatches?: boolean;
}

interface OpportunityFiltersProps {
  filters: OpportunityFilters;
  onChange: (filters: OpportunityFilters) => void;
  availableStates?: string[];
  availableSetAsides?: string[];
  hasListings?: boolean;
}

export function OpportunityFiltersComponent({
  filters,
  onChange,
  availableStates = [],
  availableSetAsides = [],
  hasListings = false
}: OpportunityFiltersProps) {
  const handleStateToggle = (state: string) => {
    const newStates = filters.states.includes(state)
      ? filters.states.filter(s => s !== state)
      : [...filters.states, state];

    onChange({
      ...filters,
      states: newStates
    });
  };

  const handleSetAsideToggle = (setAside: string) => {
    const newSetAsides = filters.setAsideTypes.includes(setAside)
      ? filters.setAsideTypes.filter(s => s !== setAside)
      : [...filters.setAsideTypes, setAside];

    onChange({
      ...filters,
      setAsideTypes: newSetAsides
    });
  };

  const handlePostedWithinChange = (value: string) => {
    onChange({
      ...filters,
      postedWithin: value as 'all' | '7' | '30' | '90'
    });
  };

  const handleSortChange = (value: string) => {
    onChange({
      ...filters,
      sortBy: value as 'newest' | 'deadline' | 'bestMatch' | 'rsf'
    });
  };

  const handleMinRSFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({
      ...filters,
      minRSF: value ? parseInt(value) : undefined
    });
  };

  const handleMaxRSFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({
      ...filters,
      maxRSF: value ? parseInt(value) : undefined
    });
  };

  const handleOnlyMatchesToggle = (checked: boolean) => {
    onChange({
      ...filters,
      onlyMatches: checked ? true : undefined
    });
  };

  const clearStates = () => {
    onChange({
      ...filters,
      states: []
    });
  };

  const clearSetAsides = () => {
    onChange({
      ...filters,
      setAsideTypes: []
    });
  };

  const resetAllFilters = () => {
    onChange({
      states: [],
      postedWithin: 'all',
      setAsideTypes: [],
      sortBy: 'newest',
      onlyMatches: undefined
    });
  };

  const hasActiveFilters = filters.states.length > 0 ||
    filters.postedWithin !== 'all' ||
    filters.minRSF ||
    filters.maxRSF ||
    filters.setAsideTypes.length > 0 ||
    filters.onlyMatches;

  return (
    <div className="space-y-4 p-4 bg-gray-50 border-t overflow-y-auto max-h-[calc(100vh-400px)]">
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 pb-2 z-10">
        <h3 className="font-semibold text-sm">Filters & Sort</h3>
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Sort Options */}
      <div>
        <Label className="text-xs text-gray-600 mb-2 block">Sort By</Label>
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
            {hasListings && <SelectItem value="bestMatch">Best Match</SelectItem>}
            <SelectItem value="rsf">RSF (Largest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posted Within Filter */}
      <div>
        <Label className="text-xs text-gray-600 mb-2 block">Posted Within</Label>
        <Select value={filters.postedWithin} onValueChange={handlePostedWithinChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* RSF Range */}
      <div>
        <Label className="text-xs text-gray-600 mb-2 block">Square Footage (RSF)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minRSF || ''}
            onChange={handleMinRSFChange}
            className="h-8 text-xs"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxRSF || ''}
            onChange={handleMaxRSFChange}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Only Show Matches Toggle */}
      {hasListings && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
          <Checkbox
            id="only-matches"
            checked={filters.onlyMatches || false}
            onCheckedChange={handleOnlyMatchesToggle}
          />
          <Label htmlFor="only-matches" className="text-xs cursor-pointer font-medium text-blue-900">
            Only show matches (70%+)
          </Label>
        </div>
      )}

      {/* State Filter */}
      {availableStates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-gray-600">States</Label>
            {filters.states.length > 0 && (
              <button
                onClick={clearStates}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Selected States */}
          {filters.states.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {filters.states.map(state => (
                <Badge
                  key={state}
                  variant="secondary"
                  className="text-xs h-6 px-2"
                >
                  {state}
                  <button
                    onClick={() => handleStateToggle(state)}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* State List */}
          <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-2 bg-white">
            {availableStates.map(state => (
              <div key={state} className="flex items-center gap-2">
                <Checkbox
                  id={`opp-state-${state}`}
                  checked={filters.states.includes(state)}
                  onCheckedChange={() => handleStateToggle(state)}
                />
                <Label
                  htmlFor={`opp-state-${state}`}
                  className="text-xs cursor-pointer flex-1"
                >
                  {state}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Set-Aside Filter */}
      {availableSetAsides.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-gray-600">Set-Aside Type</Label>
            {filters.setAsideTypes.length > 0 && (
              <button
                onClick={clearSetAsides}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Selected Set-Asides */}
          {filters.setAsideTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {filters.setAsideTypes.map(setAside => (
                <Badge
                  key={setAside}
                  variant="secondary"
                  className="text-xs h-6 px-2"
                >
                  {setAside}
                  <button
                    onClick={() => handleSetAsideToggle(setAside)}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Set-Aside List */}
          <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-2 bg-white">
            {availableSetAsides.map(setAside => (
              <div key={setAside} className="flex items-center gap-2">
                <Checkbox
                  id={`set-aside-${setAside}`}
                  checked={filters.setAsideTypes.includes(setAside)}
                  onCheckedChange={() => handleSetAsideToggle(setAside)}
                />
                <Label
                  htmlFor={`set-aside-${setAside}`}
                  className="text-xs cursor-pointer flex-1"
                >
                  {setAside}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
