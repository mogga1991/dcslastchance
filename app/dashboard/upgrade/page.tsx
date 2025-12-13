import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default async function UpgradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      commission: "30% commission on earnings",
      features: [
        "5 listings or 5 proposals per month",
        "AI-powered proposal assistants",
        "AI-powered opportunity matching",
        "Basic proposal templates",
        "Email support",
        "Dashboard analytics",
      ],
      cta: "Current Plan",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      commission: "Only 10% commission on earnings",
      features: [
        "Unlimited listings per month",
        "Unlimited proposals per month",
        "AI-powered proposal assistants",
        "AI-powered opportunity matching",
        "Premium proposal templates",
        "Priority email & chat support",
        "Advanced analytics & reporting",
        "Custom branding",
        "Team collaboration (up to 10 users)",
        "CRM integrations",
      ],
      cta: "Upgrade Now",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Sentyr Only",
      price: "$129",
      period: "/month",
      commission: "No commission fees",
      features: [
        "AI-powered RFP/RFI/RFQ/Grant analysis",
        "Strategic intelligence & insights",
        "Requirements & evaluation criteria extraction",
        "Competitor positioning insights",
        "Bid/no-bid scoring recommendations",
        "Document comparison & change analysis",
        "Exportable compliance matrices",
        "Premium processing (faster & higher-accuracy)",
        "Email support",
        "Dashboard history (10 analyses stored)",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      commission: "Custom commission rates",
      features: [
        "Unlimited everything",
        "Custom commission rates (negotiable)",
        "Custom proposal templates & builder",
        "24/7 priority support with SLA",
        "Enterprise analytics & BI integration",
        "White-label branding",
        "Unlimited team members",
        "Dedicated account manager",
        "Custom integrations & API access",
        "Single Sign-On (SSO)",
        "Quarterly business reviews",
        "Custom training & onboarding",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-2 text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Scale your business with our flexible pricing options. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg border ${
                plan.highlighted
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              } bg-card text-card-foreground p-6 flex flex-col`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.commission}
                </p>
              </div>

              <div className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`mt-6 w-full ${
                  plan.highlighted ? "" : "variant-outline"
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
