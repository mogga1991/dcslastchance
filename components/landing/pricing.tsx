import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

export function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "1 property listing",
        "Basic match alerts",
        "Limited compliance checks",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$199",
      period: "month",
      badge: "RECOMMENDED",
      features: [
        "10 property listings",
        "Unlimited match scoring",
        "Full compliance wizard",
        "Submission document generation",
        "Priority deadline alerts",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      features: [
        "Unlimited listings",
        "White-label option",
        "API access",
        "Dedicated support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <Section id="pricing" className="bg-white">
      <SectionHeader title="Simple, Transparent Pricing" />

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {tiers.map((tier, index) => (
          <div
            key={index}
            className={`relative p-8 rounded-lg border-2 ${
              tier.highlighted
                ? "border-[var(--color-fedspace-primary)] shadow-lg scale-105"
                : "border-[var(--color-fedspace-border)]"
            } bg-white`}
          >
            {tier.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[var(--color-fedspace-primary)] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {tier.badge}
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[var(--color-fedspace-text-primary)] mb-2">
                {tier.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-[var(--color-fedspace-text-primary)]">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-[var(--color-fedspace-text-secondary)]">/{tier.period}</span>
                )}
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {tier.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[var(--color-fedspace-success)] flex-shrink-0 mt-0.5" />
                  <span className="text-[var(--color-fedspace-text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href={tier.name === "Enterprise" ? "/contact" : "/sign-up"} className="block">
              <Button
                className={`w-full ${
                  tier.highlighted
                    ? "bg-[var(--color-fedspace-primary)] hover:bg-[var(--color-fedspace-primary-dark)] text-white"
                    : "bg-white border-2 border-[var(--color-fedspace-primary)] text-[var(--color-fedspace-primary)] hover:bg-[var(--color-fedspace-primary)]/10"
                }`}
              >
                {tier.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Below Pricing Note */}
      <div className="text-center mb-8">
        <p className="text-[var(--color-fedspace-text-secondary)]">
          All plans include a <span className="font-semibold">14-day free trial</span>. No credit card
          required.
        </p>
      </div>

      {/* Success Fee Option */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-[var(--color-fedspace-primary)]/10 p-6 rounded-lg border border-[var(--color-fedspace-primary)]">
          <p className="text-center text-[var(--color-fedspace-text-primary)]">
            <span className="font-bold">Success Fee Option:</span> Pay 1-2% of executed lease value instead
            of monthly subscription. Available for Enterprise customers.
          </p>
        </div>
      </div>
    </Section>
  );
}
