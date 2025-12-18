import { Section, SectionHeader } from "@/components/ui/section";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "List Your Property",
      description:
        "2-minute wizard captures location, RSF, building class, availability date, and compliance status. No floor plans required to start.",
      visual: "form",
    },
    {
      number: "2",
      title: "Get Matched",
      description:
        "Our AI scans active GSA solicitations daily and scores each opportunity 0-100 based on location, space requirements, building specs, and compliance fit.",
      visual: "dashboard",
    },
    {
      number: "3",
      title: "Generate Submission",
      description:
        "One click generates compliant RLP response documents—compliance matrices, pricing schedules, and required attachments pre-filled from your property data.",
      visual: "document",
    },
  ];

  return (
    <Section id="how-it-works" className="bg-white">
      <SectionHeader
        title="How FedSpace Works"
        subtitle="From listing to submission in 30 minutes"
      />

      <div className="space-y-16">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } gap-12 items-center`}
          >
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--color-fedspace-primary)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-3xl font-serif font-bold text-[var(--color-fedspace-text-primary)]">
                  {step.title}
                </h3>
              </div>
              <p className="text-lg text-[var(--color-fedspace-text-secondary)] leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Visual Mockup */}
            <div className="flex-1 w-full">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 shadow-lg border border-[var(--color-fedspace-border)] aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-[var(--color-fedspace-primary)]/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    {step.visual === "form" && (
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    {step.visual === "dashboard" && (
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    )}
                    {step.visual === "document" && (
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
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                    {step.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Result Callout */}
      <div className="mt-16 text-center">
        <div className="inline-block bg-[var(--color-fedspace-success)]/10 px-8 py-4 rounded-lg border-2 border-[var(--color-fedspace-success)]">
          <p className="text-2xl font-bold text-[var(--color-fedspace-text-primary)]">
            What used to take 8-12 hours now takes{" "}
            <span className="text-[var(--color-fedspace-success)]">30 minutes</span>.
          </p>
        </div>
      </div>
    </Section>
  );
}
