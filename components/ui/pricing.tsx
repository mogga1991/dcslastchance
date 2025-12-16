"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { FileSearch, FileText, Zap, CheckCheck, Briefcase, Database, Server } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

const payPerProposalPlans = [
  {
    name: "Quick Scan",
    description: "Fast overview of key dates and requirements",
    price: 19,
    icon: <Zap size={24} />,
    features: [
      { text: "Key dates extraction", icon: <CheckCheck size={16} /> },
      { text: "Requirements count", icon: <CheckCheck size={16} /> },
      { text: "Executive summary", icon: <CheckCheck size={16} /> },
      { text: "Basic opportunity overview", icon: <CheckCheck size={16} /> },
    ],
  },
  {
    name: "Full Analysis",
    description: "Complete extraction with bid/no-bid scoring",
    price: 39,
    icon: <FileText size={24} />,
    popular: true,
    features: [
      { text: "Complete extraction (50+ fields)", icon: <CheckCheck size={16} /> },
      { text: "Bid/no-bid scoring (0-100)", icon: <CheckCheck size={16} /> },
      { text: "Compliance matrix generation", icon: <CheckCheck size={16} /> },
      { text: "Evaluation criteria breakdown", icon: <CheckCheck size={16} /> },
      { text: "Requirements extraction", icon: <CheckCheck size={16} /> },
    ],
  },
  {
    name: "Deep Dive",
    description: "Advanced intelligence and competitive insights",
    price: 79,
    icon: <FileSearch size={24} />,
    features: [
      { text: "Everything in Full Analysis", icon: <CheckCheck size={16} /> },
      { text: "Competitive intelligence", icon: <CheckCheck size={16} /> },
      { text: "Win themes & strategies", icon: <CheckCheck size={16} /> },
      { text: "Past performance analysis", icon: <CheckCheck size={16} /> },
      { text: "Strategic recommendations", icon: <CheckCheck size={16} /> },
    ],
  },
];

