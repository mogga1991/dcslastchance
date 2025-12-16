"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SubscriptionDetails = {
  id: string;
  productId: string;
  status: string;
  amount: number;
  currency: string;
  recurringInterval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  organizationId: string | null;
};

type SubscriptionDetailsResult = {
  hasSubscription: boolean;
  subscription?: SubscriptionDetails;
  error?: string;
  errorType?: "CANCELED" | "EXPIRED" | "GENERAL";
};

interface PricingTableProps {
  subscriptionDetails: SubscriptionDetailsResult;
}

export default function PricingTable({
  subscriptionDetails,
}: PricingTableProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session.data?.user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const _handleCheckout = async (productId: string, slug: string) => {
    if (isAuthenticated === false) {
      router.push("/sign-in");
      return;
    }

    try {
      await authClient.checkout({
        products: [productId],
        slug: slug,
      });
    } catch (error) {
      console.error("Checkout failed:", error);
      // TODO: Add user-facing error notification
      toast.error("Oops, something went wrong");
    }
  };

  const _handleManageSubscription = async () => {
    try {
      await authClient.customer.portal();
    } catch (error) {
      console.error("Failed to open customer portal:", error);
      toast.error("Failed to open subscription management");
    }
  };

  const _STARTER_TIER = process.env.NEXT_PUBLIC_STARTER_TIER || "placeholder-tier";
  const _STARTER_SLUG = process.env.NEXT_PUBLIC_STARTER_SLUG || "placeholder-slug";

  const _isCurrentPlan = (tierProductId: string) => {
    return (
      subscriptionDetails.hasSubscription &&
      subscriptionDetails.subscription?.productId === tierProductId &&
      subscriptionDetails.subscription?.status === "active"
    );
  };

  const _formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="flex flex-col items-center justify-center px-4 sm:px-6 mb-24 w-full">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
          Choose Your Plan
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Scale your business with our flexible pricing options. Start free and
          upgrade as you grow.
        </p>
      </div>

      {/* Pay-Per-Proposal Section */}
      <div className="w-full max-w-6xl mb-16 px-4">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Pay Per Proposal</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            No subscription needed. Pay only for what you use.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Scan</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">$19</span>
                <span className="text-muted-foreground"> per proposal</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Key dates extraction</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Requirements count</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Executive summary</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Buy Quick Scan
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Full Analysis</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">$39</span>
                <span className="text-muted-foreground"> per proposal</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Complete extraction (50+ fields)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Bid/no-bid scoring</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Compliance matrix</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Buy Full Analysis</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deep Dive</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">$79</span>
                <span className="text-muted-foreground"> per proposal</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Everything in Full Analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Competitive intelligence</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm">Win themes & strategies</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Buy Deep Dive
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Monthly Subscriptions</h2>
          <p className="text-muted-foreground">
            Best value for regular users. Includes monthly analysis credits.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {/* Free Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">$0</span>
              </div>
              <CardDescription className="mt-2">
                30% commission on earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  5 listings or 5 proposals per month
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">AI-powered proposal assistants</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  AI-powered opportunity matching
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Basic proposal templates</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Email support</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Dashboard analytics</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Professional Tier */}
          <Card className="relative border-2 border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">$299</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-2">
                Only 10% commission on earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Unlimited listings per month</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Unlimited proposals per month</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">AI-powered proposal assistants</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  AI-powered opportunity matching
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Premium proposal templates</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Priority email & chat support</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Advanced analytics & reporting</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Custom branding</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Team collaboration (up to 10 users)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">CRM integrations</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Get Started</Button>
            </CardFooter>
          </Card>

          {/* Sentyr Only Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Sentyr Only</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">$129</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-2">
                No commission fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  AI-powered RFP/RFI/RFQ/Grant analysis
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Strategic intelligence & insights
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Requirements & evaluation criteria extraction
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Competitor positioning insights</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Bid/no-bid scoring recommendations
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Document comparison & change analysis
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Exportable compliance matrices</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Premium processing (faster & higher-accuracy)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Email support</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Dashboard history (10 analyses stored)
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <CardDescription className="mt-2">
                Custom commission rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Unlimited everything</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Custom commission rates (negotiable)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Custom proposal templates & builder
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">24/7 priority support with SLA</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Enterprise analytics & BI integration
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">White-label branding</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Unlimited team members</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Dedicated account manager</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">
                  Custom integrations & API access
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Single Sign-On (SSO)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Quarterly business reviews</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Custom training & onboarding</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Need a custom plan?{" "}
          <span className="text-primary cursor-pointer hover:underline">
            Contact us
          </span>
        </p>
      </div>
    </section>
  );
}
