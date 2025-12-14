import { FederalNeighborhoodScore } from '@/lib/iolp';

/**
 * Broker Listing Status
 */
export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'matched'
  | 'under_contract'
  | 'leased'
  | 'withdrawn'
  | 'expired';

/**
 * Property Type
 */
export type PropertyType =
  | 'office'
  | 'warehouse'
  | 'retail'
  | 'industrial'
  | 'medical'
  | 'mixed_use'
  | 'land'
  | 'other';

/**
 * Set-Aside Types for Federal Contracting
 */
export type SetAsideType =
  | 'sdvosb' // Service-Disabled Veteran-Owned Small Business
  | 'wosb' // Women-Owned Small Business
  | '8a' // 8(a) Business Development
  | 'hubzone' // Historically Underutilized Business Zone
  | 'small_business' // General Small Business
  | 'none';

/**
 * Lease Type
 */
export type LeaseType = 'full_service' | 'modified_gross' | 'triple_net' | 'ground_lease';

/**
 * Main Broker Listing Interface
 */
export interface BrokerListing {
  // Identity
  id: string;
  user_id: string;

  // Broker Information
  broker_name: string;
  broker_company: string;
  broker_email: string;
  broker_phone: string;

  // Listing Details
  title: string;
  description: string;
  property_type: PropertyType;
  status: ListingStatus;

  // Location
  street_address: string;
  suite_unit?: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;

  // Space Details
  total_sf: number;
  available_sf: number;
  min_divisible_sf?: number;

  // Pricing
  asking_rent_sf: number; // Annual rate per square foot
  lease_type: LeaseType;

  // Availability
  available_date: string; // ISO date string

  // Property Features
  features: string[]; // e.g., ["parking", "conference_rooms", "loading_dock"]
  amenities: string[]; // e.g., ["gym", "cafeteria", "bike_storage"]

  // Federal Suitability
  gsa_eligible: boolean;
  set_aside_eligible: SetAsideType[];

  // Federal Score (calculated from IOLP data)
  federal_score?: number; // 0-100
  federal_score_data?: FederalNeighborhoodScore;

  // Media
  images: string[]; // URLs to images

  // Metrics
  views_count?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
}

/**
 * Input type for creating/updating broker listings
 */
export interface BrokerListingInput {
  // Broker Information
  broker_name: string;
  broker_company: string;
  broker_email: string;
  broker_phone: string;

  // Listing Details
  title: string;
  description: string;
  property_type: PropertyType;
  status?: ListingStatus;

  // Location
  street_address: string;
  suite_unit?: string;
  city: string;
  state: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;

  // Space Details
  total_sf: number;
  available_sf: number;
  min_divisible_sf?: number;

  // Pricing
  asking_rent_sf: number;
  lease_type: LeaseType;

  // Availability
  available_date: string;

  // Property Features
  features?: string[];
  amenities?: string[];

  // Federal Suitability
  gsa_eligible?: boolean;
  set_aside_eligible?: SetAsideType[];

  // Media
  images?: string[];
}

/**
 * Filters for listing broker listings
 */
export interface BrokerListingFilters {
  // Status & Type
  status?: ListingStatus | ListingStatus[];
  property_type?: PropertyType | PropertyType[];

  // Location
  state?: string;
  city?: string;

  // Space Requirements
  min_sf?: number;
  max_sf?: number;

  // Pricing
  min_rent?: number; // Annual rate per SF
  max_rent?: number; // Annual rate per SF

  // Federal Suitability
  gsa_eligible?: boolean;
  set_aside_eligible?: SetAsideType;

  // Search
  search?: string; // Full-text search on title, description, address

  // Pagination
  limit?: number;
  offset?: number;

  // Sorting
  sort_by?: 'created_at' | 'updated_at' | 'asking_rent_sf' | 'available_sf' | 'federal_score';
  sort_order?: 'asc' | 'desc';
}

/**
 * Response for listing broker listings
 */
export interface BrokerListingsResponse {
  success: boolean;
  data?: BrokerListing[];
  error?: string;
  meta?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Response for single broker listing
 */
export interface BrokerListingResponse {
  success: boolean;
  data?: BrokerListing;
  error?: string;
}
