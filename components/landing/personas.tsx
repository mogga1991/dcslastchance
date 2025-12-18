import { Building, Briefcase, BarChart } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

export function Personas() {
  const personas = [
    {
      icon: Briefcase,
      title: "CRE Brokers",
      question: "Breaking into federal leasing?",
      description:
        "You have the properties and relationships but can't decode RLP requirements, BBOA measurements, or security levels. FedSpace translates federal-speak into actionable intelligence.",
    },
    {
      icon: Building,
      title: "Property Owners",
      question: "GSA contacted you?",
      description:
        "You received an RLP or expression of interest but have no idea how to respond. FedSpace guides you from eligibility check through compliant submission.",
    },
    {
      icon: BarChart,
      title: "Asset Managers",
      question: "Scaling federal portfolio?",
      description:
        "You're managing multiple properties across markets and need systematic opportunity tracking. FedSpace monitors and matches your entire portfolio automatically.",
    },
  ];

  return (
    <Section className="bg-[var(--color-fedspace-surface-alt)]">
      <SectionHeader title="Built For You" />

      <div className="grid md:grid-cols-3 gap-8">
        {personas.map((persona, index) => {
          const Icon = persona.icon;
          return (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-sm border border-[var(--color-fedspace-border)]"
            >
              <div className="w-16 h-16 bg-[var(--color-fedspace-primary)]/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Icon className="h-8 w-8 text-[var(--color-fedspace-primary)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-fedspace-text-primary)] text-center mb-3">
                {persona.title}
              </h3>
              <p className="text-lg font-semibold text-[var(--color-fedspace-primary)] text-center mb-4">
                "{persona.question}"
              </p>
              <p className="text-[var(--color-fedspace-text-secondary)] leading-relaxed">
                {persona.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
