import { Target, Bell, CheckSquare, FileOutput, Link as LinkIcon, History } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

export function Features() {
  const features = [
    {
      icon: Target,
      title: "Smart Matching",
      description:
        "AI-powered scoring weighs location (35%), space fit (30%), building specs (20%), pricing (10%), and historical success (5%)",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Bell,
      title: "Deadline Alerts",
      description:
        "Never miss an RLP. Get notified when new opportunities match your properties and when deadlines approach.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: CheckSquare,
      title: "Compliance Wizard",
      description:
        "Guided workflow for ABAAS accessibility, ISC security levels, seismic requirements, and agency-specific conditions.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: FileOutput,
      title: "Document Generation",
      description:
        "Auto-populate GSA-compliant response packages including compliance matrices, pricing schedules, and standard forms.",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: LinkIcon,
      title: "SAM.gov Integration",
      description:
        "Direct integration with SAM.gov for real-time opportunity tracking. No more manual searching.",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: History,
      title: "Match History",
      description:
        "Track every opportunity you've evaluated. See what won, what lost, and why.",
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <Section id="features" className="bg-[var(--color-fedspace-surface-alt)]">
      <SectionHeader title="Built for Federal Leasing" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-sm border border-[var(--color-fedspace-border)] hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-lg flex items-center justify-center mb-6`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-fedspace-text-primary)] mb-3">
                {feature.title}
              </h3>
              <p className="text-[var(--color-fedspace-text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
