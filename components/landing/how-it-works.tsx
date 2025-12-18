export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "List Your Property",
      description:
        "2-minute wizard captures location, RSF, building class, availability date, and compliance status. No floor plans required to start.",
      bullets: [
        "Simple address-based lookup",
        "Automated building classification",
      ],
    },
    {
      number: 2,
      title: "Get Matched",
      description:
        "Our AI scans active GSA solicitations daily and scores each opportunity 0-100 based on location, space requirements, building specs, and compliance fit.",
      bullets: [
        "Real-time solicitation scanning",
        "Smart compatibility scoring",
      ],
    },
    {
      number: 3,
      title: "Generate Submission",
      description:
        "One click generates compliant RLP response documents—compliance matrices, pricing schedules, and required attachments pre-filled from your property data.",
      bullets: [
        "Automated form filling",
        "Error-free compliance matrices",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            A streamlined process to get your property in front of federal tenants.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center`}
            >
              {/* Screenshot/Mockup */}
              <div className="flex-1 w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[var(--color-fedspace-primary)]/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                        {step.number === 1 && (
                          <svg
                            className="w-8 h-8 text-[var(--color-fedspace-primary)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        )}
                        {step.number === 2 && (
                          <svg
                            className="w-8 h-8 text-[var(--color-fedspace-primary)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                        )}
                        {step.number === 3 && (
                          <svg
                            className="w-8 h-8 text-[var(--color-fedspace-primary)]"
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
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Step {step.number}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-[var(--color-fedspace-primary)] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-[var(--color-fedspace-primary)] flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
