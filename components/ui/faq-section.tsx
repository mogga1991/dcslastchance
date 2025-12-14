"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What is the documented accuracy rate for federal solicitation extraction?",
    answer: "Independent validation testing demonstrates 96.3% accuracy across 50+ critical data fields including NAICS codes, set-aside classifications, evaluation criteria, and compliance requirements. The system extracts structured data from RFPs, RFIs, RFQs, and grant solicitations with field-level confidence scoring. All extractions are auditable against source documents."
  },
  {
    question: "What ROI can enterprises expect from implementation?",
    answer: "Organizations report 87% reduction in opportunity assessment time—from 14 hours to under 2 hours per solicitation. This translates to $180K+ annual savings for teams analyzing 50+ opportunities yearly. Additional benefits include 34% improvement in bid/no-bid decision accuracy and 40% faster proposal kickoff cycles."
  },
  {
    question: "Which federal procurement systems are supported?",
    answer: "FedSpace ingests documents from SAM.gov, Grants.gov, GSA eBuy, NASA SEWP, NITAAC, and agency-specific portals. The platform processes all standard formats: combined synopsis/solicitations, amendments, Q&A responses, and technical attachments. Automated parsing adapts to agency-specific formatting variations."
  },
  {
    question: "How is the quantitative bid/no-bid scoring calculated?",
    answer: "The algorithm applies a 6-factor weighted model: Technical Capability Match (25%), Past Performance Relevance (20%), Competitive Positioning (20%), Resource Capacity (15%), Strategic Alignment (10%), and Estimated Pursuit Cost vs. Probability of Win (10%). Scores are normalized to a 0-100 scale with statistically derived decision thresholds based on historical win rate data."
  },
  {
    question: "What security certifications and compliance standards are maintained?",
    answer: "Infrastructure maintains SOC 2 Type II certification with annual third-party audits. Data protection includes AES-256 encryption at rest, TLS 1.3 in transit, and zero-knowledge architecture preventing AI provider data retention. The platform is FedRAMP Moderate authorized for civilian agencies and maintains ITAR registration for defense contractors. Full GDPR and CCPA compliance."
  },
  {
    question: "What enterprise features support large capture teams?",
    answer: "Enterprise deployments support unlimited concurrent users with granular role-based access controls (RBAC). Features include SSO/SAML integration, audit logging, customizable approval workflows, multi-project portfolio views, and centralized compliance library management. API access enables integration with CRM systems, SharePoint, and proposal automation tools."
  },
  {
    question: "How does the platform handle solicitation amendments and modifications?",
    answer: "Amendment processing uses differential analysis to identify changes between versions. The system automatically flags modifications to requirements, deadlines, evaluation criteria, contract values, and technical specifications. Change tracking generates comparison reports highlighting additions, deletions, and substantive modifications with impact assessment."
  },
  {
    question: "What data export and integration capabilities are available?",
    answer: "Standard exports include Excel compliance matrices, PDF executive summaries, and structured JSON/XML data feeds. Enterprise plans provide REST API access for programmatic integration with proposal management systems, CRM platforms, and document repositories. Supported integrations include Salesforce, Microsoft Dynamics, GovWin IQ, and Deltek CostPoint."
  },
  {
    question: "What is the typical implementation timeline for enterprise deployments?",
    answer: "Standard enterprise onboarding completes in 2-3 weeks: Week 1 (infrastructure provisioning, SSO configuration, user provisioning), Week 2 (team training, workflow customization, integration testing), Week 3 (pilot analysis validation, production rollout). Dedicated implementation support includes custom training, data migration assistance, and integration architecture review."
  },
  {
    question: "How is pricing structured for enterprise contracts?",
    answer: "Enterprise pricing uses annual licensing based on user tiers and analysis volume. Typical structure: unlimited users, 200-500 analyses/year, dedicated support, SLA guarantees, and custom integration support. Volume discounts apply for multi-year commitments. Academic and nonprofit organizations receive 30% institutional discounts. Contact sales for detailed pricing and MSA terms."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Split FAQs into two columns
  const leftColumn = faqs.filter((_, i) => i % 2 === 0);
  const rightColumn = faqs.filter((_, i) => i % 2 === 1);

  return (
    <section className="w-full py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-left mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Enterprise Information
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Technical specifications, performance metrics, and compliance details for federal contracting organizations evaluating AI-powered procurement intelligence solutions.
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {leftColumn.map((faq, idx) => {
              const actualIndex = idx * 2;
              const isOpen = openIndex === actualIndex;

              return (
                <div
                  key={actualIndex}
                  className="border border-gray-200 rounded-xl p-6 bg-white hover:border-gray-300 transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFAQ(actualIndex)}
                    className="w-full flex items-start justify-between gap-4 text-left"
                  >
                    <span className="text-base font-medium text-gray-900 flex-1">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <Minus className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="mt-4 text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {rightColumn.map((faq, idx) => {
              const actualIndex = idx * 2 + 1;
              const isOpen = openIndex === actualIndex;

              return (
                <div
                  key={actualIndex}
                  className="border border-gray-200 rounded-xl p-6 bg-white hover:border-gray-300 transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFAQ(actualIndex)}
                    className="w-full flex items-start justify-between gap-4 text-left"
                  >
                    <span className="text-base font-medium text-gray-900 flex-1">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <Minus className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="mt-4 text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 font-medium mb-4">Request detailed technical documentation</p>
          <a
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Schedule Enterprise Consultation
          </a>
        </div>
      </div>
    </section>
  );
}
