"use client";

import { useState, useEffect, useRef } from "react";
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
import { Plus, Building2, Handshake, User, Briefcase, Check, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListerRole, BrokerListingInput } from "@/types/broker-listing";
import { geocodeAddress, type Coordinates } from "@/lib/geocode";

interface CreateListingDialogProps {
  onSubmit?: (data: BrokerListingInput) => Promise<void>;
}

const ROLE_OPTIONS = [
  {
    value: "owner" as ListerRole,
    label: "Property Owner",
    icon: Building2,
    description: "I own the property",
  },
  {
    value: "broker" as ListerRole,
    label: "Licensed Broker",
    icon: Handshake,
    description: "I'm a licensed real estate broker",
  },
  {
    value: "agent" as ListerRole,
    label: "Real Estate Agent",
    icon: User,
    description: "I'm a licensed real estate agent",
  },
  {
    value: "salesperson" as ListerRole,
    label: "Salesperson",
    icon: Briefcase,
    description: "I'm a real estate salesperson",
  },
];

export function CreateListingDialog({ onSubmit }: CreateListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ListerRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const requiresLicense = selectedRole === "broker" || selectedRole === "agent";
  const requiresBrokerage = selectedRole === "broker" || selectedRole === "agent" || selectedRole === "salesperson";

  // Geocode address when all fields are filled
  const handleGeocodeAddress = async () => {
    const addressInput = document.getElementById("street_address") as HTMLInputElement;
    const cityInput = document.getElementById("city") as HTMLInputElement;
    const stateInput = document.getElementById("state") as HTMLInputElement;
    const zipcodeInput = document.getElementById("zipcode") as HTMLInputElement;

    const address = addressInput?.value;
    const city = cityInput?.value;
    const state = stateInput?.value;
    const zipcode = zipcodeInput?.value;

    if (!address || !city || !state || !zipcode) {
      setGeocodeError("Please fill in all address fields first");
      return;
    }

    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const result = await geocodeAddress(address, city, state, zipcode);

      if (result) {
        setCoordinates(result.coordinates);
        setGeocodeError(null);

        // Initialize map preview after coordinates are set
        setTimeout(() => initializeMap(result.coordinates), 100);
      } else {
        setGeocodeError("Could not locate address on map. Please check the address and try again.");
        setCoordinates(null);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeocodeError("Error geocoding address");
      setCoordinates(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize map preview
  const initializeMap = (coords: Coordinates) => {
    const mapContainer = document.getElementById("map-preview");
    if (!mapContainer || !window.google?.maps) return;

    if (mapRef.current) {
      // Map already initialized, just update marker
      if (markerRef.current) {
        markerRef.current.position = coords;
      }
      mapRef.current.panTo(coords);
      return;
    }

    // Create new map
    mapRef.current = new window.google.maps.Map(mapContainer, {
      center: coords,
      zoom: 15,
      mapId: "LISTING_PREVIEW_MAP",
      disableDefaultUI: true,
      zoomControl: true,
    });

    // Create draggable marker
    const markerEl = document.createElement("div");
    markerEl.style.width = "32px";
    markerEl.style.height = "32px";
    markerEl.style.borderRadius = "50%";
    markerEl.style.backgroundColor = "#16a34a";
    markerEl.style.border = "3px solid white";
    markerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    markerEl.style.cursor = "move";
    markerEl.textContent = "📍";
    markerEl.style.display = "flex";
    markerEl.style.alignItems = "center";
    markerEl.style.justifyContent = "center";
    markerEl.style.fontSize = "16px";

    markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current,
      position: coords,
      content: markerEl,
      gmpDraggable: true,
    });

    // Update coordinates when marker is dragged
    markerRef.current.addListener("dragend", (event: any) => {
      const newPos = markerRef.current.position;
      setCoordinates({
        lat: newPos.lat,
        lng: newPos.lng,
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRole) return;

    // Validate coordinates
    if (!coordinates) {
      setGeocodeError("Please verify the property location by clicking 'Locate on Map'");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);

      const data: BrokerListingInput = {
        lister_role: selectedRole,
        broker_name: formData.get("broker_name") as string,
        broker_company: formData.get("broker_company") as string,
        broker_email: formData.get("broker_email") as string,
        broker_phone: formData.get("broker_phone") as string,
        license_number: formData.get("license_number") as string | undefined,
        brokerage_company: formData.get("brokerage_company") as string | undefined,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        property_type: formData.get("property_type") as any,
        street_address: formData.get("street_address") as string,
        suite_unit: formData.get("suite_unit") as string | undefined,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zipcode: formData.get("zipcode") as string,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        total_sf: parseInt(formData.get("total_sf") as string),
        available_sf: parseInt(formData.get("available_sf") as string),
        asking_rent_sf: parseFloat(formData.get("asking_rent_sf") as string),
        lease_type: formData.get("lease_type") as any,
        available_date: formData.get("available_date") as string,
      };

      if (onSubmit) {
        await onSubmit(data);
      }

      setOpen(false);
      setSelectedRole(null);
      setCoordinates(null);
      setGeocodeError(null);
    } catch (error) {
      console.error("Error submitting listing:", error);
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List a New Property</DialogTitle>
          <DialogDescription>
            Fill out the form below to list your property on the marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              I am a... <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;

                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <Icon className={cn(
                      "h-8 w-8",
                      isSelected ? "text-blue-600" : "text-gray-400"
                    )} />
                    <div className="text-center">
                      <div className={cn(
                        "font-semibold",
                        isSelected ? "text-blue-900" : "text-gray-900"
                      )}>
                        {role.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {role.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRole && (
            <>
              {/* Conditional Brokerage Fields */}
              {requiresBrokerage && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-sm">Brokerage Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="brokerage_company">
                      Brokerage Company <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="brokerage_company"
                      name="brokerage_company"
                      placeholder="ABC Realty Corp"
                      required={requiresBrokerage}
                    />
                  </div>

                  {requiresLicense && (
                    <div className="space-y-2">
                      <Label htmlFor="license_number">
                        License Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="license_number"
                        name="license_number"
                        placeholder="RE12345678"
                        required={requiresLicense}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">
                  {selectedRole === "owner" ? "Your Contact Information" : "Your Information"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="broker_name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input id="broker_name" name="broker_name" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="broker_company">
                      Company <span className="text-red-500">*</span>
                    </Label>
                    <Input id="broker_company" name="broker_company" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="broker_email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input id="broker_email" name="broker_email" type="email" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="broker_phone">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input id="broker_phone" name="broker_phone" type="tel" required />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Property Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Property Title <span className="text-red-500">*</span>
                  </Label>
                  <Input id="title" name="title" placeholder="Capitol Gateway Office Plaza" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the property..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_type">
                      Property Type <span className="text-red-500">*</span>
                    </Label>
                    <Select name="property_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="mixed_use">Mixed Use</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lease_type">
                      Lease Type <span className="text-red-500">*</span>
                    </Label>
                    <Select name="lease_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lease type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_service">Full Service</SelectItem>
                        <SelectItem value="modified_gross">Modified Gross</SelectItem>
                        <SelectItem value="triple_net">Triple Net</SelectItem>
                        <SelectItem value="ground_lease">Ground Lease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Location</h3>

                <div className="space-y-2">
                  <Label htmlFor="street_address">
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <Input id="street_address" name="street_address" required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input id="city" name="city" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input id="state" name="state" maxLength={2} placeholder="DC" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipcode">
                      ZIP Code <span className="text-red-500">*</span>
                    </Label>
                    <Input id="zipcode" name="zipcode" required />
                  </div>
                </div>

                {/* Geocode Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeocodeAddress}
                  disabled={isGeocoding}
                  className="w-full"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Locating on map...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Locate on Map
                    </>
                  )}
                </Button>

                {/* Error Message */}
                {geocodeError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {geocodeError}
                  </div>
                )}

                {/* Map Preview */}
                {coordinates && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-600">
                      ✓ Location Verified
                    </Label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div id="map-preview" className="h-64 w-full bg-gray-100" />
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      📍 {coordinates.lat.toFixed(6)}° N, {Math.abs(coordinates.lng).toFixed(6)}° W
                      <span className="block mt-1 text-gray-500">Drag the marker to adjust location</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Space & Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Space & Pricing</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_sf">
                      Total SF <span className="text-red-500">*</span>
                    </Label>
                    <Input id="total_sf" name="total_sf" type="number" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="available_sf">
                      Available SF <span className="text-red-500">*</span>
                    </Label>
                    <Input id="available_sf" name="available_sf" type="number" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asking_rent_sf">
                      Rate ($/SF/Year) <span className="text-red-500">*</span>
                    </Label>
                    <Input id="asking_rent_sf" name="asking_rent_sf" type="number" step="0.01" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available_date">
                    Available Date <span className="text-red-500">*</span>
                  </Label>
                  <Input id="available_date" name="available_date" type="date" required />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Listing"}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
