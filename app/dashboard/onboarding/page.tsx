"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Target, MapPin, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const NAICS_OPTIONS = [
  { code: "541511", name: "Custom Computer Programming Services" },
  { code: "541512", name: "Computer Systems Design Services" },
  { code: "541513", name: "Computer Facilities Management Services" },
  { code: "541519", name: "Other Computer Related Services" },
  { code: "541611", name: "Administrative Management and General Management Consulting Services" },
  { code: "541618", name: "Other Management Consulting Services" },
  { code: "541990", name: "All Other Professional, Scientific, and Technical Services" },
  { code: "561110", name: "Office Administrative Services" },
  { code: "561210", name: "Facilities Support Services" },
  { code: "611420", name: "Computer Training" },
];

const SET_ASIDE_OPTIONS = [
  "8(a)",
  "HUBZone",
  "SDVOSB",
  "WOSB",
  "EDWOSB",
  "SBA",
  "Veteran-Owned",
];

const CERTIFICATIONS = [
  "ISO 9001",
  "ISO 27001",
  "CMMI Level 3",
  "CMMI Level 5",
  "FedRAMP",
  "StateRAMP",
  "SOC 2 Type II",
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

const FEDERAL_AGENCIES = [
  "Department of Defense (DOD)",
  "Department of Homeland Security (DHS)",
  "General Services Administration (GSA)",
  "Department of Veterans Affairs (VA)",
  "Department of Health and Human Services (HHS)",
  "Department of Energy (DOE)",
  "National Aeronautics and Space Administration (NASA)",
  "Department of Transportation (DOT)",
  "Department of Justice (DOJ)",
  "Department of State",
];

interface FormData {
  // Step 1: Business Info
  primary_naics: string;
  naics_codes: string[];
  is_small_business: boolean;
  employee_count: string;
  annual_revenue: string;

  // Step 2: Capabilities
  core_competencies: string[];
  service_areas: string[];
  certifications: string[];
  set_asides: string[];

  // Step 3: Preferences
  preferred_agencies: string[];
  preferred_states: string[];
  min_contract_value: string;
  max_contract_value: string;
  remote_work_capable: boolean;
  max_concurrent_contracts: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    primary_naics: "",
    naics_codes: [],
    is_small_business: true,
    employee_count: "",
    annual_revenue: "",
    core_competencies: [],
    service_areas: [],
    certifications: [],
    set_asides: [],
    preferred_agencies: [],
    preferred_states: [],
    min_contract_value: "100000",
    max_contract_value: "10000000",
    remote_work_capable: true,
    max_concurrent_contracts: "5",
  });

  const [customCompetency, setCustomCompetency] = useState("");
  const [customServiceArea, setCustomServiceArea] = useState("");

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employee_count: parseInt(formData.employee_count) || null,
          annual_revenue: parseFloat(formData.annual_revenue) || null,
          min_contract_value: parseFloat(formData.min_contract_value) || 0,
          max_contract_value: parseFloat(formData.max_contract_value) || 999999999,
          max_concurrent_contracts: parseInt(formData.max_concurrent_contracts) || 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      toast.success("Profile created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomCompetency = () => {
    if (customCompetency.trim() && !formData.core_competencies.includes(customCompetency.trim())) {
      setFormData({
        ...formData,
        core_competencies: [...formData.core_competencies, customCompetency.trim()],
      });
      setCustomCompetency("");
    }
  };

  const addCustomServiceArea = () => {
    if (customServiceArea.trim() && !formData.service_areas.includes(customServiceArea.trim())) {
      setFormData({
        ...formData,
        service_areas: [...formData.service_areas, customServiceArea.trim()],
      });
      setCustomServiceArea("");
    }
  };

  const toggleArrayItem = (key: keyof FormData, value: string) => {
    const currentArray = formData[key] as string[];
    if (currentArray.includes(value)) {
      setFormData({
        ...formData,
        [key]: currentArray.filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [key]: [...currentArray, value],
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-3xl">Welcome to Sentyr</CardTitle>
              <CardDescription>
                Let's set up your company profile to start matching opportunities
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Step {step} of {totalSteps}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Business Information
              </div>

              {/* Primary NAICS */}
              <div className="space-y-2">
                <Label htmlFor="primary_naics">Primary NAICS Code *</Label>
                <select
                  id="primary_naics"
                  value={formData.primary_naics}
                  onChange={(e) => setFormData({ ...formData, primary_naics: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select your primary NAICS code</option>
                  {NAICS_OPTIONS.map((naics) => (
                    <option key={naics.code} value={naics.code}>
                      {naics.code} - {naics.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional NAICS */}
              <div className="space-y-2">
                <Label>Additional NAICS Codes (Optional)</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-md p-4">
                  {NAICS_OPTIONS.map((naics) => (
                    <div key={naics.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={naics.code}
                        checked={formData.naics_codes.includes(naics.code)}
                        onCheckedChange={() => toggleArrayItem("naics_codes", naics.code)}
                      />
                      <label htmlFor={naics.code} className="text-sm cursor-pointer">
                        {naics.code} - {naics.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Small Business Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_small_business"
                  checked={formData.is_small_business}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_small_business: checked as boolean })
                  }
                />
                <label htmlFor="is_small_business" className="text-sm font-medium cursor-pointer">
                  Small Business (under SBA size standards)
                </label>
              </div>

              {/* Employee Count & Revenue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_count">Employee Count</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.employee_count}
                    onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_revenue">Annual Revenue ($)</Label>
                  <Input
                    id="annual_revenue"
                    type="number"
                    placeholder="e.g., 5000000"
                    value={formData.annual_revenue}
                    onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Capabilities */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5" />
                Capabilities & Certifications
              </div>

              {/* Core Competencies */}
              <div className="space-y-2">
                <Label>Core Competencies</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a competency (e.g., Cloud Migration)"
                    value={customCompetency}
                    onChange={(e) => setCustomCompetency(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCompetency())}
                  />
                  <Button type="button" onClick={addCustomCompetency}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.core_competencies.map((comp) => (
                    <Badge
                      key={comp}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("core_competencies", comp)}
                    >
                      {comp} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div className="space-y-2">
                <Label>Service Areas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a service area (e.g., Cybersecurity)"
                    value={customServiceArea}
                    onChange={(e) => setCustomServiceArea(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomServiceArea())}
                  />
                  <Button type="button" onClick={addCustomServiceArea}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.service_areas.map((area) => (
                    <Badge
                      key={area}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("service_areas", area)}
                    >
                      {area} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CERTIFICATIONS.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert}
                        checked={formData.certifications.includes(cert)}
                        onCheckedChange={() => toggleArrayItem("certifications", cert)}
                      />
                      <label htmlFor={cert} className="text-sm cursor-pointer">
                        {cert}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Set-Asides */}
              <div className="space-y-2">
                <Label>Set-Aside Designations</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SET_ASIDE_OPTIONS.map((setAside) => (
                    <div key={setAside} className="flex items-center space-x-2">
                      <Checkbox
                        id={setAside}
                        checked={formData.set_asides.includes(setAside)}
                        onCheckedChange={() => toggleArrayItem("set_asides", setAside)}
                      />
                      <label htmlFor={setAside} className="text-sm cursor-pointer">
                        {setAside}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5" />
                Opportunity Preferences
              </div>

              {/* Preferred Agencies */}
              <div className="space-y-2">
                <Label>Preferred Federal Agencies</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-md p-4">
                  {FEDERAL_AGENCIES.map((agency) => (
                    <div key={agency} className="flex items-center space-x-2">
                      <Checkbox
                        id={agency}
                        checked={formData.preferred_agencies.includes(agency)}
                        onCheckedChange={() => toggleArrayItem("preferred_agencies", agency)}
                      />
                      <label htmlFor={agency} className="text-sm cursor-pointer">
                        {agency}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred States */}
              <div className="space-y-2">
                <Label>Preferred States (Leave empty for nationwide)</Label>
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto border rounded-md p-4">
                  {US_STATES.map((state) => (
                    <div key={state} className="flex items-center space-x-2">
                      <Checkbox
                        id={state}
                        checked={formData.preferred_states.includes(state)}
                        onCheckedChange={() => toggleArrayItem("preferred_states", state)}
                      />
                      <label htmlFor={state} className="text-sm cursor-pointer">
                        {state}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract Value Range */}
              <div className="space-y-2">
                <Label>Contract Value Range ($)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_contract_value" className="text-xs text-muted-foreground">
                      Minimum
                    </Label>
                    <Input
                      id="min_contract_value"
                      type="number"
                      placeholder="100000"
                      value={formData.min_contract_value}
                      onChange={(e) => setFormData({ ...formData, min_contract_value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_contract_value" className="text-xs text-muted-foreground">
                      Maximum
                    </Label>
                    <Input
                      id="max_contract_value"
                      type="number"
                      placeholder="10000000"
                      value={formData.max_contract_value}
                      onChange={(e) => setFormData({ ...formData, max_contract_value: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Remote Work & Max Contracts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote_work_capable"
                    checked={formData.remote_work_capable}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, remote_work_capable: checked as boolean })
                    }
                  />
                  <label htmlFor="remote_work_capable" className="text-sm font-medium cursor-pointer">
                    Remote Work Capable
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_concurrent_contracts">Max Concurrent Contracts</Label>
                  <Input
                    id="max_concurrent_contracts"
                    type="number"
                    placeholder="5"
                    value={formData.max_concurrent_contracts}
                    onChange={(e) =>
                      setFormData({ ...formData, max_concurrent_contracts: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
            >
              Back
            </Button>
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext} disabled={!formData.primary_naics}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating Profile..." : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
