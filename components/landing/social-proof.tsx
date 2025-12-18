import { Section, SectionHeader } from "@/components/ui/section";

export function SocialProof() {
  const credibilityPoints = [
    {
      title: "2 Patents Pending",
      description: "Proprietary matching and scoring algorithms",
    },
    {
      title: "50+ RLPs Validated",
      description: "Algorithm tested against historical federal leases",
    },
    {
      title: "Veteran-Led",
      description: "Founded by federal contracting experts",
    },
    {
      title: "Minority-Owned Small Business",
      description: "8(a) certification pathway",
    },
  ];

  return (
    <Section dark>
      <SectionHeader title="Why Trust FedSpace" />

      {/* Credibility Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {credibilityPoints.map((point, index) => (
          <div key={index} className="text-center">
            <div className="inline-block p-4 bg-white/10 rounded-lg mb-4">
              <svg
                className="w-12 h-12 text-[var(--color-fedspace-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{point.title}</h3>
            <p className="text-gray-400">{point.description}</p>
          </div>
        ))}
      </div>

      {/* Market Context Box */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20">
          <p className="text-lg text-gray-300 leading-relaxed">
            The GSA manages <span className="font-bold text-white">7,500 leases</span> across{" "}
            <span className="font-bold text-white">174 million square feet</span>. In 2025 alone, DOGE
            terminated <span className="font-bold text-white">260 leases</span>—creating chaos for some
            landlords and{" "}
            <span className="font-bold text-[var(--color-fedspace-primary)]">opportunity for others</span>.
            FedSpace helps you find the opportunities.
          </p>
        </div>
      </div>
    </Section>
  );
}
