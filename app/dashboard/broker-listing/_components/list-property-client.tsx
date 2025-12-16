"use client";

import { useState, useEffect } from "react";
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

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

const STEPS = [
  { number: 1, label: "Property Location" },
  { number: 2, label: "Space Details" },
  { number: 3, label: "Property Type" },
  { number: 4, label: "Pricing & Terms" },
  { number: 5, label: "Features & Amenities" },
  { number: 6, label: "Photos & Documents" },
  { number: 7, label: "Contact Information" },
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
    // Validate required fields before submitting
    const missingFields: string[] = [];

    if (!formData.street_address) missingFields.push("Street Address");
    if (!formData.city) missingFields.push("City");
    if (!formData.state) missingFields.push("State");
    if (!formData.zipcode) missingFields.push("Zipcode");
    if (!formData.total_sf) missingFields.push("Total Square Feet");
    if (!formData.availableDate) missingFields.push("Available Date");
    if (!formData.building_class) missingFields.push("Building Class");
    if (!formData.contact_email) missingFields.push("Contact Email");
    if (!formData.lister_role) missingFields.push("Your Role");

    if (missingFields.length > 0) {
      toast.error("Missing Required Fields", {
        description: `Please fill in: ${missingFields.join(', ')}`
      });
      return;
    }

    if (!formData.terms_agreed) {
      toast.error("Terms Agreement Required", {
        description: "Please agree to the Terms of Service and Privacy Policy to continue."
      });
      return;
    }

    setIsSubmitting(true);

    try {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-600 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">List Your Property</h1>
              <p className="text-gray-600 mt-1">
                Submit your property to be matched with federal lease opportunities
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                        ${
                          step.number === currentStep
                            ? "bg-indigo-600 text-white"
                            : step.number < currentStep
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }
                      `}
                    >
                      {step.number < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div
                      className={`
                        mt-2 text-xs text-center max-w-[100px]
                        ${
                          step.number === currentStep
                            ? "text-indigo-600 font-medium"
                            : "text-gray-500"
                        }
                      `}
                    >
                      {step.label}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        flex-1 h-0.5 mx-2 -mt-8
                        ${step.number < currentStep ? "bg-indigo-600" : "bg-gray-200"}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
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
                    Street Address <span className="text-red-500">*</span>
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
                      City <span className="text-red-500">*</span>
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
                      State <span className="text-red-500">*</span>
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
                    ZIP Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zipcode"
                    placeholder="20001"
                    value={formData.zipcode}
                    onChange={(e) => updateFormData("zipcode", e.target.value)}
                    maxLength={10}
                  />
                </div>

                {/* Map Preview Placeholder */}
                <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <MapPin className="h-12 w-12 mb-3" />
                    <p className="text-sm">Map preview will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Space Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <Maximize2 className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Space Details</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Square footage is the #2 criterion for GSA lease matching
              </p>

              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_sf">
                      Total Square Footage <span className="text-red-500">*</span>
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
                      Available Square Footage <span className="text-red-500">*</span>
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
                      Number of Floors <span className="text-red-500">*</span>
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
                      Available Date <span className="text-red-500">*</span>
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
                      Ceiling Height <span className="text-red-500">*</span>
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
          )}

          {/* Step 3: Property Type */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <Building2 className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Property Type</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Property classification is the #3 criterion for GSA matching
              </p>

              <div className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label>
                    Property Type <span className="text-red-500">*</span>
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
                    Building Class <span className="text-red-500">*</span>
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
                      Year Built <span className="text-red-500">*</span>
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
          )}

          {/* Step 4: Pricing & Terms */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileText className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Pricing & Terms</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Lease terms and pricing information
              </p>

              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="lease_rate">
                    Annual Lease Rate ($/SF) <span className="text-red-500">*</span>
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
                    Preferred Lease Term <span className="text-red-500">*</span>
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
          )}

          {/* Step 5: Features & Amenities */}
          {currentStep === 5 && (
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

          {/* Step 6: Photos & Documents */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <Upload className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Photos & Documents</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Upload property photos and floor plans (Optional - you can add photos later)
              </p>

              <div className="space-y-6 mt-6">
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
                    <strong>Note:</strong> Photo uploads are optional for now. You can submit your listing without photos and add them later. Photos selected here are for your reference only and won't be uploaded in this version.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Contact Information */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <User className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Who should GSA contact about this listing?
              </p>

              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="lister_role">
                    Your Role <span className="text-red-500">*</span>
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
                    Full Name <span className="text-red-500">*</span>
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
                        Brokerage Company <span className="text-red-500">*</span>
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
                        {(formData.lister_role === 'broker' || formData.lister_role === 'agent') && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <Input
                        id="license_number"
                        placeholder="Enter your license number"
                        value={formData.license_number}
                        onChange={(e) => updateFormData("license_number", e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        {formData.lister_role === 'salesperson'
                          ? 'Optional for salespersons'
                          : 'Required for brokers and agents'}
                      </p>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">
                      Email <span className="text-red-500">*</span>
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
                      Phone <span className="text-red-500">*</span>
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
                <div className={`flex items-start space-x-3 pt-4 p-4 rounded-lg border-2 ${
                  formData.terms_agreed
                    ? 'border-green-200 bg-green-50'
                    : 'border-orange-300 bg-orange-50'
                }`}>
                  <Checkbox
                    id="terms_agreed"
                    checked={formData.terms_agreed}
                    onCheckedChange={(checked) =>
                      updateFormData("terms_agreed", checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms_agreed" className="cursor-pointer text-sm leading-relaxed font-medium">
                      <span className="text-red-500">*</span> I certify that I am authorized to list this property and that all information
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
                    {!formData.terms_agreed && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ You must agree to the terms to submit your listing
                      </p>
                    )}
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
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="text-gray-600"
            >
              ← Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              {currentStep === 7 ? (
                <div className="relative group">
                  <Button
                    onClick={handleSubmit}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.terms_agreed || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Listing"}
                  </Button>
                  {!formData.terms_agreed && !isSubmitting && (
                    <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Please agree to terms first
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
