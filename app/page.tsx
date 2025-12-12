import FooterSection from "@/components/homepage/footer";
import { HeroSection } from "@/components/ui/light-saas-hero-section";
import ServicesSection from "@/components/homepage/services-section";
import HeroHighlightSection from "@/components/homepage/hero-highlight-section";
import Integrations from "@/components/homepage/integrations";
// import { getSubscriptionDetails } from "@/lib/subscription";
// import PricingTable from "./pricing/_component/pricing-table";

export default async function Home() {
  // Temporarily disabled while building landing page sections
  // const subscriptionDetails = await getSubscriptionDetails();

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HeroHighlightSection />
      <Integrations />
      {/* <PricingTable subscriptionDetails={subscriptionDetails} /> */}
      <FooterSection />
    </>
  );
}
