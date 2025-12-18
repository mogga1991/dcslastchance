import { FileText, Clock, XCircle } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

export function Problem() {
  const painPoints = [
    {
      icon: FileText,
      stat: "80-200 pages",
      title: "RLPs are overwhelming",
      description:
        "Hidden compliance rules, security levels, ABAAS requirements, and pricing formulas buried in dense government documents.",
      color: "red",
    },
    {
      icon: Clock,
      stat: "8-12 hours",
      title: "Manual process kills deals",
      description:
        "Brokers spend days on each submission—extracting requirements, building compliance matrices, calculating pricing.",
      color: "orange",
    },
    {
      icon: XCircle,
      stat: "70%+",
      title: "Opportunities missed",
      description:
        "By the time you find an RLP, read it, and determine if your property qualifies, the deadline has passed.",
      color: "yellow",
    },
  ];

  const colorClasses = {
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <Section className="bg-[var(--color-fedspace-surface-alt)]">
      <SectionHeader title="Federal Leasing is Broken" />

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {painPoints.map((point, index) => {
          const Icon = point.icon;
          return (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-sm border border-[var(--color-fedspace-border)]"
            >
              <div
                className={`w-12 h-12 ${
                  colorClasses[point.color as keyof typeof colorClasses]
                } rounded-lg flex items-center justify-center mb-4`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-[var(--color-fedspace-text-primary)] mb-2">
                {point.stat}
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-fedspace-text-primary)] mb-3">
                {point.title}
              </h3>
              <p className="text-[var(--color-fedspace-text-secondary)]">{point.description}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Callout */}
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-[var(--color-fedspace-danger)]">
          <p className="text-lg text-[var(--color-fedspace-text-primary)] leading-relaxed">
            The federal government pays{" "}
            <span className="font-bold text-[var(--color-fedspace-danger)]">$6 billion annually</span>{" "}
            to rent commercial space. Most of it goes to the same landlords because breaking in is too
            hard.
          </p>
        </div>
      </div>
    </Section>
  );
}
