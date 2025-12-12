import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  numeric,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  // Multi-tenant and role fields
  role: text("role").default("contractor"),
  organization_id: text("organization_id"),
  account_manager_id: text("account_manager_id"),
  total_earnings: numeric("total_earnings").default("0"),
  pending_earnings: numeric("pending_earnings").default("0"),
  analysis_credits: integer("analysis_credits").default(3),
  subscription_tier: text("subscription_tier").default("free"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Subscription table for Polar webhook data
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// Sentyr Tables
export const organization = pgTable("organization", {
  id: text("id").primaryKey().default(sql`(gen_random_uuid())::text`),
  name: text("name").notNull(),
  duns_number: text("duns_number"),
  cage_code: text("cage_code"),
  sam_uei: text("sam_uei").unique(),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  phone: text("phone"),
  owner_id: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const companyProfile = pgTable("company_profile", {
  id: text("id").primaryKey().default(sql`(gen_random_uuid())::text`),
  user_id: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  organization_id: text("organization_id").references(() => organization.id, { onDelete: "set null" }),
  naics_codes: text("naics_codes").array().default(sql`'{}'::text[]`),
  primary_naics: text("primary_naics"),
  core_competencies: text("core_competencies").array().default(sql`'{}'::text[]`),
  keywords: text("keywords").array().default(sql`'{}'::text[]`),
  service_areas: text("service_areas").array().default(sql`'{}'::text[]`),
  certifications: text("certifications").array().default(sql`'{}'::text[]`),
  set_asides: text("set_asides").array().default(sql`'{}'::text[]`),
  is_small_business: boolean("is_small_business").default(true),
  employee_count: integer("employee_count"),
  annual_revenue: numeric("annual_revenue"),
  preferred_agencies: text("preferred_agencies").array().default(sql`'{}'::text[]`),
  excluded_agencies: text("excluded_agencies").array().default(sql`'{}'::text[]`),
  min_contract_value: numeric("min_contract_value").default(sql`0`),
  max_contract_value: numeric("max_contract_value").default(sql`999999999`),
  preferred_states: text("preferred_states").array().default(sql`'{}'::text[]`),
  remote_work_capable: boolean("remote_work_capable").default(true),
  current_contracts: integer("current_contracts").default(0),
  max_concurrent_contracts: integer("max_concurrent_contracts").default(10),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const opportunity = pgTable("opportunity", {
  id: text("id").primaryKey().default(sql`(gen_random_uuid())::text`),
  notice_id: text("notice_id").unique(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  sol_number: text("sol_number"),
  agency: text("agency"),
  sub_agency: text("sub_agency"),
  office: text("office"),
  naics_code: text("naics_code"),
  psc_code: text("psc_code"),
  set_aside: text("set_aside"),
  set_aside_code: text("set_aside_code"),
  estimated_value: numeric("estimated_value"),
  award_floor: numeric("award_floor"),
  award_ceiling: numeric("award_ceiling"),
  posted_date: timestamp("posted_date"),
  response_deadline: timestamp("response_deadline"),
  archive_date: timestamp("archive_date"),
  place_of_performance: text("place_of_performance"),
  pop_state: text("pop_state"),
  pop_city: text("pop_city"),
  pop_zip: text("pop_zip"),
  pop_country: text("pop_country").default("USA"),
  url: text("url"),
  resource_links: jsonb("resource_links").default(sql`'[]'::jsonb`),
  status: text("status").default("active"),
  active: boolean("active").default(true),
  raw_data: jsonb("raw_data"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const opportunityMatch = pgTable("opportunity_match", {
  id: text("id").primaryKey().default(sql`(gen_random_uuid())::text`),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  opportunity_id: text("opportunity_id").notNull().references(() => opportunity.id, { onDelete: "cascade" }),
  company_profile_id: text("company_profile_id").references(() => companyProfile.id, { onDelete: "cascade" }),
  overall_score: integer("overall_score").notNull(),
  grade: text("grade"),
  recommendation: text("recommendation"),
  naics_score: integer("naics_score"),
  capability_score: integer("capability_score"),
  set_aside_score: integer("set_aside_score"),
  past_performance_score: integer("past_performance_score"),
  geographic_score: integer("geographic_score"),
  capacity_score: integer("capacity_score"),
  value_fit_score: integer("value_fit_score"),
  agency_preference_score: integer("agency_preference_score"),
  strengths: text("strengths").array().default(sql`'{}'::text[]`),
  weaknesses: text("weaknesses").array().default(sql`'{}'::text[]`),
  gaps: text("gaps").array().default(sql`'{}'::text[]`),
  matching_capabilities: text("matching_capabilities").array().default(sql`'{}'::text[]`),
  relevant_past_performance: text("relevant_past_performance").array().default(sql`'{}'::text[]`),
  ai_analysis: jsonb("ai_analysis"),
  win_probability: integer("win_probability"),
  user_action: text("user_action"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ProposalIQ Analysis table
export const analysis = pgTable("analysis", {
  id: text("id").primaryKey().default(sql`(gen_random_uuid())::text`),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  organization_id: text("organization_id").references(() => organization.id, { onDelete: "set null" }),
  opportunity_id: text("opportunity_id").references(() => opportunity.id, { onDelete: "set null" }),
  document_name: text("document_name"),
  document_url: text("document_url"),
  document_type: text("document_type"),
  extracted_data: jsonb("extracted_data").notNull().default(sql`'{}'::jsonb`),
  bid_score: integer("bid_score"),
  bid_recommendation: text("bid_recommendation"),
  score_breakdown: jsonb("score_breakdown").default(sql`'{}'::jsonb`),
  ai_analysis: jsonb("ai_analysis").default(sql`'{}'::jsonb`),
  strengths: text("strengths").array().default(sql`'{}'::text[]`),
  weaknesses: text("weaknesses").array().default(sql`'{}'::text[]`),
  gaps: text("gaps").array().default(sql`'{}'::text[]`),
  recommended_actions: text("recommended_actions").array().default(sql`'{}'::text[]`),
  compliance_matrix: jsonb("compliance_matrix").default(sql`'[]'::jsonb`),
  status: text("status").default("draft"),
  decision: text("decision"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Credit transaction tracking
export const creditTransaction = pgTable("credit_transaction", {
  id: text("id").primaryKey().default(sql`(gen_random_uuid())::text`),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'credit' or 'debit'
  amount: integer("amount").notNull(),
  balance_after: integer("balance_after").notNull(),
  description: text("description"),
  reference_id: text("reference_id"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
