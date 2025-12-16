"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    country?: string;
    state?: string;
    phone?: string;
    lister_role?: 'owner' | 'broker' | 'agent' | 'salesperson';
    license_number?: string;
    brokerage_company?: string;
  };
}

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

function SettingsContent() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Profile form states
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("United States");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [listerRole, setListerRole] = useState<'owner' | 'broker' | 'agent' | 'salesperson' | ''>('');
  const [licenseNumber, setLicenseNumber] = useState("");
  const [brokerageCompany, setBrokerageCompany] = useState("");

  // Profile picture upload states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/sign-in");
          return;
        }

        setUser(user as UserData);
        setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "");
        setCountry(user.user_metadata?.country || "United States");
        setState(user.user_metadata?.state || "");
        setPhone(user.user_metadata?.phone || "");
        setListerRole(user.user_metadata?.lister_role || '');
        setLicenseNumber(user.user_metadata?.license_number || "");
        setBrokerageCompany(user.user_metadata?.brokerage_company || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          name: fullName,
          country: country,
          state: state,
          phone: phone,
          lister_role: listerRole || undefined,
          license_number: licenseNumber || undefined,
          brokerage_company: brokerageCompany || undefined,
        }
      });

      if (error) throw error;

      toast.success("Profile updated successfully");

      // Refresh user data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user as UserData);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error("Image must be less than 1MB");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profileImage || !user) return;

    setSaving(true);
    try {
      // Upload to Supabase Storage
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        }
      });

      if (updateError) throw updateError;

      toast.success("Profile picture updated successfully");
      setImagePreview(null);
      setProfileImage(null);

      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser as UserData);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-32 mb-2 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Tabs Skeleton */}
        <div className="w-full max-w-4xl">
          <div className="flex space-x-1 mb-6">
            <Skeleton className="h-10 w-20 bg-gray-200 dark:bg-gray-800" />
            <Skeleton className="h-10 w-28 bg-gray-200 dark:bg-gray-800" />
            <Skeleton className="h-10 w-16 bg-gray-200 dark:bg-gray-800" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-gray-200 dark:bg-gray-800" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-800" />
              </div>
              <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="w-full max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={imagePreview || user?.user_metadata?.avatar_url || ""}
                    alt="Profile picture"
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        document.getElementById("profile-image-input")?.click()
                      }
                      disabled={saving}
                    >
                      <Upload className="h-4 w-4" />
                      Upload photo
                    </Button>
                    {profileImage && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUploadProfilePicture}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImagePreview(null);
                            setProfileImage(null);
                          }}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah Mitchell"
                  className="bg-white border-gray-300"
                />
              </div>

              {/* Email (disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-100 border-gray-300"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">🇺🇸 United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((stateName) => (
                      <SelectItem key={stateName} value={stateName}>
                        {stateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="bg-white border-gray-300"
                />
              </div>

              {/* Lister Role */}
              <div className="space-y-2">
                <Label htmlFor="listerRole">Your Role</Label>
                <Select value={listerRole} onValueChange={(value) => setListerRole(value as 'owner' | 'broker' | 'agent' | 'salesperson')}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Property Owner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="agent">Real Estate Agent</SelectItem>
                    <SelectItem value="salesperson">Salesperson</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  This helps us auto-fill your information when listing properties
                </p>
              </div>

              {/* License Number - Show only for broker/agent/salesperson */}
              {listerRole && listerRole !== 'owner' && (
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">
                    Real Estate License Number
                    {(listerRole === 'broker' || listerRole === 'agent') && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="Enter your license number"
                    className="bg-white border-gray-300"
                    required={listerRole === 'broker' || listerRole === 'agent'}
                  />
                  <p className="text-sm text-gray-500">
                    {listerRole === 'salesperson'
                      ? 'Optional for salespersons'
                      : 'Required for brokers and agents'}
                  </p>
                </div>
              )}

              {/* Brokerage Company - Show only for broker/agent/salesperson */}
              {listerRole && listerRole !== 'owner' && (
                <div className="space-y-2">
                  <Label htmlFor="brokerageCompany">
                    Brokerage Company <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="brokerageCompany"
                    value={brokerageCompany}
                    onChange={(e) => setBrokerageCompany(e.target.value)}
                    placeholder="Enter your brokerage company name"
                    className="bg-white border-gray-300"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Name of the company you work for
                  </p>
                </div>
              )}

              <Button onClick={handleUpdateProfile} disabled={saving}>
                {saving ? "Saving..." : "Save information"}
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 p-6">
          <div>
            <div className="h-9 w-32 mb-2 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
