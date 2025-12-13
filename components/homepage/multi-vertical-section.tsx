"use client";

import React from "react";

const verticals = [
  {
    title: "Government Contractors",
    subtitle: "Win More Federal Contracts",
    description: "Extract requirements from complex RFPs/RFQs, generate compliance matrices, and get AI-powered bid/no-bid recommendations in minutes.",
    metrics: ["10+ hours saved per RFP", "75% faster analysis", "50+ data points extracted"],
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    useCases: ["Defense Contracting", "IT Services", "Professional Services", "Facilities Management"],
  },
  {
    title: "Commercial Real Estate",
    subtitle: "GSA Lease Opportunities",
    description: "Match your properties to $6B+ in annual GSA lease requirements. Automated requirement extraction and property matching for federal real estate needs.",
    metrics: ["$6B+ GSA spend annually", "Auto-match properties", "Debarment verification"],
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    useCases: ["Office Buildings", "Warehouses", "Secure Facilities", "Border Stations"],
  },
  {
    title: "Grant Seekers",
    subtitle: "Federal & State Grant Analysis",
    description: "Extract grant requirements, eligibility criteria, and compliance obligations from NOFO documents. Streamline grant proposal development.",
    metrics: ["$1.46B+ SBA FY2025", "Multi-agency coverage", "Compliance tracking"],
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-amber-600 via-orange-600 to-red-600",
    useCases: ["Research Institutions", "Non-Profits", "State/Local Governments", "Small Businesses"],
  },
  {
    title: "Legal & Compliance",
    subtitle: "Contract Intelligence",
    description: "Analyze complex solicitation documents for legal compliance, contract terms, and regulatory requirements. Reduce risk and ensure compliance.",
    metrics: ["Multi-clause analysis", "Risk assessment", "Regulatory tracking"],
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
    useCases: ["GovCon Legal Teams", "Compliance Officers", "Contract Managers", "Proposal Centers"],
  },
  {
    title: "Business Development",
    subtitle: "Opportunity Intelligence",
    description: "Track 33M+ businesses pursuing government contracts. Real-time opportunity monitoring, competitive intelligence, and win theme generation.",
    metrics: ["33M businesses tracked", "Real-time alerts", "Competitive intel"],
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    gradient: "from-rose-600 via-pink-600 to-fuchsia-600",
    useCases: ["Capture Managers", "BD Directors", "Sales Teams", "Market Researchers"],
  },
  {
    title: "Supply Chain & Procurement",
    subtitle: "Vendor Opportunity Matching",
    description: "Match your products/services to government procurement needs across federal, state, and local agencies. NAICS-based intelligent matching.",
    metrics: ["Multi-tier suppliers", "NAICS matching", "Set-aside tracking"],
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    gradient: "from-sky-600 via-blue-600 to-indigo-600",
    useCases: ["Manufacturers", "Distributors", "Service Providers", "Technology Vendors"],
  },
];

export default function MultiVerticalSection() {
  return (
    <section id="solutions" className="w-full py-24 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 mb-6 border border-indigo-100">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            Enterprise Solutions Across Industries
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            One Platform.
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Multiple Verticals.</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            From federal contracting to commercial real estate, our AI-powered intelligence platform serves enterprises across government-adjacent markets. Built for scale, trusted by professionals.
          </p>
        </div>

        {/* Verticals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {verticals.map((vertical, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${vertical.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              {/* Icon with gradient */}
              <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${vertical.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                {vertical.icon}
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {vertical.title}
                </h3>
                <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                  {vertical.subtitle}
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {vertical.description}
                </p>

                {/* Metrics */}
                <div className="space-y-2 mb-6">
                  {vertical.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{metric}</span>
                    </div>
                  ))}
                </div>

                {/* Use Cases */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Common Use Cases</p>
                  <div className="flex flex-wrap gap-2">
                    {vertical.useCases.map((useCase, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${vertical.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            Ready to transform how your organization analyzes opportunities?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Start Your Free Trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300"
            >
              Talk to Enterprise Sales
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
