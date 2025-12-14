"use client";

import FooterSection from "@/components/homepage/footer";
import { HeroSection } from "@/components/ui/light-saas-hero-section";
import HeroHighlightSection from "@/components/homepage/hero-highlight-section";
import AnimatedStatsSection from "@/components/homepage/animated-stats-section";
import MultiVerticalSection from "@/components/homepage/multi-vertical-section";
import GovernmentBuysEverythingSection from "@/components/homepage/government-buys-everything-section";
import ValuePropositionSection from "@/components/homepage/value-proposition-section";
import MarketResilienceSection from "@/components/homepage/market-resilience-section";
import SocialProofSection from "@/components/homepage/social-proof-section";
import { Stats } from "@/components/ui/statistics-card";
import Testimonials from "@/components/ui/testimonials";
// import { getSubscriptionDetails } from "@/lib/subscription";
// import PricingTable from "./pricing/_component/pricing-table";

export default function Home() {
  // Temporarily disabled while building landing page sections
  // const subscriptionDetails = await getSubscriptionDetails();

  return (
    <>
      <HeroSection />
      <Stats />
      <AnimatedStatsSection />
      <MultiVerticalSection />
      <GovernmentBuysEverythingSection />
      <ValuePropositionSection />
      <MarketResilienceSection />
      <SocialProofSection />
      <HeroHighlightSection />
      <Testimonials />
      {/* <PricingTable subscriptionDetails={subscriptionDetails} /> */}
      <FooterSection />
    </>
  );
}
