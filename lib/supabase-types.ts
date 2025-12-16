export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      broker_listings: {
        Row: {
          ada_accessible: boolean | null
          amenities: string[] | null
          asking_rent_sf: number | null
          available_date: string
          available_sf: number
          broker_company: string | null
          broker_email: string
          broker_name: string | null
          broker_phone: string | null
          brokerage_company: string | null
          building_class: Database["public"]["Enums"]["building_class"] | null
          city: string
          created_at: string | null
          description: string | null
          features: string[] | null
          federal_score: number | null
          federal_score_data: Json | null
          gsa_eligible: boolean | null
          id: string
          images: string[] | null
          latitude: number
          lease_type: Database["public"]["Enums"]["lease_type"] | null
          leed_certified: boolean | null
          license_number: string | null
          lister_role: Database["public"]["Enums"]["lister_role"] | null
          longitude: number
          min_divisible_sf: number | null
          notes: string | null
          parking_spaces: number | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          published_at: string | null
          set_aside_eligible: string[] | null
          state: string
          status: Database["public"]["Enums"]["listing_status"]
          street_address: string
          suite_unit: string | null
          title: string | null
          total_sf: number
          updated_at: string | null
          user_id: string
          views_count: number | null
          year_built: number | null
          zipcode: string
        }
        Insert: {
          ada_accessible?: boolean | null
          amenities?: string[] | null
          asking_rent_sf?: number | null
          available_date: string
          available_sf: number
          broker_company?: string | null
          broker_email: string
          broker_name?: string | null
          broker_phone?: string | null
          brokerage_company?: string | null
          building_class?: Database["public"]["Enums"]["building_class"] | null
          city: string
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          federal_score?: number | null
          federal_score_data?: Json | null
          gsa_eligible?: boolean | null
          id?: string
          images?: string[] | null
          latitude: number
          lease_type?: Database["public"]["Enums"]["lease_type"] | null
          leed_certified?: boolean | null
          license_number?: string | null
          lister_role?: Database["public"]["Enums"]["lister_role"] | null
          longitude: number
          min_divisible_sf?: number | null
          notes?: string | null
          parking_spaces?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          published_at?: string | null
          set_aside_eligible?: string[] | null
          state: string
          status?: Database["public"]["Enums"]["listing_status"]
          street_address: string
          suite_unit?: string | null
          title?: string | null
          total_sf: number
          updated_at?: string | null
          user_id: string
          views_count?: number | null
          year_built?: number | null
          zipcode: string
        }
        Update: {
          ada_accessible?: boolean | null
          amenities?: string[] | null
          asking_rent_sf?: number | null
          available_date?: string
          available_sf?: number
          broker_company?: string | null
          broker_email?: string
          broker_name?: string | null
          broker_phone?: string | null
          brokerage_company?: string | null
          building_class?: Database["public"]["Enums"]["building_class"] | null
          city?: string
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          federal_score?: number | null
          federal_score_data?: Json | null
          gsa_eligible?: boolean | null
          id?: string
          images?: string[] | null
          latitude?: number
          lease_type?: Database["public"]["Enums"]["lease_type"] | null
          leed_certified?: boolean | null
          license_number?: string | null
          lister_role?: Database["public"]["Enums"]["lister_role"] | null
          longitude?: number
          min_divisible_sf?: number | null
          notes?: string | null
          parking_spaces?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          published_at?: string | null
          set_aside_eligible?: string[] | null
          state?: string
          status?: Database["public"]["Enums"]["listing_status"]
          street_address?: string
          suite_unit?: string | null
          title?: string | null
          total_sf?: number
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
          year_built?: number | null
          zipcode?: string
        }
        Relationships: []
      }
      broker_profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          gov_references: Json | null
          government_lease_experience: boolean | null
          government_leases_count: number | null
          gsa_certified: boolean | null
          id: string
          license_number: string | null
          license_state: string | null
          phone: string | null
          preferred_agencies: string[] | null
          preferred_states: string[] | null
          total_portfolio_sqft: number | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          willing_to_build_to_suit: boolean | null
          willing_to_provide_improvements: boolean | null
          years_in_business: number | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          gov_references?: Json | null
          government_lease_experience?: boolean | null
          government_leases_count?: number | null
          gsa_certified?: boolean | null
          id?: string
          license_number?: string | null
          license_state?: string | null
          phone?: string | null
          preferred_agencies?: string[] | null
          preferred_states?: string[] | null
          total_portfolio_sqft?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          willing_to_build_to_suit?: boolean | null
          willing_to_provide_improvements?: boolean | null
          years_in_business?: number | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          gov_references?: Json | null
          government_lease_experience?: boolean | null
          government_leases_count?: number | null
          gsa_certified?: boolean | null
          id?: string
          license_number?: string | null
          license_state?: string | null
          phone?: string | null
          preferred_agencies?: string[] | null
          preferred_states?: string[] | null
          total_portfolio_sqft?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          willing_to_build_to_suit?: boolean | null
          willing_to_provide_improvements?: boolean | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      capability_documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_type: string
          file_size_bytes: number | null
          filename: string
          id: string
          mime_type: string | null
          org_id: string
          processing_error: string | null
          status: string | null
          storage_url: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_type: string
          file_size_bytes?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          org_id: string
          processing_error?: string | null
          status?: string | null
          storage_url: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          file_size_bytes?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          org_id?: string
          processing_error?: string | null
          status?: string | null
          storage_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      capability_facts: {
        Row: {
          citation: Json
          confidence: number | null
          created_at: string | null
          fact_key: string
          fact_type: string
          fact_value: Json
          id: string
          org_id: string
        }
        Insert: {
          citation: Json
          confidence?: number | null
          created_at?: string | null
          fact_key: string
          fact_type: string
          fact_value: Json
          id?: string
          org_id: string
        }
        Update: {
          citation?: Json
          confidence?: number | null
          created_at?: string | null
          fact_key?: string
          fact_type?: string
          fact_value?: Json
          id?: string
          org_id?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          annual_revenue: number | null
          bonding_capacity: number | null
          business_types: string[] | null
          cage_code: string | null
          clearance_level: string | null
          cleared_facility: boolean | null
          company_name: string
          contracts_completed: number | null
          core_competencies: string[] | null
          created_at: string | null
          duns_number: string | null
          employee_count: number | null
          federal_experience_years: number | null
          geographic_coverage: string[] | null
          id: string
          key_personnel: Json | null
          largest_contract_value: number | null
          naics_codes: string[] | null
          past_performance_summary: string | null
          primary_naics: string | null
          set_aside_certifications: string[] | null
          uei_number: string | null
          updated_at: string | null
          user_id: string
          years_in_business: number | null
        }
        Insert: {
          annual_revenue?: number | null
          bonding_capacity?: number | null
          business_types?: string[] | null
          cage_code?: string | null
          clearance_level?: string | null
          cleared_facility?: boolean | null
          company_name: string
          contracts_completed?: number | null
          core_competencies?: string[] | null
          created_at?: string | null
          duns_number?: string | null
          employee_count?: number | null
          federal_experience_years?: number | null
          geographic_coverage?: string[] | null
          id?: string
          key_personnel?: Json | null
          largest_contract_value?: number | null
          naics_codes?: string[] | null
          past_performance_summary?: string | null
          primary_naics?: string | null
          set_aside_certifications?: string[] | null
          uei_number?: string | null
          updated_at?: string | null
          user_id: string
          years_in_business?: number | null
        }
        Update: {
          annual_revenue?: number | null
          bonding_capacity?: number | null
          business_types?: string[] | null
          cage_code?: string | null
          clearance_level?: string | null
          cleared_facility?: boolean | null
          company_name?: string
          contracts_completed?: number | null
          core_competencies?: string[] | null
          created_at?: string | null
          duns_number?: string | null
          employee_count?: number | null
          federal_experience_years?: number | null
          geographic_coverage?: string[] | null
          id?: string
          key_personnel?: Json | null
          largest_contract_value?: number | null
          naics_codes?: string[] | null
          past_performance_summary?: string | null
          primary_naics?: string | null
          set_aside_certifications?: string[] | null
          uei_number?: string | null
          updated_at?: string | null
          user_id?: string
          years_in_business?: number | null
        }
        Relationships: []
      }
      constraints_policies: {
        Row: {
          created_at: string | null
          id: string
          internal_approval_notes: string | null
          org_id: string
          prohibited_claims: Json | null
          prohibited_scopes: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          internal_approval_notes?: string | null
          org_id: string
          prohibited_claims?: Json | null
          prohibited_scopes?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          internal_approval_notes?: string | null
          org_id?: string
          prohibited_claims?: Json | null
          prohibited_scopes?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contractor_profiles: {
        Row: {
          business_size: string | null
          cage: string | null
          contract_size_max: number | null
          contract_size_min: number | null
          created_at: string | null
          dba_name: string | null
          headcount_1099: number | null
          headcount_ft: number | null
          headcount_pt: number | null
          id: string
          legal_name: string
          mobilization_days: number | null
          naics_primary: string | null
          naics_secondary: Json | null
          org_id: string
          psc_codes: Json | null
          sam_expiration_date: string | null
          sam_status: string | null
          self_perform_pct: number | null
          service_areas: Json | null
          socio_status: Json | null
          surge_capacity_notes: string | null
          typical_contract_types: Json | null
          uei: string | null
          updated_at: string | null
        }
        Insert: {
          business_size?: string | null
          cage?: string | null
          contract_size_max?: number | null
          contract_size_min?: number | null
          created_at?: string | null
          dba_name?: string | null
          headcount_1099?: number | null
          headcount_ft?: number | null
          headcount_pt?: number | null
          id?: string
          legal_name: string
          mobilization_days?: number | null
          naics_primary?: string | null
          naics_secondary?: Json | null
          org_id: string
          psc_codes?: Json | null
          sam_expiration_date?: string | null
          sam_status?: string | null
          self_perform_pct?: number | null
          service_areas?: Json | null
          socio_status?: Json | null
          surge_capacity_notes?: string | null
          typical_contract_types?: Json | null
          uei?: string | null
          updated_at?: string | null
        }
        Update: {
          business_size?: string | null
          cage?: string | null
          contract_size_max?: number | null
          contract_size_min?: number | null
          created_at?: string | null
          dba_name?: string | null
          headcount_1099?: number | null
          headcount_ft?: number | null
          headcount_pt?: number | null
          id?: string
          legal_name?: string
          mobilization_days?: number | null
          naics_primary?: string | null
          naics_secondary?: Json | null
          org_id?: string
          psc_codes?: Json | null
          sam_expiration_date?: string | null
          sam_status?: string | null
          self_perform_pct?: number | null
          service_areas?: Json | null
          socio_status?: Json | null
          surge_capacity_notes?: string | null
          typical_contract_types?: Json | null
          uei?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_pages: {
        Row: {
          created_at: string | null
          document_version_id: string
          id: string
          offsets: Json | null
          page_number: number
          text_content: string | null
        }
        Insert: {
          created_at?: string | null
          document_version_id: string
          id?: string
          offsets?: Json | null
          page_number: number
          text_content?: string | null
        }
        Update: {
          created_at?: string | null
          document_version_id?: string
          id?: string
          offsets?: Json | null
          page_number?: number
          text_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_pages_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          checksum: string
          created_at: string | null
          document_id: string
          id: string
          version: number
        }
        Insert: {
          checksum: string
          created_at?: string | null
          document_id: string
          id?: string
          version?: number
        }
        Update: {
          checksum?: string
          created_at?: string | null
          document_id?: string
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "capability_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      key_personnel: {
        Row: {
          certifications: Json | null
          clearance_status: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          resume_document_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          certifications?: Json | null
          clearance_status?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          resume_document_id?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          certifications?: Json | null
          clearance_status?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          resume_document_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "key_personnel_resume_document_id_fkey"
            columns: ["resume_document_id"]
            isOneToOne: false
            referencedRelation: "capability_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          active: string | null
          additional_info_link: string | null
          archive_date: string | null
          archive_type: string | null
          base_type: string | null
          classification_code: string | null
          created_at: string | null
          department: string | null
          description: string | null
          full_data: Json | null
          id: string
          last_synced_at: string | null
          naics_code: string | null
          notice_id: string
          office: string | null
          office_city: string | null
          office_country_code: string | null
          office_state: string | null
          office_zipcode: string | null
          organization_type: string | null
          pop_city_code: string | null
          pop_city_name: string | null
          pop_country_code: string | null
          pop_country_name: string | null
          pop_state_code: string | null
          pop_state_name: string | null
          pop_street_address: string | null
          pop_zip: string | null
          posted_date: string | null
          response_deadline: string | null
          solicitation_number: string | null
          source: string
          sub_tier: string | null
          title: string
          type: string | null
          type_of_set_aside: string | null
          type_of_set_aside_description: string | null
          ui_link: string | null
          updated_at: string | null
        }
        Insert: {
          active?: string | null
          additional_info_link?: string | null
          archive_date?: string | null
          archive_type?: string | null
          base_type?: string | null
          classification_code?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          full_data?: Json | null
          id?: string
          last_synced_at?: string | null
          naics_code?: string | null
          notice_id: string
          office?: string | null
          office_city?: string | null
          office_country_code?: string | null
          office_state?: string | null
          office_zipcode?: string | null
          organization_type?: string | null
          pop_city_code?: string | null
          pop_city_name?: string | null
          pop_country_code?: string | null
          pop_country_name?: string | null
          pop_state_code?: string | null
          pop_state_name?: string | null
          pop_street_address?: string | null
          pop_zip?: string | null
          posted_date?: string | null
          response_deadline?: string | null
          solicitation_number?: string | null
          source?: string
          sub_tier?: string | null
          title: string
          type?: string | null
          type_of_set_aside?: string | null
          type_of_set_aside_description?: string | null
          ui_link?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: string | null
          additional_info_link?: string | null
          archive_date?: string | null
          archive_type?: string | null
          base_type?: string | null
          classification_code?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          full_data?: Json | null
          id?: string
          last_synced_at?: string | null
          naics_code?: string | null
          notice_id?: string
          office?: string | null
          office_city?: string | null
          office_country_code?: string | null
          office_state?: string | null
          office_zipcode?: string | null
          organization_type?: string | null
          pop_city_code?: string | null
          pop_city_name?: string | null
          pop_country_code?: string | null
          pop_country_name?: string | null
          pop_state_code?: string | null
          pop_state_name?: string | null
          pop_street_address?: string | null
          pop_zip?: string | null
          posted_date?: string | null
          response_deadline?: string | null
          solicitation_number?: string | null
          source?: string
          sub_tier?: string | null
          title?: string
          type?: string | null
          type_of_set_aside?: string | null
          type_of_set_aside_description?: string | null
          ui_link?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      opportunity_inquiries: {
        Row: {
          broker_listing_id: string | null
          created_at: string | null
          id: string
          message: string | null
          opportunity_id: string
          opportunity_title: string
          property_address: string
          status: string
          updated_at: string | null
          user_email: string
          user_id: string
          user_phone: string | null
        }
        Insert: {
          broker_listing_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          opportunity_id: string
          opportunity_title: string
          property_address: string
          status?: string
          updated_at?: string | null
          user_email: string
          user_id: string
          user_phone?: string | null
        }
        Update: {
          broker_listing_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          opportunity_id?: string
          opportunity_title?: string
          property_address?: string
          status?: string
          updated_at?: string | null
          user_email?: string
          user_id?: string
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_inquiries_broker_listing_id_fkey"
            columns: ["broker_listing_id"]
            isOneToOne: false
            referencedRelation: "broker_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      past_performance_projects: {
        Row: {
          contract_number: string | null
          contract_value: number | null
          created_at: string | null
          customer_name: string
          id: string
          org_id: string
          outcomes_metrics: string | null
          place_of_performance: string | null
          pop_end: string | null
          pop_start: string | null
          reference_contact: Json | null
          scope_summary: string
          supporting_document_ids: Json | null
          updated_at: string | null
        }
        Insert: {
          contract_number?: string | null
          contract_value?: number | null
          created_at?: string | null
          customer_name: string
          id?: string
          org_id: string
          outcomes_metrics?: string | null
          place_of_performance?: string | null
          pop_end?: string | null
          pop_start?: string | null
          reference_contact?: Json | null
          scope_summary: string
          supporting_document_ids?: Json | null
          updated_at?: string | null
        }
        Update: {
          contract_number?: string | null
          contract_value?: number | null
          created_at?: string | null
          customer_name?: string
          id?: string
          org_id?: string
          outcomes_metrics?: string | null
          place_of_performance?: string | null
          pop_end?: string | null
          pop_start?: string | null
          reference_contact?: Json | null
          scope_summary?: string
          supporting_document_ids?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      piq_analysis: {
        Row: {
          analysis: Json
          created_at: string
          created_by: string | null
          document_id: string | null
          id: string
          opportunity_id: string
          org_id: string
          schema_version: string
        }
        Insert: {
          analysis: Json
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          id?: string
          opportunity_id: string
          org_id: string
          schema_version?: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          id?: string
          opportunity_id?: string
          org_id?: string
          schema_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "piq_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "piq_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piq_analysis_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "piq_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piq_analysis_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      piq_company_profiles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          profile: Json
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          profile: Json
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          profile?: Json
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "piq_company_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      piq_compliance_matrices: {
        Row: {
          analysis_id: string | null
          created_at: string
          created_by: string | null
          id: string
          matrix: Json
          opportunity_id: string
          org_id: string
          schema_version: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          matrix: Json
          opportunity_id: string
          org_id: string
          schema_version?: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          matrix?: Json
          opportunity_id?: string
          org_id?: string
          schema_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "piq_compliance_matrices_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "piq_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piq_compliance_matrices_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "piq_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piq_compliance_matrices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      piq_documents: {
        Row: {
          created_at: string
          extracted_meta: Json
          extracted_text: string | null
          filename: string
          id: string
          mime_type: string | null
          opportunity_id: string
          org_id: string
          page_count: number | null
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          extracted_meta?: Json
          extracted_text?: string | null
          filename: string
          id?: string
          mime_type?: string | null
          opportunity_id: string
          org_id: string
          page_count?: number | null
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          created_at?: string
          extracted_meta?: Json
          extracted_text?: string | null
          filename?: string
          id?: string
          mime_type?: string | null
          opportunity_id?: string
          org_id?: string
          page_count?: number | null
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "piq_documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "piq_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piq_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      piq_opportunities: {
        Row: {
          agency: string | null
          created_at: string
          due_date: string | null
          id: string
          notice_id: string | null
          org_id: string
          posted_date: string | null
          raw: Json
          solicitation_number: string | null
          source: string
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          agency?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notice_id?: string | null
          org_id: string
          posted_date?: string | null
          raw?: Json
          solicitation_number?: string | null
          source?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          agency?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notice_id?: string | null
          org_id?: string
          posted_date?: string | null
          raw?: Json
          solicitation_number?: string | null
          source?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "piq_opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      piq_scorecards: {
        Row: {
          analysis_id: string | null
          created_at: string
          created_by: string | null
          id: string
          opportunity_id: string
          org_id: string
          schema_version: string
          scorecard: Json
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          opportunity_id: string
          org_id: string
          schema_version?: string
          scorecard: Json
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          opportunity_id?: string
          org_id?: string
          schema_version?: string
          scorecard?: Json
        }
        Relationships: [
          {
            foreignKeyName: "piq_scorecards_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "piq_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piq_scorecards_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "piq_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piq_scorecards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          ada_compliant: boolean | null
          address: string | null
          available_date: string | null
          available_floors: number[] | null
          available_sqft: number
          broker_id: string | null
          build_out_weeks_needed: number | null
          building_class: string | null
          certifications: string[] | null
          city: string
          country_code: string | null
          created_at: string | null
          description: string | null
          documents: string[] | null
          featured: boolean | null
          features: Json | null
          floor_plans: string[] | null
          id: string
          images: string[] | null
          inquiries: number | null
          is_contiguous: boolean | null
          last_renovated: number | null
          last_synced_at: string | null
          latitude: number | null
          lease_rate_per_sf: number | null
          lease_rate_type: string | null
          longitude: number | null
          max_lease_term_months: number | null
          min_divisible_sqft: number | null
          min_lease_term_months: number | null
          name: string
          operating_expenses_per_sf: number | null
          organization_id: string | null
          owner_id: string | null
          parking_ratio: number | null
          parking_spaces: number | null
          property_type: string
          public_transit_access: boolean | null
          state: string
          status: string | null
          total_floors: number | null
          total_sqft: number
          updated_at: string | null
          usable_sqft: number | null
          views: number | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          ada_compliant?: boolean | null
          address?: string | null
          available_date?: string | null
          available_floors?: number[] | null
          available_sqft: number
          broker_id?: string | null
          build_out_weeks_needed?: number | null
          building_class?: string | null
          certifications?: string[] | null
          city: string
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          documents?: string[] | null
          featured?: boolean | null
          features?: Json | null
          floor_plans?: string[] | null
          id?: string
          images?: string[] | null
          inquiries?: number | null
          is_contiguous?: boolean | null
          last_renovated?: number | null
          last_synced_at?: string | null
          latitude?: number | null
          lease_rate_per_sf?: number | null
          lease_rate_type?: string | null
          longitude?: number | null
          max_lease_term_months?: number | null
          min_divisible_sqft?: number | null
          min_lease_term_months?: number | null
          name: string
          operating_expenses_per_sf?: number | null
          organization_id?: string | null
          owner_id?: string | null
          parking_ratio?: number | null
          parking_spaces?: number | null
          property_type?: string
          public_transit_access?: boolean | null
          state: string
          status?: string | null
          total_floors?: number | null
          total_sqft: number
          updated_at?: string | null
          usable_sqft?: number | null
          views?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          ada_compliant?: boolean | null
          address?: string | null
          available_date?: string | null
          available_floors?: number[] | null
          available_sqft?: number
          broker_id?: string | null
          build_out_weeks_needed?: number | null
          building_class?: string | null
          certifications?: string[] | null
          city?: string
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          documents?: string[] | null
          featured?: boolean | null
          features?: Json | null
          floor_plans?: string[] | null
          id?: string
          images?: string[] | null
          inquiries?: number | null
          is_contiguous?: boolean | null
          last_renovated?: number | null
          last_synced_at?: string | null
          latitude?: number | null
          lease_rate_per_sf?: number | null
          lease_rate_type?: string | null
          longitude?: number | null
          max_lease_term_months?: number | null
          min_divisible_sqft?: number | null
          min_lease_term_months?: number | null
          name?: string
          operating_expenses_per_sf?: number | null
          organization_id?: string | null
          owner_id?: string | null
          parking_ratio?: number | null
          parking_spaces?: number | null
          property_type?: string
          public_transit_access?: boolean | null
          state?: string
          status?: string | null
          total_floors?: number | null
          total_sqft?: number
          updated_at?: string | null
          usable_sqft?: number | null
          views?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: []
      }
      property_scores: {
        Row: {
          calculated_at: string | null
          category_scores: Json
          competitive: boolean | null
          disqualifiers: string[] | null
          expires_at: string | null
          grade: string | null
          id: string
          opportunity_id: string | null
          overall_score: number
          property_id: string | null
          qualified: boolean | null
          recommendations: string[] | null
          strengths: string[] | null
          weaknesses: string[] | null
        }
        Insert: {
          calculated_at?: string | null
          category_scores: Json
          competitive?: boolean | null
          disqualifiers?: string[] | null
          expires_at?: string | null
          grade?: string | null
          id?: string
          opportunity_id?: string | null
          overall_score: number
          property_id?: string | null
          qualified?: boolean | null
          recommendations?: string[] | null
          strengths?: string[] | null
          weaknesses?: string[] | null
        }
        Update: {
          calculated_at?: string | null
          category_scores?: Json
          competitive?: boolean | null
          disqualifiers?: string[] | null
          expires_at?: string | null
          grade?: string | null
          id?: string
          opportunity_id?: string | null
          overall_score?: number
          property_id?: string | null
          qualified?: boolean | null
          recommendations?: string[] | null
          strengths?: string[] | null
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "property_scores_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_scores_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_library_items: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          category: string
          content_rich_text: string
          created_at: string | null
          id: string
          org_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          category: string
          content_rich_text: string
          created_at?: string | null
          id?: string
          org_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          content_rich_text?: string
          created_at?: string | null
          id?: string
          org_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          bid_decision: string | null
          bid_decision_reasoning: string | null
          id: string
          notes: string | null
          notice_id: string
          opportunity_data: Json
          qualification_notes: string | null
          qualification_status: string | null
          saved_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bid_decision?: string | null
          bid_decision_reasoning?: string | null
          id?: string
          notes?: string | null
          notice_id: string
          opportunity_data: Json
          qualification_notes?: string | null
          qualification_status?: string | null
          saved_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bid_decision?: string | null
          bid_decision_reasoning?: string | null
          id?: string
          notes?: string | null
          notice_id?: string
          opportunity_data?: Json
          qualification_notes?: string | null
          qualification_status?: string | null
          saved_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          team_member_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          team_member_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_log_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_earnings: {
        Row: {
          amount: number
          commission_percentage: number | null
          completed_at: string | null
          created_at: string | null
          deal_name: string
          id: string
          status: string | null
          team_member_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          commission_percentage?: number | null
          completed_at?: string | null
          created_at?: string | null
          deal_name: string
          id?: string
          status?: string | null
          team_member_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          commission_percentage?: number | null
          completed_at?: string | null
          created_at?: string | null
          deal_name?: string
          id?: string
          status?: string | null
          team_member_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_earnings_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          ai_matches_found: number | null
          created_at: string | null
          deals_completed: number | null
          discussions_active: number | null
          email: string
          full_name: string
          id: string
          invited_at: string | null
          last_login_at: string | null
          listings_posted: number | null
          owner_id: string
          phone: string | null
          role: string
          status: string | null
          total_earnings: number | null
          total_logins: number | null
          updated_at: string | null
        }
        Insert: {
          ai_matches_found?: number | null
          created_at?: string | null
          deals_completed?: number | null
          discussions_active?: number | null
          email: string
          full_name: string
          id?: string
          invited_at?: string | null
          last_login_at?: string | null
          listings_posted?: number | null
          owner_id: string
          phone?: string | null
          role: string
          status?: string | null
          total_earnings?: number | null
          total_logins?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_matches_found?: number | null
          created_at?: string | null
          deals_completed?: number | null
          discussions_active?: number | null
          email?: string
          full_name?: string
          id?: string
          invited_at?: string | null
          last_login_at?: string | null
          listings_posted?: number | null
          owner_id?: string
          phone?: string | null
          role?: string
          status?: string | null
          total_earnings?: number | null
          total_logins?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_property_scores: { Args: never; Returns: undefined }
      earth: { Args: never; Returns: number }
      get_company_knowledge_base: {
        Args: { user_org_id: string }
        Returns: Json
      }
      get_contractor_profile_completeness: {
        Args: { user_org_id: string }
        Returns: Json
      }
      is_org_member: { Args: { check_org_id: string }; Returns: boolean }
      track_team_member_login: {
        Args: { member_id: string }
        Returns: undefined
      }
    }
    Enums: {
      building_class: "class_a" | "class_b" | "class_c"
      lease_type:
        | "full_service"
        | "modified_gross"
        | "triple_net"
        | "ground_lease"
      lister_role: "owner" | "broker" | "agent" | "salesperson"
      listing_status:
        | "draft"
        | "pending_review"
        | "active"
        | "matched"
        | "under_contract"
        | "leased"
        | "withdrawn"
        | "expired"
      property_type:
        | "office"
        | "warehouse"
        | "retail"
        | "industrial"
        | "medical"
        | "mixed_use"
        | "land"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      building_class: ["class_a", "class_b", "class_c"],
      lease_type: [
        "full_service",
        "modified_gross",
        "triple_net",
        "ground_lease",
      ],
      lister_role: ["owner", "broker", "agent", "salesperson"],
      listing_status: [
        "draft",
        "pending_review",
        "active",
        "matched",
        "under_contract",
        "leased",
        "withdrawn",
        "expired",
      ],
      property_type: [
        "office",
        "warehouse",
        "retail",
        "industrial",
        "medical",
        "mixed_use",
        "land",
        "other",
      ],
    },
  },
} as const
