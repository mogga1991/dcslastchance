"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrokerListingInput, BuildingClass } from "@/types/broker-listing";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CreateListingDialogProps {
  onSubmit?: (data: BrokerListingInput) => Promise<void>;
  userEmail?: string;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export function CreateListingDialog({ onSubmit, userEmail }: CreateListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedBuildingClass, setSelectedBuildingClass] = useState<BuildingClass | "">("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const data: BrokerListingInput = {
        // Required fields
        street_address: formData.get("street_address") as string,
        city: formData.get("city") as string,
        state: selectedState,
        zipcode: formData.get("zipcode") as string,
        total_sf: parseInt(formData.get("total_sf") as string),
        available_date: formData.get("available_date") as string,
        building_class: selectedBuildingClass as BuildingClass,
        broker_email: formData.get("broker_email") as string,

        // Optional fields
        ada_accessible: formData.get("ada_accessible") === "on",
        parking_spaces: formData.get("parking_spaces") ? parseInt(formData.get("parking_spaces") as string) : undefined,
        leed_certified: formData.get("leed_certified") === "on",
        year_built: formData.get("year_built") ? parseInt(formData.get("year_built") as string) : undefined,
        notes: formData.get("notes") as string || undefined,

        // Auto-filled defaults
        property_type: "office",
        available_sf: parseInt(formData.get("total_sf") as string), // Same as total_sf for MVP
        status: "active",
      };

      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default submission to API
        const response = await fetch("/api/broker-listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create listing");
        }

        toast({
          title: "Success!",
          description: "Property listed successfully!",
        });

        setOpen(false);
        router.push("/dashboard/gsa-leasing");
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting listing:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create listing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          List Property
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List Your Property</DialogTitle>
          <DialogDescription>
            Add your property to match against GSA opportunities. Complete in under 2 minutes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Property Location</h3>

            <div className="space-y-2">
              <Label htmlFor="street_address">
                Property Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="street_address"
                name="street_address"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Washington"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedState} onValueChange={setSelectedState} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipcode">
                  Zip Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zipcode"
                  name="zipcode"
                  placeholder="20001"
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </div>

          {/* Space & Availability */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Space Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_sf">
                  Total RSF Available <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="total_sf"
                  name="total_sf"
                  type="number"
                  min="1"
                  placeholder="10000"
                  required
                />
                <p className="text-xs text-gray-500">Rentable Square Feet</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_date">
                  Available Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="available_date"
                  name="available_date"
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="building_class">
                Building Class <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedBuildingClass} onValueChange={(value) => setSelectedBuildingClass(value as BuildingClass)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select building class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class_a">Class A</SelectItem>
                  <SelectItem value="class_b">Class B</SelectItem>
                  <SelectItem value="class_c">Class C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contact Information</h3>

            <div className="space-y-2">
              <Label htmlFor="broker_email">
                Contact Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="broker_email"
                name="broker_email"
                type="email"
                defaultValue={userEmail}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Additional Details (Collapsible) */}
          <div className="space-y-4 border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-semibold text-sm">Additional Details (Optional)</h3>
              {showAdditionalDetails ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {showAdditionalDetails && (
              <div className="space-y-4 pl-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ada_accessible">ADA Accessible</Label>
                    <p className="text-xs text-gray-500">Is the property ADA compliant?</p>
                  </div>
                  <Switch id="ada_accessible" name="ada_accessible" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parking_spaces">Parking Spaces</Label>
                  <Input
                    id="parking_spaces"
                    name="parking_spaces"
                    type="number"
                    min="0"
                    placeholder="50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="leed_certified">LEED Certified</Label>
                    <p className="text-xs text-gray-500">Is the property LEED certified?</p>
                  </div>
                  <Switch id="leed_certified" name="leed_certified" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year_built">Year Built</Label>
                  <Input
                    id="year_built"
                    name="year_built"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear() + 2}
                    placeholder="2015"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes/Description</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional information about the property..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Listing"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
