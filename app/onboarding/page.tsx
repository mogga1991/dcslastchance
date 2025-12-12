"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanyProfile } from "@/hooks/use-sentyr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, loading: profileLoading, createProfile } = useCompanyProfile();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    naics_codes: [] as string[],
    set_asides: [] as string[],
    core_capabilities: [] as string[],
    past_performance: "",
    security_clearances: [] as string[],
    certifications: [] as string[],
    geographic_focus: [] as string[],
    contract_value_range: { min: 0, max: 0 },
    preferred_agencies: [] as string[],
    team_size: 0,
  });

  // Redirect if profile already exists
  if (!profileLoading && profile) {
    router.push("/dashboard");
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayInput = (field: string, value: string) => {
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    handleInputChange(field, items);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProfile(formData);
      toast.success("Company profile created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Company Profile Setup</h1>
        <p className="text-muted-foreground">
          Tell us about your company to get personalized RFP recommendations
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Step {step} of 5</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Company Information"}
              {step === 2 && "Capabilities & Certifications"}
              {step === 3 && "Security & Clearances"}
              {step === 4 && "Contract Preferences"}
              {step === 5 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Basic information about your company"}
              {step === 2 && "Your core capabilities and certifications"}
              {step === 3 && "Security clearances and requirements"}
              {step === 4 && "Your contract and agency preferences"}
              {step === 5 && "Review your information before submitting"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Company Information */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange("company_name", e.target.value)}
                    required
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_size">Team Size *</Label>
                  <Input
                    id="team_size"
                    type="number"
                    value={formData.team_size}
                    onChange={(e) => handleInputChange("team_size", parseInt(e.target.value) || 0)}
                    required
                    placeholder="Number of employees"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="naics_codes">NAICS Codes</Label>
                  <Input
                    id="naics_codes"
                    value={formData.naics_codes.join(", ")}
                    onChange={(e) => handleArrayInput("naics_codes", e.target.value)}
                    placeholder="Enter NAICS codes separated by commas"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: 541512, 541519, 541611
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="set_asides">Set-Asides</Label>
                  <Input
                    id="set_asides"
                    value={formData.set_asides.join(", ")}
                    onChange={(e) => handleArrayInput("set_asides", e.target.value)}
                    placeholder="e.g., 8(a), SDVOSB, WOSB, HUBZone"
                  />
                </div>
              </>
            )}

            {/* Step 2: Capabilities */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="core_capabilities">Core Capabilities</Label>
                  <Input
                    id="core_capabilities"
                    value={formData.core_capabilities.join(", ")}
                    onChange={(e) => handleArrayInput("core_capabilities", e.target.value)}
                    placeholder="Enter capabilities separated by commas"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: Software Development, Cybersecurity, Data Analytics
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    value={formData.certifications.join(", ")}
                    onChange={(e) => handleArrayInput("certifications", e.target.value)}
                    placeholder="e.g., ISO 9001, CMMI Level 3, SOC 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="past_performance">Past Performance Summary</Label>
                  <textarea
                    id="past_performance"
                    value={formData.past_performance}
                    onChange={(e) => handleInputChange("past_performance", e.target.value)}
                    className="w-full min-h-[120px] rounded-md border border-border bg-input px-3 py-2 text-sm"
                    placeholder="Briefly describe your past performance and notable contracts"
                  />
                </div>
              </>
            )}

            {/* Step 3: Security */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="security_clearances">Security Clearances</Label>
                  <Input
                    id="security_clearances"
                    value={formData.security_clearances.join(", ")}
                    onChange={(e) => handleArrayInput("security_clearances", e.target.value)}
                    placeholder="e.g., Secret, Top Secret, TS/SCI"
                  />
                </div>
              </>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="preferred_agencies">Preferred Agencies</Label>
                  <Input
                    id="preferred_agencies"
                    value={formData.preferred_agencies.join(", ")}
                    onChange={(e) => handleArrayInput("preferred_agencies", e.target.value)}
                    placeholder="e.g., DoD, DHS, NASA, GSA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geographic_focus">Geographic Focus</Label>
                  <Input
                    id="geographic_focus"
                    value={formData.geographic_focus.join(", ")}
                    onChange={(e) => handleArrayInput("geographic_focus", e.target.value)}
                    placeholder="e.g., DC Metro, California, Remote"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract_min">Min Contract Value ($)</Label>
                    <Input
                      id="contract_min"
                      type="number"
                      value={formData.contract_value_range.min}
                      onChange={(e) =>
                        handleInputChange("contract_value_range", {
                          ...formData.contract_value_range,
                          min: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract_max">Max Contract Value ($)</Label>
                    <Input
                      id="contract_max"
                      type="number"
                      value={formData.contract_value_range.max}
                      onChange={(e) =>
                        handleInputChange("contract_value_range", {
                          ...formData.contract_value_range,
                          max: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="10000000"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Company Information</h3>
                  <p className="text-sm">Company: {formData.company_name}</p>
                  <p className="text-sm">Team Size: {formData.team_size}</p>
                  <p className="text-sm">NAICS Codes: {formData.naics_codes.join(", ") || "None"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Capabilities</h3>
                  <p className="text-sm">{formData.core_capabilities.join(", ") || "None"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Preferences</h3>
                  <p className="text-sm">Agencies: {formData.preferred_agencies.join(", ") || "None"}</p>
                  <p className="text-sm">
                    Contract Range: ${formData.contract_value_range.min.toLocaleString()} - $
                    {formData.contract_value_range.max.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1 || loading}
              >
                Previous
              </Button>

              {step < 5 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
