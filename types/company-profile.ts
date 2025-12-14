export type BusinessType =
  | "small_business"
  | "minority_owned"
  | "veteran_owned"
  | "woman_owned"
  | "disadvantaged"
  | "tribal"
  | "other";

export type SetAsideCertification =
  | "8a"
  | "sdvosb"
  | "wosb"
  | "edwosb"
  | "hubzone"
  | "vosb"
  | "sdb"
  | "abilityone";

export type ClearanceLevel =
  | "none"
  | "confidential"
  | "secret"
  | "top_secret"
  | "ts_sci";

export interface KeyPersonnel {
  name: string;
  title: string;
  clearance?: ClearanceLevel;
  certifications?: string[];
  years_experience?: number;
}

export interface CompanyProfile {
  id: string;
  user_id: string;

  // Basic Information
  company_name: string;
  duns_number: string | null;
  uei_number: string | null;
  cage_code: string | null;

  // Classifications
  business_types: BusinessType[];
  set_aside_certifications: SetAsideCertification[];

  // NAICS Codes
  naics_codes: string[];
  primary_naics: string | null;

  // Experience
  years_in_business: number | null;
  federal_experience_years: number | null;
  largest_contract_value: number | null;
  contracts_completed: number;

  // Capabilities
  clearance_level: ClearanceLevel | null;
  cleared_facility: boolean;
  geographic_coverage: string[];

  // Financial
  annual_revenue: number | null;
  bonding_capacity: number | null;

  // Team
  employee_count: number | null;
  key_personnel: KeyPersonnel[];

  // Competencies
  core_competencies: string[];
  past_performance_summary: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyProfileInput {
  company_name: string;
  primary_naics?: string;
  duns_number?: string;
  uei_number?: string;
  cage_code?: string;
  business_types?: BusinessType[];
  set_aside_certifications?: SetAsideCertification[];
  naics_codes?: string[];
  years_in_business?: number;
  federal_experience_years?: number;
  clearance_level?: ClearanceLevel;
  geographic_coverage?: string[];
  employee_count?: number;
}

export interface UpdateCompanyProfileInput {
  company_name?: string;
  primary_naics?: string;
  duns_number?: string;
  uei_number?: string;
  cage_code?: string;
  business_types?: BusinessType[];
  set_aside_certifications?: SetAsideCertification[];
  naics_codes?: string[];
  years_in_business?: number;
  federal_experience_years?: number;
  largest_contract_value?: number;
  contracts_completed?: number;
  clearance_level?: ClearanceLevel;
  cleared_facility?: boolean;
  geographic_coverage?: string[];
  annual_revenue?: number;
  bonding_capacity?: number;
  employee_count?: number;
  key_personnel?: KeyPersonnel[];
  core_competencies?: string[];
  past_performance_summary?: string;
}
