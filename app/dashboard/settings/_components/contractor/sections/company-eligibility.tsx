"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CompanyEligibilityProps {
  onUpdate?: () => void;
}

export default function CompanyEligibility({ onUpdate }: CompanyEligibilityProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    legal_name: "",
    dba_name: "",
    uei: "",
    cage: "",
    sam_status: "unknown",
    sam_expiration_date: "",
    business_size: "unknown",
    socio_status: [],
    naics_primary: "",
    naics_secondary: [],
    psc_codes: [],
    service_areas: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/contractor-profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/contractor-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error("Failed to save profile");

      toast.success("Profile saved successfully");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company & Eligibility Information</CardTitle>
        <CardDescription>
          Core company information used for RFP qualification checks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legal & Registration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Legal & Registration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Name *</Label>
              <Input
                id="legal_name"
                value={profile.legal_name || ""}
                onChange={(e) => setProfile({ ...profile, legal_name: e.target.value })}
                placeholder="ABC Contracting Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dba_name">DBA Name</Label>
              <Input
                id="dba_name"
                value={profile.dba_name || ""}
                onChange={(e) => setProfile({ ...profile, dba_name: e.target.value })}
                placeholder="ABC Solutions"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uei">UEI (Unique Entity Identifier)</Label>
              <Input
                id="uei"
                value={profile.uei || ""}
                onChange={(e) => setProfile({ ...profile, uei: e.target.value })}
                placeholder="A1B2C3D4E5F6"
                maxLength={12}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cage">CAGE Code</Label>
              <Input
                id="cage"
                value={profile.cage || ""}
                onChange={(e) => setProfile({ ...profile, cage: e.target.value })}
                placeholder="1A2B3"
                maxLength={5}
              />
            </div>
          </div>
        </div>

        {/* SAM Registration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            SAM Registration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sam_status">SAM Status</Label>
              <Select
                value={profile.sam_status}
                onValueChange={(value) => setProfile({ ...profile, sam_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sam_expiration_date">SAM Expiration Date</Label>
              <Input
                id="sam_expiration_date"
                type="date"
                value={profile.sam_expiration_date || ""}
                onChange={(e) => setProfile({ ...profile, sam_expiration_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Business Classification */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Business Classification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_size">Business Size</Label>
              <Select
                value={profile.business_size}
                onValueChange={(value) => setProfile({ ...profile, business_size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small Business</SelectItem>
                  <SelectItem value="other">Other than Small</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="naics_primary">Primary NAICS Code</Label>
              <Input
                id="naics_primary"
                value={profile.naics_primary || ""}
                onChange={(e) => setProfile({ ...profile, naics_primary: e.target.value })}
                placeholder="541330"
                maxLength={6}
              />
            </div>
          </div>
        </div>

        {/* Capacity Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Capacity & Staffing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="headcount_ft">Full-Time Employees</Label>
              <Input
                id="headcount_ft"
                type="number"
                value={profile.headcount_ft || ""}
                onChange={(e) => setProfile({ ...profile, headcount_ft: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_size_min">Min Contract Size ($)</Label>
              <Input
                id="contract_size_min"
                type="number"
                value={profile.contract_size_min || ""}
                onChange={(e) => setProfile({ ...profile, contract_size_min: parseFloat(e.target.value) || 0 })}
                placeholder="50000"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_size_max">Max Contract Size ($)</Label>
              <Input
                id="contract_size_max"
                type="number"
                value={profile.contract_size_max || ""}
                onChange={(e) => setProfile({ ...profile, contract_size_max: parseFloat(e.target.value) || 0 })}
                placeholder="5000000"
                min="0"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Company Information"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
