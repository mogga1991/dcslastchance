"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type {
  CompanyProfile,
  BusinessType,
  SetAsideCertification,
  ClearanceLevel,
} from "@/types/company-profile";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "small_business", label: "Small Business" },
  { value: "minority_owned", label: "Minority-Owned" },
  { value: "veteran_owned", label: "Veteran-Owned" },
  { value: "woman_owned", label: "Woman-Owned" },
  { value: "disadvantaged", label: "Disadvantaged Business" },
  { value: "tribal", label: "Tribal" },
  { value: "other", label: "Other" },
];

const SET_ASIDE_CERTIFICATIONS: { value: SetAsideCertification; label: string }[] = [
  { value: "8a", label: "8(a) Business Development" },
  { value: "sdvosb", label: "Service-Disabled Veteran-Owned (SDVOSB)" },
  { value: "wosb", label: "Women-Owned Small Business (WOSB)" },
  { value: "edwosb", label: "Economically Disadvantaged WOSB" },
  { value: "hubzone", label: "HUBZone" },
  { value: "vosb", label: "Veteran-Owned Small Business (VOSB)" },
  { value: "sdb", label: "Small Disadvantaged Business (SDB)" },
  { value: "abilityone", label: "AbilityOne" },
];

export function CompanyProfileForm() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [dunsNumber, setDunsNumber] = useState("");
  const [ueiNumber, setUeiNumber] = useState("");
  const [cageCode, setCageCode] = useState("");
  const [primaryNaics, setPrimaryNaics] = useState("");
  const [naicsCodes, setNaicsCodes] = useState("");
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [certifications, setCertifications] = useState<SetAsideCertification[]>([]);
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [federalExperience, setFederalExperience] = useState("");
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevel | "">("");
  const [clearedFacility, setClearedFacility] = useState(false);
  const [geographicCoverage, setGeographicCoverage] = useState<string[]>([]);
  const [employeeCount, setEmployeeCount] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [coreCompetencies, setCoreCompetencies] = useState("");
  const [pastPerformanceSummary, setPastPerformanceSummary] = useState("");

  // Fetch existing profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/company-profile");

      if (response.ok) {
        const data = await response.json();
        if (data.has_profile && data.profile) {
          setProfile(data.profile);
          setHasProfile(true);
          loadFormData(data.profile);
        } else {
          setHasProfile(false);
        }
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load company profile");
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = (profile: CompanyProfile) => {
    setCompanyName(profile.company_name);
    setDunsNumber(profile.duns_number || "");
    setUeiNumber(profile.uei_number || "");
    setCageCode(profile.cage_code || "");
    setPrimaryNaics(profile.primary_naics || "");
    setNaicsCodes(profile.naics_codes?.join(", ") || "");
    setBusinessTypes(profile.business_types || []);
    setCertifications(profile.set_aside_certifications || []);
    setYearsInBusiness(profile.years_in_business?.toString() || "");
    setFederalExperience(profile.federal_experience_years?.toString() || "");
    setClearanceLevel(profile.clearance_level || "");
    setClearedFacility(profile.cleared_facility || false);
    setGeographicCoverage(profile.geographic_coverage || []);
    setEmployeeCount(profile.employee_count?.toString() || "");
    setAnnualRevenue(profile.annual_revenue?.toString() || "");
    setCoreCompetencies(profile.core_competencies?.join(", ") || "");
    setPastPerformanceSummary(profile.past_performance_summary || "");
  };

  const handleSave = async () => {
    // Validate required fields
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    if (primaryNaics && !/^\d{6}$/.test(primaryNaics)) {
      toast.error("Primary NAICS must be a 6-digit code");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        company_name: companyName,
        duns_number: dunsNumber || null,
        uei_number: ueiNumber || null,
        cage_code: cageCode || null,
        primary_naics: primaryNaics || null,
        naics_codes: naicsCodes.split(",").map(c => c.trim()).filter(Boolean),
        business_types: businessTypes,
        set_aside_certifications: certifications,
        years_in_business: yearsInBusiness ? parseInt(yearsInBusiness) : null,
        federal_experience_years: federalExperience ? parseInt(federalExperience) : null,
        clearance_level: clearanceLevel || null,
        cleared_facility: clearedFacility,
        geographic_coverage: geographicCoverage,
        employee_count: employeeCount ? parseInt(employeeCount) : null,
        annual_revenue: annualRevenue ? parseFloat(annualRevenue) : null,
        core_competencies: coreCompetencies.split(",").map(c => c.trim()).filter(Boolean),
        past_performance_summary: pastPerformanceSummary || null,
      };

      const method = hasProfile ? "PATCH" : "POST";
      const response = await fetch("/api/company-profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      setHasProfile(true);
      toast.success(data.message || "Company profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle>Basic Information</CardTitle>
          </div>
          <CardDescription>
            Core company details and identifiers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Name LLC"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dunsNumber">DUNS Number</Label>
              <Input
                id="dunsNumber"
                value={dunsNumber}
                onChange={(e) => setDunsNumber(e.target.value)}
                placeholder="123456789"
                maxLength={9}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ueiNumber">UEI Number</Label>
              <Input
                id="ueiNumber"
                value={ueiNumber}
                onChange={(e) => setUeiNumber(e.target.value.toUpperCase())}
                placeholder="ABC123DEF456"
                maxLength={12}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cageCode">CAGE Code</Label>
              <Input
                id="cageCode"
                value={cageCode}
                onChange={(e) => setCageCode(e.target.value.toUpperCase())}
                placeholder="1AB23"
                maxLength={5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NAICS Codes */}
      <Card>
        <CardHeader>
          <CardTitle>NAICS Codes</CardTitle>
          <CardDescription>
            Industry classification codes that describe what your company does
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryNaics">Primary NAICS Code</Label>
            <Input
              id="primaryNaics"
              value={primaryNaics}
              onChange={(e) => setPrimaryNaics(e.target.value.replace(/\D/g, ""))}
              placeholder="541511"
              maxLength={6}
            />
            <p className="text-xs text-gray-500">Must be exactly 6 digits</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="naicsCodes">Additional NAICS Codes</Label>
            <Input
              id="naicsCodes"
              value={naicsCodes}
              onChange={(e) => setNaicsCodes(e.target.value)}
              placeholder="541512, 541513, 541519"
            />
            <p className="text-xs text-gray-500">Comma-separated list</p>
          </div>
        </CardContent>
      </Card>

      {/* Business Classifications */}
      <Card>
        <CardHeader>
          <CardTitle>Business Classifications</CardTitle>
          <CardDescription>
            Select all that apply to your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Business Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BUSINESS_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`business-${type.value}`}
                    checked={businessTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setBusinessTypes([...businessTypes, type.value]);
                      } else {
                        setBusinessTypes(businessTypes.filter((t) => t !== type.value));
                      }
                    }}
                  />
                  <Label
                    htmlFor={`business-${type.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Set-Aside Certifications</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SET_ASIDE_CERTIFICATIONS.map((cert) => (
                <div key={cert.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cert-${cert.value}`}
                    checked={certifications.includes(cert.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCertifications([...certifications, cert.value]);
                      } else {
                        setCertifications(certifications.filter((c) => c !== cert.value));
                      }
                    }}
                  />
                  <Label
                    htmlFor={`cert-${cert.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {cert.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience & Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Experience & Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                placeholder="10"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="federalExperience">Federal Experience (Years)</Label>
              <Input
                id="federalExperience"
                type="number"
                value={federalExperience}
                onChange={(e) => setFederalExperience(e.target.value)}
                placeholder="5"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clearanceLevel">Clearance Level</Label>
              <Select value={clearanceLevel} onValueChange={(value) => setClearanceLevel(value as ClearanceLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="secret">Secret</SelectItem>
                  <SelectItem value="top_secret">Top Secret</SelectItem>
                  <SelectItem value="ts_sci">TS/SCI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCount">Employee Count</Label>
              <Input
                id="employeeCount"
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="50"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="clearedFacility"
              checked={clearedFacility}
              onCheckedChange={(checked) => setClearedFacility(checked as boolean)}
            />
            <Label htmlFor="clearedFacility" className="font-normal cursor-pointer">
              We have a cleared facility
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Coverage</CardTitle>
          <CardDescription>
            States/regions where you can provide services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {US_STATES.map((state) => (
              <div key={state} className="flex items-center space-x-2">
                <Checkbox
                  id={`state-${state}`}
                  checked={geographicCoverage.includes(state)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setGeographicCoverage([...geographicCoverage, state]);
                    } else {
                      setGeographicCoverage(geographicCoverage.filter((s) => s !== state));
                    }
                  }}
                />
                <Label htmlFor={`state-${state}`} className="text-sm font-normal cursor-pointer">
                  {state}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Core Competencies */}
      <Card>
        <CardHeader>
          <CardTitle>Core Competencies & Past Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coreCompetencies">Core Competencies</Label>
            <Input
              id="coreCompetencies"
              value={coreCompetencies}
              onChange={(e) => setCoreCompetencies(e.target.value)}
              placeholder="Cloud Computing, Cybersecurity, IT Consulting"
            />
            <p className="text-xs text-gray-500">Comma-separated list</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pastPerformanceSummary">Past Performance Summary</Label>
            <Textarea
              id="pastPerformanceSummary"
              value={pastPerformanceSummary}
              onChange={(e) => setPastPerformanceSummary(e.target.value)}
              placeholder="Brief description of your company's relevant past performance..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualRevenue">Annual Revenue</Label>
            <Input
              id="annualRevenue"
              type="number"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(e.target.value)}
              placeholder="5000000"
              min="0"
            />
            <p className="text-xs text-gray-500">In dollars (e.g., 5000000 for $5M)</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {hasProfile && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Profile saved</span>
            </div>
          )}
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>{hasProfile ? "Update Profile" : "Create Profile"}</>
          )}
        </Button>
      </div>
    </div>
  );
}
