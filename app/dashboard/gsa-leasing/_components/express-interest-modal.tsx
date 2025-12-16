"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, CheckCircle2, Building2, AlertCircle } from "lucide-react";
import type { SAMOpportunity } from "@/lib/sam-gov";

interface BrokerListing {
  id: string;
  address: string;
  city: string;
  state: string;
  total_sf: number;
}

interface ExpressInterestModalProps {
  opportunity: SAMOpportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  onInquirySubmitted?: (opportunityId: string) => void;
}

export function ExpressInterestModal({
  opportunity,
  open,
  onOpenChange,
  userEmail = "",
  onInquirySubmitted,
}: ExpressInterestModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingListings, setLoadingListings] = useState(false);
  const [brokerListings, setBrokerListings] = useState<BrokerListing[]>([]);

  // Form state
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState("");
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [customAddress, setCustomAddress] = useState("");
  const [message, setMessage] = useState("");

  const fetchBrokerListings = async () => {
    setLoadingListings(true);
    try {
      const response = await fetch("/api/broker-listings");
      if (response.ok) {
        const data = await response.json();
        setBrokerListings(data.listings || []);
      }
    } catch (err) {
      console.error("Error fetching broker listings:", err);
    } finally {
      setLoadingListings(false);
    }
  };

  // Fetch broker listings when modal opens
  useEffect(() => {
    if (open && brokerListings.length === 0) {
      fetchBrokerListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Update email when userEmail prop changes
  useEffect(() => {
    setEmail(userEmail);
  }, [userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;

    setLoading(true);
    setError(null);

    try {
      // Determine property address from selection or custom input
      let propertyAddress = "";
      let propertyId = null;

      if (selectedListing === "custom") {
        if (!customAddress.trim()) {
          setError("Please enter your property address");
          setLoading(false);
          return;
        }
        propertyAddress = customAddress.trim();
      } else if (selectedListing) {
        const listing = brokerListings.find((l) => l.id === selectedListing);
        if (listing) {
          propertyAddress = `${listing.address}, ${listing.city}, ${listing.state}`;
          propertyId = listing.id;
        }
      } else {
        setError("Please select a property or enter an address");
        setLoading(false);
        return;
      }

      // Validate email
      if (!email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }

      // Submit inquiry
      const response = await fetch("/api/opportunity-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: opportunity.noticeId || opportunity.solicitationNumber,
          opportunity_title: opportunity.title,
          user_email: email.trim(),
          user_phone: phone.trim() || null,
          property_address: propertyAddress,
          property_id: propertyId,
          message: message.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit interest");
      }

      // Success!
      setSuccess(true);

      // Notify parent component
      if (onInquirySubmitted) {
        const opportunityId = opportunity.noticeId || opportunity.solicitationNumber;
        onInquirySubmitted(opportunityId);
      }

      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setSuccess(false);
        setPhone("");
        setSelectedListing("");
        setCustomAddress("");
        setMessage("");
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      console.error("Error submitting interest:", err);
      setError(err instanceof Error ? err.message : "Failed to submit interest");
    } finally {
      setLoading(false);
    }
  };

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Express Interest</DialogTitle>
          <DialogDescription>
            Let us know you&apos;re interested in this opportunity and we&apos;ll help connect you.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              Interest Submitted!
            </h3>
            <p className="text-gray-600">
              Thanks! We&apos;ll review your submission and be in touch within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opportunity Title (Read-only) */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Label className="text-sm font-medium text-blue-900 mb-1 block">
                Opportunity
              </Label>
              <p className="text-sm text-blue-800 font-medium">{opportunity.title}</p>
              {opportunity.solicitationNumber && (
                <p className="text-xs text-blue-600 mt-1 font-mono">
                  {opportunity.solicitationNumber}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Your Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">Your Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                disabled={loading}
              />
            </div>

            {/* Property Selection */}
            <div className="space-y-2">
              <Label htmlFor="property">
                Property to Submit <span className="text-red-500">*</span>
              </Label>
              {loadingListings ? (
                <div className="flex items-center gap-2 p-3 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading your properties...
                </div>
              ) : brokerListings.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    You haven&apos;t listed any properties yet.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      window.location.href = "/dashboard/broker-listing";
                    }}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    List a Property
                  </Button>
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <Label htmlFor="custom-address" className="text-sm text-yellow-900">
                      Or enter your property address manually:
                    </Label>
                    <Input
                      id="custom-address"
                      value={customAddress}
                      onChange={(e) => {
                        setCustomAddress(e.target.value);
                        setSelectedListing("custom");
                      }}
                      placeholder="123 Main St, City, State"
                      className="mt-2"
                      disabled={loading}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Select value={selectedListing} onValueChange={setSelectedListing} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property from your listings" />
                    </SelectTrigger>
                    <SelectContent>
                      {brokerListings.map((listing) => (
                        <SelectItem key={listing.id} value={listing.id}>
                          {listing.address}, {listing.city}, {listing.state} - {listing.total_sf.toLocaleString()} SF
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Enter custom address...</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Custom address input when "custom" is selected */}
                  {selectedListing === "custom" && (
                    <div className="mt-2">
                      <Input
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder="Enter your property address"
                        disabled={loading}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Message (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your property and why it&apos;s a good fit for this opportunity..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Interest"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
