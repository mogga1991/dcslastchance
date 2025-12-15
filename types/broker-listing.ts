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
 * Building Class
 */
export type BuildingClass = 'class_a' | 'class_b' | 'class_c';

/**
 * Lister Role Types
 */
export type ListerRole = 'owner' | 'broker' | 'agent' | 'salesperson';

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

  // Lister Role
  lister_role: ListerRole;

  // Broker Information
  broker_name: string;
  broker_company: string;
  broker_email: string;
  broker_phone: string;
  license_number?: string;
  brokerage_company?: string;

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

  // MVP Property Features
  building_class?: BuildingClass;
  ada_accessible?: boolean;
  parking_spaces?: number;
  leed_certified?: boolean;
  year_built?: number;
  notes?: string;

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
 * Input type for creating/updating broker listings (MVP Simplified)
 */
export interface BrokerListingInput {
  // REQUIRED FIELDS
  // Location
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;

  // Space Details
  total_sf: number;

  // Availability
  available_date: string;

  // Building Class
  building_class: BuildingClass;

  // Contact (pre-filled from logged-in user)
  broker_email: string;

  // OPTIONAL FIELDS (collapsed in "Additional Details")
  ada_accessible?: boolean;
  parking_spaces?: number;
  leed_certified?: boolean;
  year_built?: number;
  notes?: string;

  // Hidden/Auto-filled fields
  lister_role?: ListerRole;
  broker_name?: string;
  broker_company?: string;
  broker_phone?: string;
  license_number?: string;
  brokerage_company?: string;
  title?: string;
  description?: string;
  property_type?: PropertyType;
  status?: ListingStatus;
  suite_unit?: string;
  available_sf?: number;
  min_divisible_sf?: number;
  asking_rent_sf?: number;
  lease_type?: LeaseType;
  features?: string[];
  amenities?: string[];
  gsa_eligible?: boolean;
  set_aside_eligible?: SetAsideType[];
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
 * Public Broker Listing (excludes private contact information)
 * Used for public API responses and map/listing displays
 */
export type PublicBrokerListing = Omit<
  BrokerListing,
  'broker_name' | 'broker_company' | 'broker_email' | 'broker_phone' | 'license_number' | 'brokerage_company'
>;

/**
 * Response for single broker listing
 */
export interface BrokerListingResponse {
  success: boolean;
  data?: BrokerListing;
  error?: string;
}

/**
 * Response for public broker listing (without contact info)
 */
export interface PublicBrokerListingResponse {
  success: boolean;
  data?: PublicBrokerListing;
  error?: string;
}

/**
 * Response for listing public broker listings
 */
export interface PublicBrokerListingsResponse {
  success: boolean;
  data?: PublicBrokerListing[];
  error?: string;
  meta?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
