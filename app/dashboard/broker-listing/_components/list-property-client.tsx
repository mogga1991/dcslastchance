"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin, Maximize2, FileText, CheckSquare, Upload, User, Check } from "lucide-react";
import type { BrokerListingInput, PropertyType } from "@/types/broker-listing";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { uploadImages } from "@/lib/upload-images";

// Declare google as a global variable
declare global {
  interface Window {
    google: typeof google;
  }
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

const STEPS = [
  {
    number: 1,
    label: "Property Location",
    icon: MapPin,
    description: "Where is your property located?"
  },
  {
    number: 2,
    label: "Property Details",
    icon: Building2,
    description: "Tell us about the space"
  },
  {
    number: 3,
    label: "Features & Amenities",
    icon: CheckSquare,
    description: "What amenities are available?"
  },
  {
    number: 4,
    label: "Photos & Contact",
    icon: User,
    description: "Add visuals and contact info"
  },
];

const PROPERTY_TYPES = [
  { value: "general_office", label: "General Purpose Office", icon: "📄" },
  { value: "warehouse", label: "Warehouse/Distribution", icon: "📦" },
  { value: "flex_space", label: "Flex Space", icon: "🔄" },
  { value: "land_antenna", label: "Land/Antenna Site", icon: "📡" },
  { value: "parking", label: "Parking", icon: "🅿️" },
];

// Map form values to database PropertyType
const propertyTypeMap: Record<string, PropertyType> = {
  general_office: "office",
  warehouse: "warehouse",
  flex_space: "industrial",
  land_antenna: "land",
  parking: "other",
};

const AMENITIES = [
  "Parking",
  "Loading Docks",
  "Freight Elevator",
  "24/7 Access",
  "On-site Security",
  "Backup Generator",
  "Fiber Internet",
  "HVAC",
  "ADA Accessible",
];

export default function ListPropertyClient() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Property Location
    street_address: "",
    city: "",
    state: "",
    zipcode: "",
    // Step 2: Space Details
    total_sf: "",
    available_sf: "",
    availableDate: "",
    num_floors: "",
    floors_available: "",
    ceiling_height: "",
    column_spacing: "",
    // Step 3: Property Type
    property_type: "",
    building_class: "",
    year_built: "",
    year_renovated: "",
    // Step 4: Pricing & Terms
    lease_rate: "",
    lease_term: "",
    // Step 5: Features & Amenities
    amenities: [] as string[],
    // Step 6: Photos & Documents
    photos: [] as File[],
    // Step 7: Contact Information
    broker_name: "",
    company_name: "",
    contact_email: "",
    contact_phone: "",
    lister_role: "" as 'owner' | 'broker' | 'agent' | 'salesperson' | '',
    license_number: "",
    brokerage_company: "",
    terms_agreed: false,
  });

  // Fetch user profile data and pre-fill contact information
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setFormData((prev) => ({
            ...prev,
            broker_name: user.user_metadata?.full_name || user.user_metadata?.name || prev.broker_name,
            contact_email: user.email || prev.contact_email,
            contact_phone: user.user_metadata?.phone || prev.contact_phone,
            company_name: user.user_metadata?.brokerage_company || prev.company_name,
            lister_role: user.user_metadata?.lister_role || prev.lister_role,
            license_number: user.user_metadata?.license_number || prev.license_number,
            brokerage_company: user.user_metadata?.brokerage_company || prev.brokerage_company,
          }));
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    loadUserProfile();
  }, [supabase]);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key not found");
      return;
    }

    // Check if already loaded
    if (window.google?.maps) {
      setIsMapLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsMapLoaded(true);
    script.onerror = () => console.error("Failed to load Google Maps script");
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts before loading
      if (!isMapLoaded) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize Google Maps after script loads
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || map) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
      zoom: 4,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(newMap);
  }, [isMapLoaded, map]);

  // Geocode address and update map when location fields change
  useEffect(() => {
    if (!map || !window.google) return;

    const fullAddress = `${formData.street_address}, ${formData.city}, ${formData.state} ${formData.zipcode}`.trim();

    // Only geocode if we have at least city and state
    if (!formData.city || !formData.state) {
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;

        // Update map center and zoom
        map.setCenter(location);
        map.setZoom(15);

        // Remove old marker if exists
        if (marker) {
          marker.setMap(null);
        }

        // Add new marker
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: formData.street_address || "Your Property",
        });

        setMarker(newMarker);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.street_address, formData.city, formData.state, formData.zipcode, map]);

  const updateFormData = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Upload images first if any are selected
      let imageUrls: string[] = [];
      if (formData.photos.length > 0) {
        toast.info("Uploading images...", {
          description: `Uploading ${formData.photos.length} image(s)`
        });

        const uploadResults = await uploadImages(formData.photos, 'broker-listings');

        // Check for upload errors
        const errors = uploadResults.filter(r => r.error);
        if (errors.length > 0) {
          toast.warning("Some images failed to upload", {
            description: errors.map(e => e.error).join(', ')
          });
        }

        // Get successful uploads
        imageUrls = uploadResults.filter(r => r.url).map(r => r.url);

        if (imageUrls.length > 0) {
          toast.success(`${imageUrls.length} image(s) uploaded successfully`);
        }
      }

      // Map building_class from "Class A" to "class_a"
      const buildingClassMap: Record<string, string> = {
        "Class A": "class_a",
        "Class B": "class_b",
        "Class C": "class_c",
      };

      // Prepare data for API
      const listingData: BrokerListingInput = {
        // Required fields
        street_address: formData.street_address,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        total_sf: parseInt(formData.total_sf),
        available_sf: parseInt(formData.available_sf) || parseInt(formData.total_sf),
        available_date: formData.availableDate || new Date().toISOString().split('T')[0],
        building_class: (buildingClassMap[formData.building_class] || 'class_a') as 'class_a' | 'class_b' | 'class_c',
        broker_email: formData.contact_email,

        // Optional fields
        broker_name: formData.broker_name,
        broker_company: formData.company_name,
        broker_phone: formData.contact_phone,
        lister_role: formData.lister_role as 'owner' | 'broker' | 'agent' | 'salesperson' | undefined,
        license_number: formData.license_number || undefined,
        brokerage_company: formData.brokerage_company || undefined,
        property_type: (formData.property_type ? propertyTypeMap[formData.property_type] : undefined) as PropertyType | undefined,
        year_built: formData.year_built ? parseInt(formData.year_built) : undefined,
        asking_rent_sf: formData.lease_rate ? parseFloat(formData.lease_rate) : undefined,
        leed_certified: formData.amenities.includes("LEED Certified"),
        ada_accessible: formData.amenities.includes("ADA Accessible"),
        parking_spaces: formData.amenities.includes("Parking") ? 50 : undefined,
        amenities: formData.amenities,
        notes: `Ceiling Height: ${formData.ceiling_height}ft. ${formData.column_spacing ? `Column Spacing: ${formData.column_spacing}ft.` : ''}`,
        images: imageUrls, // Add uploaded image URLs
      };

      console.log('Submitting listing data:', listingData);

      const response = await fetch("/api/broker-listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create listing");
      }

      // Success! Redirect to My Properties page
      toast.success("Property Listed Successfully!", {
        description: "Your property is now live and will be matched with federal opportunities."
      });

      // Redirect to my properties after a short delay
      setTimeout(() => {
        router.push("/dashboard/my-properties");
      }, 1500);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to Create Listing", {
        description: error instanceof Error ? error.message : "Please try again or contact support."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">List Your Property</h1>
              <p className="text-gray-600 mt-1">
                Get matched with federal lease opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Form Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 lg:p-10 min-h-[600px] relative">
              {/* Form Content with Fade Transition */}
              <div
                key={currentStep}
                className="animate-in fade-in slide-in-from-right-4 duration-500"
              >
          {/* Step 1: Property Location */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <MapPin className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Property Location</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Location is the #1 criterion for GSA lease matching
              </p>

              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="street_address">
                    Street Address
                  </Label>
                  <Input
                    id="street_address"
                    placeholder="123 Main Street"
                    value={formData.street_address}
                    onChange={(e) => updateFormData("street_address", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City
                    </Label>
                    <Input
                      id="city"
                      placeholder="Washington"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => updateFormData("state", value)}
                    >
                      <SelectTrigger id="state">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipcode">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipcode"
                    placeholder="20001"
                    value={formData.zipcode}
                    onChange={(e) => updateFormData("zipcode", e.target.value)}
                    maxLength={10}
                  />
                </div>

                {/* Map Preview */}
                <div className="mt-6 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative">
                  <div ref={mapRef} className="w-full h-64" />
                  {!formData.city && !formData.state && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 pointer-events-none rounded-lg">
                      <MapPin className="h-12 w-12 mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500">Enter address to see map preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Property Details (Space Details + Property Type + Pricing & Terms) */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Space Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Maximize2 className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Space Details</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Square footage is the #2 criterion for GSA lease matching
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total_sf">
                        Total Square Footage
                      </Label>
                      <div className="relative">
                        <Input
                          id="total_sf"
                          type="number"
                          placeholder="50000"
                          value={formData.total_sf}
                          onChange={(e) => updateFormData("total_sf", e.target.value)}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          SF
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="available_sf">
                        Available Square Footage
                      </Label>
                      <div className="relative">
                        <Input
                          id="available_sf"
                          type="number"
                          placeholder="25000"
                          value={formData.available_sf}
                          onChange={(e) => updateFormData("available_sf", e.target.value)}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          SF
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="num_floors">
                        Number of Floors
                      </Label>
                      <Input
                        id="num_floors"
                        type="number"
                        placeholder="5"
                        value={formData.num_floors}
                        onChange={(e) => updateFormData("num_floors", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="floors_available">Floor(s) Available</Label>
                      <Input
                        id="floors_available"
                        placeholder="2, 3, 4"
                        value={formData.floors_available}
                        onChange={(e) => updateFormData("floors_available", e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Enter floor numbers separated by commas</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availableDate">
                        Available Date
                      </Label>
                      <Input
                        id="availableDate"
                        type="date"
                        value={formData.availableDate}
                        onChange={(e) => updateFormData("availableDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ceiling_height">
                        Ceiling Height
                      </Label>
                      <div className="relative">
                        <Input
                          id="ceiling_height"
                          type="number"
                          placeholder="12"
                          value={formData.ceiling_height}
                          onChange={(e) => updateFormData("ceiling_height", e.target.value)}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          ft
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="column_spacing">Column Spacing / Clear Span</Label>
                      <div className="relative">
                        <Input
                          id="column_spacing"
                          type="number"
                          placeholder="30"
                          value={formData.column_spacing}
                          onChange={(e) => updateFormData("column_spacing", e.target.value)}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          ft
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">For warehouse properties</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Property Type Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Building2 className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Property Type</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Property classification is the #3 criterion for GSA matching
                </p>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>
                      Property Type
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {PROPERTY_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateFormData("property_type", type.value)}
                          className={`
                            p-4 border-2 rounded-lg text-left transition-all
                            ${
                              formData.property_type === type.value
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{type.icon}</span>
                            <span className="font-medium text-sm">{type.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>
                      Building Class
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Class A", "Class B", "Class C"].map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => updateFormData("building_class", cls)}
                          className={`
                            p-4 border-2 rounded-lg font-medium transition-all
                            ${
                              formData.building_class === cls
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Class A: Premium | Class B: Mid-range | Class C: Budget
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year_built">
                        Year Built
                      </Label>
                      <Input
                        id="year_built"
                        type="number"
                        placeholder="2005"
                        value={formData.year_built}
                        onChange={(e) => updateFormData("year_built", e.target.value)}
                        min="1800"
                        max={new Date().getFullYear() + 2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year_renovated">Year Renovated</Label>
                      <Input
                        id="year_renovated"
                        type="number"
                        placeholder="2020"
                        value={formData.year_renovated}
                        onChange={(e) => updateFormData("year_renovated", e.target.value)}
                        min="1800"
                        max={new Date().getFullYear() + 2}
                      />
                      <p className="text-xs text-gray-500">Optional</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Pricing & Terms Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <FileText className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Pricing & Terms</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Lease terms and pricing information
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lease_rate">
                      Annual Lease Rate ($/SF)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="lease_rate"
                        type="number"
                        placeholder="35.00"
                        value={formData.lease_rate}
                        onChange={(e) => updateFormData("lease_rate", e.target.value)}
                        className="pl-8 pr-16"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        /SF/Year
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lease_term">
                      Preferred Lease Term
                    </Label>
                    <Select
                      value={formData.lease_term}
                      onValueChange={(value) => updateFormData("lease_term", value)}
                    >
                      <SelectTrigger id="lease_term">
                        <SelectValue placeholder="Select lease term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="10">10 years</SelectItem>
                        <SelectItem value="15">15 years</SelectItem>
                        <SelectItem value="20">20 years</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Features & Amenities */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <CheckSquare className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Features & Amenities</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Select all amenities that apply to your property
              </p>

              <div className="space-y-3 mt-6">
                {AMENITIES.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <Label htmlFor={amenity} className="cursor-pointer flex-1">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-900">
                  <strong>GSA Requirements:</strong> Most federal agencies require ADA accessibility,
                  on-site security, and adequate parking.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Photos & Contact (Photos & Documents + Contact Information) */}
          {currentStep === 4 && (
            <div className="space-y-8">
              {/* Photos & Documents Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Upload className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Photos & Documents</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Upload property photos and floor plans (Optional - you can add photos later)
                </p>

                <div className="space-y-6">
                  {/* Photo Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 hover:bg-gray-100 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFormData((prev) => ({ ...prev, photos: files }));
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none">
                      <Upload className="h-12 w-12 mb-3" />
                      <p className="text-sm font-medium mb-1">
                        {formData.photos.length > 0
                          ? `${formData.photos.length} file(s) selected`
                          : "Click to browse or drag and drop files here"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Supports: JPG, PNG, PDF (Max 10MB per file)
                      </p>
                    </div>
                  </div>

                  {/* Display selected files */}
                  {formData.photos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {formData.photos.map((file, idx) => (
                          <li key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span>{file.name}</span>
                            <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Floor Plans Button */}
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Floor Plans
                  </Button>
                  <p className="text-xs text-gray-500">
                    Upload architectural floor plans or space layouts
                  </p>

                  {/* Tip Box */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Tip:</strong> High-quality photos increase your listing's visibility. Upload clear images of the property's exterior, interior, and key features. Photos are optional but highly recommended.
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <User className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Contact Information</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Who should GSA contact about this listing?
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lister_role">
                      Your Role
                    </Label>
                    <Select
                      value={formData.lister_role}
                      onValueChange={(value) => updateFormData("lister_role", value)}
                    >
                      <SelectTrigger id="lister_role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Property Owner</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="agent">Real Estate Agent</SelectItem>
                        <SelectItem value="salesperson">Salesperson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="broker_name">
                      Full Name
                    </Label>
                    <Input
                      id="broker_name"
                      placeholder="John Smith"
                      value={formData.broker_name}
                      onChange={(e) => updateFormData("broker_name", e.target.value)}
                    />
                  </div>

                  {formData.lister_role && formData.lister_role !== 'owner' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="brokerage_company">
                          Brokerage Company
                        </Label>
                        <Input
                          id="brokerage_company"
                          placeholder="ABC Commercial Real Estate"
                          value={formData.brokerage_company}
                          onChange={(e) => updateFormData("brokerage_company", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="license_number">
                          Real Estate License Number
                        </Label>
                        <Input
                          id="license_number"
                          placeholder="Enter your license number"
                          value={formData.license_number}
                          onChange={(e) => updateFormData("license_number", e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          Optional
                        </p>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">
                        Email
                      </Label>
                      <Input
                        id="contact_email"
                        type="email"
                        placeholder="john.smith@example.com"
                        value={formData.contact_email}
                        onChange={(e) => updateFormData("contact_email", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">
                        Phone
                      </Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.contact_phone}
                        onChange={(e) => updateFormData("contact_phone", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> You can save this information in your{" "}
                      <a href="/dashboard/settings" className="underline font-medium">
                        Settings
                      </a>{" "}
                      to auto-fill for future listings.
                    </p>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start space-x-3 pt-4 p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                    <Checkbox
                      id="terms_agreed"
                      checked={formData.terms_agreed}
                      onCheckedChange={(checked) =>
                        updateFormData("terms_agreed", checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="terms_agreed" className="cursor-pointer text-sm leading-relaxed font-medium">
                        I certify that I am authorized to list this property and that all information
                        provided is accurate. I agree to the{" "}
                        <a href="#" className="text-indigo-600 hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-indigo-600 hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </Label>
                    </div>
                  </div>

                  {/* What Happens Next */}
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>What happens next?</strong> Our AI will continuously monitor federal lease
                      opportunities and notify you immediately when we find a perfect match for your property.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              {currentStep === 4 ? (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-600/50 disabled:opacity-50"
                  disabled={isSubmitting || !formData.terms_agreed}
                >
                  {isSubmitting ? "Submitting..." : "Submit Listing"}
                </Button>
              ) : (
                <Button onClick={handleNext} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-600/50">
                  Next →
                </Button>
              )}
            </div>
          </div>
              </div>
            </div>
          </div>

          {/* Right Column - Vertical Progress Steps */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Your Progress
                  </h2>
                  <p className="text-sm text-gray-600">
                    Complete all steps to list your property
                  </p>
                </div>

                {/* Vertical Steps */}
                <div className="space-y-6 relative">
                  {/* Animated Progress Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200">
                    <div
                      className="bg-gradient-to-b from-indigo-600 to-indigo-500 w-full transition-all duration-700 ease-out"
                      style={{
                        height: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {STEPS.map((step) => {
                    const StepIcon = step.icon;
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;
                    const isPending = step.number > currentStep;

                    return (
                      <div
                        key={step.number}
                        className="relative flex items-start gap-4 group"
                      >
                        {/* Step Circle */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`
                              w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500
                              ${
                                isCurrent
                                  ? "bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-600/50 scale-110"
                                  : isCompleted
                                  ? "bg-indigo-600 shadow-md"
                                  : "bg-gray-100 border-2 border-gray-200"
                              }
                            `}
                          >
                            {isCompleted ? (
                              <Check className="h-5 w-5 text-white" strokeWidth={3} />
                            ) : (
                              <StepIcon
                                className={`h-5 w-5 ${
                                  isCurrent ? "text-white" : isPending ? "text-gray-400" : "text-white"
                                }`}
                              />
                            )}
                          </div>

                          {/* Pulse Animation for Current Step */}
                          {isCurrent && (
                            <div className="absolute inset-0 rounded-xl bg-indigo-600 animate-ping opacity-20" />
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 pt-2">
                          <div
                            className={`
                              text-sm font-semibold transition-colors duration-300
                              ${
                                isCurrent
                                  ? "text-indigo-600"
                                  : isCompleted
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }
                            `}
                          >
                            {step.label}
                          </div>
                          <div
                            className={`
                              text-xs mt-1 transition-colors duration-300
                              ${
                                isCurrent
                                  ? "text-indigo-600/80"
                                  : isCompleted
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }
                            `}
                          >
                            {step.description}
                          </div>

                          {/* Completion Checkmark */}
                          {isCompleted && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Percentage */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {Math.round(((currentStep - 1) / STEPS.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-700 ease-out rounded-full"
                      style={{
                        width: `${((currentStep - 1) / STEPS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
