"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Target, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ACCOUNT_MANAGERS = [
  { id: "1", name: "Jaden Tomas" },
  { id: "2", name: "Jick Stroman" },
  { id: "3", name: "Bethany Olson" },
];

const BUSINESS_TYPES = [
  "Agents",
  "Brokers",
  "Owners of Commercial Real Estate",
  "None of the above",
];

const USER_TYPES = [
  "Government Contractor",
  "Government Employee",
  "Sales Contractor",
  "Middleman",
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
  company_name: string;
  business_type: string;
  user_type: string;
  account_manager_id: string;

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
    company_name: "",
    business_type: "",
    user_type: "",
    account_manager_id: "",
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

  const selectAllAgencies = () => {
    setFormData({
      ...formData,
      preferred_agencies: FEDERAL_AGENCIES,
    });
  };

  const deselectAllAgencies = () => {
    setFormData({
      ...formData,
      preferred_agencies: [],
    });
  };

  const selectAllStates = () => {
    setFormData({
      ...formData,
      preferred_states: US_STATES,
    });
  };

  const deselectAllStates = () => {
    setFormData({
      ...formData,
      preferred_states: [],
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: formData.company_name,
          business_type: formData.business_type,
          user_type: formData.user_type,
          account_manager_id: formData.account_manager_id,
          core_competencies: formData.core_competencies,
          service_areas: formData.service_areas,
          certifications: formData.certifications,
          set_asides: formData.set_asides,
          preferred_agencies: formData.preferred_agencies,
          preferred_states: formData.preferred_states,
          min_contract_value: parseFloat(formData.min_contract_value) || 0,
          max_contract_value: parseFloat(formData.max_contract_value) || 999999999,
          remote_work_capable: formData.remote_work_capable,
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-7xl">
        <CardHeader className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <CardTitle className="text-4xl md:text-5xl">Welcome to Sentyr</CardTitle>
              <CardDescription className="text-lg mt-2">
                Let's set up your company profile to start matching opportunities
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xl px-6 py-3">
              Step {step} of {totalSteps}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-2xl font-semibold">
                <Building2 className="h-7 w-7" />
                Business Information
              </div>

              {/* Company Name */}
              <div className="space-y-3">
                <Label htmlFor="company_name" className="text-lg">Company Name</Label>
                <Input
                  id="company_name"
                  type="text"
                  placeholder="Enter your company name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="h-12 text-lg"
                />
              </div>

              {/* Business Type */}
              <div className="space-y-3">
                <Label htmlFor="business_type" className="text-lg">Business Type</Label>
                <select
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className="w-full h-12 px-4 py-2 text-lg border rounded-md"
                >
                  <option value="">Select your business type</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Type */}
              <div className="space-y-3">
                <Label htmlFor="user_type" className="text-lg">User Type</Label>
                <select
                  id="user_type"
                  value={formData.user_type}
                  onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                  className="w-full h-12 px-4 py-2 text-lg border rounded-md"
                >
                  <option value="">Select your user type</option>
                  {USER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Manager Referral */}
              <div className="space-y-3">
                <Label htmlFor="account_manager" className="text-lg">Who referred you?</Label>
                <select
                  id="account_manager"
                  value={formData.account_manager_id}
                  onChange={(e) => setFormData({ ...formData, account_manager_id: e.target.value })}
                  className="w-full h-12 px-4 py-2 text-lg border rounded-md"
                >
                  <option value="">Select an account manager</option>
                  {ACCOUNT_MANAGERS.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Capabilities */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-2xl font-semibold">
                <Target className="h-7 w-7" />
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
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-2xl font-semibold">
                <MapPin className="h-7 w-7" />
                Opportunity Preferences
              </div>

              {/* Preferred Agencies */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Preferred Federal Agencies</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllAgencies}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deselectAllAgencies}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
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
                <div className="flex items-center justify-between">
                  <Label>Preferred States (Leave empty for nationwide)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllStates}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deselectAllStates}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
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

            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
              size="lg"
              className="text-lg"
            >
              Back
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
                size="lg"
                className="text-lg"
              >
                Skip for now
              </Button>
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  size="lg"
                  className="text-lg"
                >
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={loading} size="lg" className="text-lg">
                  {loading ? "Creating Profile..." : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
