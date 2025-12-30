"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Mail, Phone, MapPin, Upload, Lock, User, Bell, Shield, Database, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
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

type TabType = 'profile' | 'security' | 'notifications' | 'data';

const tabs = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data Management', icon: Database },
];

function SettingsContent() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const router = useRouter();
  const supabase = createClient();

  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Broker Info
  const [listerRole, setListerRole] = useState<'owner' | 'broker' | 'agent' | 'salesperson' | ''>('');
  const [licenseNumber, setLicenseNumber] = useState("");
  const [brokerageCompany, setBrokerageCompany] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Profile Picture
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Data Management
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/sign-in");
          return;
        }

        setUser(user as UserData);

        // Parse full name into first and last
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        const nameParts = fullName.split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");

        setPhone(user.user_metadata?.phone || "");
        setAddress(user.user_metadata?.address || "");
        setCity(user.user_metadata?.city || "");
        setState(user.user_metadata?.state || "");
        setZipCode(user.user_metadata?.zip_code || "");
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
      const fullName = `${firstName} ${lastName}`.trim();

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          name: fullName,
          phone: phone,
          address: address,
          city: city,
          state: state,
          zip_code: zipCode,
          lister_role: listerRole || undefined,
          license_number: licenseNumber || undefined,
          brokerage_company: brokerageCompany || undefined,
        }
      });

      if (error) throw error;

      toast.success("Profile updated successfully");

      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser as UserData);
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
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        }
      });

      if (updateError) throw updateError;

      toast.success("Profile picture updated successfully");
      setImagePreview(null);
      setProfileImage(null);

      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser as UserData);
      }
    } catch (error: unknown) {
      console.error("Error uploading profile picture:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload profile picture");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
        }
      });

      if (error) throw error;

      toast.success("Profile picture removed successfully");
      setImagePreview(null);
      setProfileImage(null);

      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser as UserData);
      }
    } catch (error: unknown) {
      console.error("Error removing profile picture:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove profile picture");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshOpportunities = async () => {
    setIsSyncing(true);

    try {
      toast.info("Syncing Opportunities", {
        description: "Fetching latest opportunities from SAM.gov...",
      });

      const response = await fetch("/api/sync-opportunities", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      toast.success("Sync Complete", {
        description: `${data.imported || 0} new opportunities imported, ${data.updated || 0} updated`,
      });
    } catch (error) {
      console.error("Error syncing opportunities:", error);
      toast.error("Sync Failed", {
        description: error instanceof Error ? error.message : "Failed to sync opportunities",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r bg-gray-50 p-6">
          <Skeleton className="h-8 w-full bg-gray-200 mb-4" />
          <Skeleton className="h-8 w-full bg-gray-200 mb-2" />
          <Skeleton className="h-8 w-full bg-gray-200 mb-2" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-9 w-32 bg-gray-200 mb-6" />
          <Skeleton className="h-96 w-full bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar Navigation */}
      <div className="w-64 border-r bg-gray-50 p-6">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                  activeTab === tab.id
                    ? "bg-[#5B3FD9] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* My Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>
              </div>

              {/* Profile Picture Upload */}
              <div className="border-b pb-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 ring-2 ring-gray-100">
                    <AvatarImage
                      src={imagePreview || user?.user_metadata?.avatar_url || ""}
                      alt="Profile picture"
                    />
                    <AvatarFallback className="bg-purple-100 text-[#5B3FD9] text-2xl">
                      {firstName[0]?.toUpperCase() || ""}{lastName[0]?.toUpperCase() || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="default"
                      size="default"
                      className="gap-2 bg-[#5B3FD9] hover:bg-[#4A2FB8]"
                      onClick={() =>
                        document.getElementById("profile-image-input")?.click()
                      }
                      disabled={saving}
                    >
                      + Change Image
                    </Button>
                    {user?.user_metadata?.avatar_url && (
                      <Button
                        variant="outline"
                        size="default"
                        className="text-gray-700"
                        onClick={handleRemoveProfilePicture}
                        disabled={saving}
                      >
                        Remove Image
                      </Button>
                    )}
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3 ml-24">
                  We support PNGs, JPEGs and GIFs under 1MB
                </p>
                {profileImage && (
                  <div className="flex gap-2 mt-4 ml-24">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleUploadProfilePicture}
                      disabled={saving}
                      className="bg-[#5B3FD9] hover:bg-[#4A2FB8]"
                    >
                      {saving ? "Saving..." : "Save Changes"}
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
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address
                  </CardTitle>
                  <CardDescription>
                    Your location information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Washington"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
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

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="20001"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Broker Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Your broker and real estate credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="listerRole">Your Role</Label>
                    <Select value={listerRole} onValueChange={(value) => setListerRole(value as 'owner' | 'broker' | 'agent' | 'salesperson')}>
                      <SelectTrigger>
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

                  {listerRole && listerRole !== 'owner' && (
                    <>
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
                          required={listerRole === 'broker' || listerRole === 'agent'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brokerageCompany">
                          Brokerage Company <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="brokerageCompany"
                          value={brokerageCompany}
                          onChange={(e) => setBrokerageCompany(e.target.value)}
                          placeholder="Enter your brokerage company name"
                          required
                        />
                      </div>
                    </>
                  )}

                  <Button onClick={handleUpdateProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Security</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your password and security settings
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage how you receive updates and alerts
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about opportunities and matches
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications" className="text-base font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive updates about new GSA leasing opportunities
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications" className="text-base font-medium">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Get text alerts for high-priority matches
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>

                  <Button variant="default">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Data Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your data synchronization and system settings
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Opportunity Sync
                  </CardTitle>
                  <CardDescription>
                    Manually sync federal leasing opportunities from SAM.gov
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      The system automatically syncs opportunities from SAM.gov twice weekly (Mondays and Thursdays at 2 AM).
                      Use this button to trigger an immediate sync if you need the latest data.
                    </p>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            What happens during sync:
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-blue-800">
                            <li>• Fetches latest GSA lease opportunities from SAM.gov</li>
                            <li>• Updates existing opportunities with new information</li>
                            <li>• Imports new opportunities that match your criteria</li>
                            <li>• Triggers automated PDF processing for RAG chat features</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleRefreshOpportunities}
                      disabled={isSyncing}
                      className="gap-2 bg-[#5B3FD9] hover:bg-[#4A2FB8]"
                    >
                      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing from SAM.gov...' : 'Sync Opportunities Now'}
                    </Button>

                    {isSyncing && (
                      <p className="text-sm text-gray-500">
                        This may take 5-10 seconds depending on the number of opportunities...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full">
          <div className="w-64 border-r bg-gray-50 p-6">
            <Skeleton className="h-8 w-full bg-gray-200" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-9 w-32 bg-gray-200" />
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
