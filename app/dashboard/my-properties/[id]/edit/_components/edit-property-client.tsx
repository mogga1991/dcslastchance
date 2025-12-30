"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Maximize2, DollarSign, ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { uploadImages } from "@/lib/upload-images";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

const PROPERTY_TYPES = [
  { value: "office", label: "General Purpose Office" },
  { value: "warehouse", label: "Warehouse/Distribution" },
  { value: "flex_space", label: "Flex Space" },
  { value: "land", label: "Land/Antenna Site" },
  { value: "parking", label: "Parking" },
  { value: "other", label: "Other" },
];

const BUILDING_CLASSES = [
  { value: "class_a", label: "Class A - Premium" },
  { value: "class_b", label: "Class B - Mid-range" },
  { value: "class_c", label: "Class C - Budget" },
];

const LEASE_TYPES = [
  { value: "full_service", label: "Full Service Gross" },
  { value: "modified_gross", label: "Modified Gross" },
  { value: "triple_net", label: "Triple Net (NNN)" },
  { value: "industrial_gross", label: "Industrial Gross" },
];

const LISTING_STATUSES = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending Review" },
  { value: "inactive", label: "Inactive" },
];

interface PropertyFormData {
  title: string;
  description: string;
  street_address: string;
  suite_unit: string;
  city: string;
  state: string;
  zipcode: string;
  total_sf: string;
  available_sf: string;
  min_divisible_sf: string;
  asking_rent_sf: string;
  property_type: string;
  building_class: string;
  lease_type: string;
  available_date: string;
  year_built: string;
  parking_spaces: string;
  ada_accessible: boolean;
  leed_certified: boolean;
  notes: string;
  status: string;
}