const subscriptionPlans = [
  {
    name: "Free",
    description: "Get started with basic proposal features",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    commission: "30% commission on earnings",
    features: [
      { text: "5 listings or proposals/month", icon: <Briefcase size={20} /> },
      { text: "AI proposal assistants", icon: <Database size={20} /> },
      { text: "Basic templates", icon: <Server size={20} /> },
    ],
    includes: [
      "Free includes:",
      "Unlimited cards",
      "AI-powered opportunity matching",
      "Basic proposal templates",
      "Email support",
      "Dashboard analytics",
    ],
  },
  {
    name: "Professional",
    description: "Best for growing proposal teams",
    price: 299,
    yearlyPrice: 2990,
    buttonText: "Get Started",
    buttonVariant: "default" as const,
    popular: true,
    commission: "Only 10% commission",
    features: [
      { text: "Unlimited listings & proposals", icon: <Briefcase size={20} /> },
      { text: "Premium templates", icon: <Database size={20} /> },
      { text: "Advanced analytics", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Free, plus:",
      "Unlimited proposals per month",
      "Premium proposal templates",
      "Priority email & chat support",
      "Advanced analytics & reporting",
      "Custom branding",
      "Team collaboration (up to 10 users)",
      "CRM integrations",
    ],
  },
  {
    name: "Sentyr Only",
    description: "AI-powered RFP analysis without marketplace",
    price: 129,
    yearlyPrice: 1290,
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    commission: "No commission fees",
    features: [
      { text: "AI RFP/RFI/RFQ/Grant analysis", icon: <Briefcase size={20} /> },
      { text: "Bid/no-bid scoring", icon: <Database size={20} /> },
      { text: "10 analyses stored", icon: <Server size={20} /> },
    ],
    includes: [
      "Sentyr Only includes:",
      "Strategic intelligence & insights",
      "Requirements & criteria extraction",
      "Competitor positioning insights",
      "Bid/no-bid scoring recommendations",
      "Document comparison & change analysis",
      "Exportable compliance matrices",
      "Premium processing (faster & higher-accuracy)",
      "Email support",
    ],
  },
  {
    name: "Enterprise",
    description: "Custom solution for large organizations",
    price: null,
    yearlyPrice: null,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    commission: "Custom commission rates",
    features: [
      { text: "Unlimited everything", icon: <Briefcase size={20} /> },
      { text: "White-label branding", icon: <Database size={20} /> },
      { text: "Dedicated account manager", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Professional, plus:",
      "Custom commission rates (negotiable)",
      "Custom proposal templates & builder",
      "24/7 priority support with SLA",
      "Enterprise analytics & BI integration",
      "Unlimited team members",
      "Custom integrations & API access",
      "Single Sign-On (SSO)",
      "Quarterly business reviews",
      "Custom training & onboarding",
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-neutral-50 border border-gray-200 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0"
              ? "text-white"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm shadow-orange-600 border-orange-600 bg-gradient-to-t from-orange-500 via-orange-400 to-orange-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1"
              ? "text-white"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-4 shadow-sm shadow-orange-600 border-orange-600 bg-gradient-to-t from-orange-500 via-orange-400 to-orange-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-black">
              Save 17%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      className="px-4 pt-20 pb-12 min-h-screen max-w-7xl mx-auto relative"
      ref={pricingRef}
    >
      <article className="text-left mb-6 space-y-4 max-w-2xl">
        <h2 className="md:text-6xl text-4xl capitalize font-medium text-gray-900 mb-4">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-start"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Choose Your Plan
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="md:text-base text-sm text-gray-600 w-[80%]"
        >
          Scale your business with our flexible pricing options. Start free and
          upgrade as you grow.
        </TimelineContent>
      </article>

      {/* Pay-Per-Proposal Section */}
      <div className="mb-16">
        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-semibold mb-2">Pay Per Proposal</h3>
          <p className="text-muted-foreground">
            No subscription needed. Pay only for what you use.
          </p>
        </TimelineContent>

        <div className="grid md:grid-cols-3 gap-6 py-6">
          {payPerProposalPlans.map((plan, index) => (
            <TimelineContent
              key={plan.name}
              as="div"
              animationNum={2 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <Card
                className={`relative border border-neutral-200 h-full ${
                  plan.popular
                    ? "ring-2 ring-orange-500 bg-orange-50"
                    : "bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 ml-1">per proposal</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <button
                    className={`w-full mb-6 p-4 text-lg rounded-xl transition-all ${
                      plan.popular
                        ? "bg-gradient-to-t from-orange-500 to-orange-600 shadow-lg shadow-orange-500 border border-orange-400 text-white hover:shadow-xl"
                        : "bg-gradient-to-t from-neutral-900 to-neutral-600 shadow-lg shadow-neutral-900 border border-neutral-700 text-white hover:shadow-xl"
                    }`}
                  >
                    Buy {plan.name}
                  </button>

                  <div className="space-y-2 pt-4 border-t border-neutral-200">
                    <h4 className="font-medium text-sm text-gray-900 mb-3">
                      What&apos;s included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <span className="h-5 w-5 bg-white border border-orange-500 rounded-full grid place-content-center mt-0.5">
                            {feature.icon}
                          </span>
                          <span className="text-sm text-gray-600">
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          ))}
        </div>
      </div>

      {/* Monthly Subscriptions Section */}
      <div className="mb-8">
        <TimelineContent
          as="div"
          animationNum={5}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-semibold mb-2">Monthly Subscriptions</h3>
          <p className="text-muted-foreground mb-6">
            Best value for regular users. Includes monthly credits and lower commissions.
          </p>
          <PricingSwitch onSwitch={togglePricingPeriod} className="w-fit mx-auto" />
        </TimelineContent>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
          {subscriptionPlans.map((plan, index) => (
            <TimelineContent
              key={plan.name}
              as="div"
              animationNum={6 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <Card
                className={`relative border border-neutral-200 h-full ${
                  plan.popular
                    ? "ring-2 ring-orange-500 bg-orange-50"
                    : "bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline mb-2">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-semibold text-gray-900">
                          $
                          <NumberFlow
                            format={{
                              currency: "USD",
                            }}
                            value={isYearly ? plan.yearlyPrice! : plan.price}
                            className="text-4xl font-semibold"
                          />
                        </span>
                        <span className="text-gray-600 ml-1">
                          /{isYearly ? "year" : "month"}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-semibold text-gray-900">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-orange-600 font-medium">
                    {plan.commission}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <button
                    className={`w-full mb-6 p-4 text-lg rounded-xl transition-all ${
                      plan.popular
                        ? "bg-gradient-to-t from-orange-500 to-orange-600 shadow-lg shadow-orange-500 border border-orange-400 text-white hover:shadow-xl"
                        : "bg-gradient-to-t from-neutral-900 to-neutral-600 shadow-lg shadow-neutral-900 border border-neutral-700 text-white hover:shadow-xl"
                    }`}
                  >
                    {plan.buttonText}
                  </button>

                  <div className="space-y-3 pt-4 border-t border-neutral-200">
                    <h4 className="text-base font-semibold uppercase text-gray-900 mb-3">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-2 font-medium">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <span className="h-5 w-5 bg-white border border-orange-500 rounded-full grid place-content-center mt-0.5 flex-shrink-0">
                            <CheckCheck className="h-3 w-3 text-orange-500" />
                          </span>
                          <span className="text-xs text-gray-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <TimelineContent
          as="p"
          animationNum={10}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-muted-foreground"
        >
          Need a custom plan?{" "}
          <span className="text-primary cursor-pointer hover:underline">
            Contact us
          </span>
        </TimelineContent>
      </div>
    </div>
  );
}