export default function EditPropertyClient() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    street_address: "",
    suite_unit: "",
    city: "",
    state: "",
    zipcode: "",
    total_sf: "",
    available_sf: "",
    min_divisible_sf: "",
    asking_rent_sf: "",
    property_type: "office",
    building_class: "class_b",
    lease_type: "full_service",
    available_date: "",
    year_built: "",
    parking_spaces: "",
    ada_accessible: false,
    leed_certified: false,
    notes: "",
    status: "active",
  });

  useEffect(() => {
    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/sign-in");
        return;
      }

      // Fetch property
      const { data, error } = await supabase
        .from("broker_listings")
        .select("*")
        .eq("id", propertyId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        toast.error("Property not found or you don't have permission to edit it");
        router.push("/dashboard/my-properties");
        return;
      }

      // Populate form
      setFormData({
        title: data.title || "",
        description: data.description || "",
        street_address: data.street_address || "",
        suite_unit: data.suite_unit || "",
        city: data.city || "",
        state: data.state || "",
        zipcode: data.zipcode || "",
        total_sf: data.total_sf?.toString() || "",
        available_sf: data.available_sf?.toString() || "",
        min_divisible_sf: data.min_divisible_sf?.toString() || "",
        asking_rent_sf: data.asking_rent_sf?.toString() || "",
        property_type: data.property_type || "office",
        building_class: data.building_class || "class_b",
        lease_type: data.lease_type || "full_service",
        available_date: data.available_date || "",
        year_built: data.year_built?.toString() || "",
        parking_spaces: data.parking_spaces?.toString() || "",
        ada_accessible: data.ada_accessible || false,
        leed_certified: data.leed_certified || false,
        notes: data.notes || "",
        status: data.status || "active",
      });

      // Set existing images
      setExistingImages(data.images || []);
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Failed to load property");
      router.push("/dashboard/my-properties");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload new photos if any
      let newImageUrls: string[] = [];
      if (newPhotos.length > 0) {
        toast.info("Uploading images...");
        const uploadResults = await uploadImages(newPhotos, "broker-listings");
        newImageUrls = uploadResults.filter((r) => r.url).map((r) => r.url);
      }

      // Combine existing images with new uploads
      const allImages = [...existingImages, ...newImageUrls];

      // Prepare update data
      const updateData = {
        title: formData.title || null,
        description: formData.description || null,
        street_address: formData.street_address,
        suite_unit: formData.suite_unit || null,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        total_sf: parseInt(formData.total_sf),
        available_sf: parseInt(formData.available_sf),
        min_divisible_sf: formData.min_divisible_sf ? parseInt(formData.min_divisible_sf) : null,
        asking_rent_sf: formData.asking_rent_sf ? parseFloat(formData.asking_rent_sf) : null,
        property_type: formData.property_type,
        building_class: formData.building_class,
        lease_type: formData.lease_type,
        available_date: formData.available_date,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
        ada_accessible: formData.ada_accessible,
        leed_certified: formData.leed_certified,
        notes: formData.notes || null,
        status: formData.status,
        images: allImages,
      };

      const response = await fetch(`/api/broker-listings/${propertyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update property");
      }

      toast.success("Property updated successfully");
      router.push("/dashboard/my-properties");
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof PropertyFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPhotos((prev) => [...prev, ...files]);
    }
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/my-properties">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Properties
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-600 mt-1">Update your property listing details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="e.g., Modern Office Space in Downtown"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Describe your property..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => updateFormData("property_type", value)}
                >
                  <SelectTrigger id="property_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="street_address">Street Address *</Label>
                <Input
                  id="street_address"
                  value={formData.street_address}
                  onChange={(e) => updateFormData("street_address", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suite_unit">Suite/Unit</Label>
                <Input
                  id="suite_unit"
                  value={formData.suite_unit}
                  onChange={(e) => updateFormData("suite_unit", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateFormData("state", value)}
                >
                  <SelectTrigger id="state">
                    <SelectValue />
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
                <Label htmlFor="zipcode">ZIP Code *</Label>
                <Input
                  id="zipcode"
                  value={formData.zipcode}
                  onChange={(e) => updateFormData("zipcode", e.target.value)}
                  required
                  maxLength={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Space Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-indigo-600" />
              Space Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_sf">Total SF *</Label>
                <Input
                  id="total_sf"
                  type="number"
                  value={formData.total_sf}
                  onChange={(e) => updateFormData("total_sf", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_sf">Available SF *</Label>
                <Input
                  id="available_sf"
                  type="number"
                  value={formData.available_sf}
                  onChange={(e) => updateFormData("available_sf", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_divisible_sf">Min Divisible SF</Label>
                <Input
                  id="min_divisible_sf"
                  type="number"
                  value={formData.min_divisible_sf}
                  onChange={(e) => updateFormData("min_divisible_sf", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building_class">Building Class *</Label>
                <Select
                  value={formData.building_class}
                  onValueChange={(value) => updateFormData("building_class", value)}
                >
                  <SelectTrigger id="building_class">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUILDING_CLASSES.map((cls) => (
                      <SelectItem key={cls.value} value={cls.value}>
                        {cls.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_built">Year Built</Label>
                <Input
                  id="year_built"
                  type="number"
                  value={formData.year_built}
                  onChange={(e) => updateFormData("year_built", e.target.value)}
                  min="1800"
                  max={new Date().getFullYear() + 2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parking_spaces">Parking Spaces</Label>
              <Input
                id="parking_spaces"
                type="number"
                value={formData.parking_spaces}
                onChange={(e) => updateFormData("parking_spaces", e.target.value)}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ada_accessible"
                  checked={formData.ada_accessible}
                  onChange={(e) => updateFormData("ada_accessible", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="ada_accessible" className="cursor-pointer">
                  ADA Accessible
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="leed_certified"
                  checked={formData.leed_certified}
                  onChange={(e) => updateFormData("leed_certified", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="leed_certified" className="cursor-pointer">
                  LEED Certified
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Pricing & Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asking_rent_sf">Annual Rent ($/SF/Year)</Label>
                <Input
                  id="asking_rent_sf"
                  type="number"
                  step="0.01"
                  value={formData.asking_rent_sf}
                  onChange={(e) => updateFormData("asking_rent_sf", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lease_type">Lease Type</Label>
                <Select
                  value={formData.lease_type}
                  onValueChange={(value) => updateFormData("lease_type", value)}
                >
                  <SelectTrigger id="lease_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEASE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_date">Available Date *</Label>
              <Input
                id="available_date"
                type="date"
                value={formData.available_date}
                onChange={(e) => updateFormData("available_date", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Any additional information about the property..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
              Property Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <Label className="mb-3 block">Current Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={url}
                          alt={`Property image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 shadow-md"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Photos Preview */}
            {newPhotos.length > 0 && (
              <div>
                <Label className="mb-3 block">New Images to Upload</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {newPhotos.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-32 rounded-lg overflow-hidden border-2 border-indigo-200 bg-indigo-50">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 shadow-md"
                        onClick={() => removeNewPhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                </div>
                <Input
                  id="photo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                />
              </Label>
            </div>

            <p className="text-sm text-gray-500">
              Total images: {existingImages.length + newPhotos.length}
              {newPhotos.length > 0 && ` (${newPhotos.length} new)`}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/my-properties")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
