"use client";

import React from "react";

const resilienceFactors = [
  {
    title: "Efficiency Drives Opportunity",
    description: "Government efficiency initiatives don&apos;t eliminate procurement—they increase competition for remaining contracts. Smart analysis becomes more critical, not less.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    stat: "Competition ↑",
  },
  {
    title: "Budget Optimization ≠ Budget Elimination",
    description: "Federal spending shifts toward measurable ROI. Agencies still need contractors who can demonstrate value efficiently—your analysis proves that value.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    stat: "$700B+ Annual",
  },
  {
    title: "Mission-Critical Services Remain",
    description: "Defense, infrastructure, IT modernization, cybersecurity—these aren't optional. Agencies must procure them, regardless of political winds.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    stat: "Always Required",
  },
  {
    title: "Multi-Market Platform",
    description: "We serve 6+ verticals beyond federal contracting—state/local government, grants, commercial real estate, supply chain. One market contracts, another expands.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    stat: "6+ Verticals",
  },
];

const fundamentals = [
  {
    fact: "$700B+",
    detail: "Annual federal procurement spend",
    subtext: "Across defense, civilian agencies, and infrastructure",
  },
  {
    fact: "$6B+",
    detail: "GSA commercial real estate leases annually",
    subtext: "Physical facilities remain essential",
  },
  {
    fact: "$1.46B+",
    detail: "SBA FY2025 budget authority",
    subtext: "Small business support programs grow",
  },
  {
    fact: "33M",
    detail: "Businesses in the U.S. pursuing contracts",
    subtext: "Competition intensifies, not disappears",
  },
];

export default function MarketResilienceSection() {
  return (
    <section className="w-full py-24 px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-300 mb-6 border border-indigo-500/30">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Market-Resilient by Design
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Built for the Long Game
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Political cycles change. Budget priorities shift. But one constant remains: the federal government is the world's largest buyer—and it&apos;s not slowing down. Here's why we're positioned for sustained growth, regardless of who&apos;s in office.
          </p>
        </div>

        {/* Why We're Resilient */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {resilienceFactors.map((factor, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:bg-white/10"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                {factor.icon}
              </div>

              {/* Stat Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold mb-4 border border-green-500/30">
                {factor.stat}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3">{factor.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{factor.description}</p>
            </div>
          ))}
        </div>

        {/* Market Fundamentals */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              The Numbers Don&apos;t Lie
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Regardless of efficiency initiatives, the scale of government procurement ensures sustained opportunity. Our platform helps you capture it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {fundamentals.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                  {item.fact}
                </div>
                <div className="text-lg font-semibold text-white mb-2">
                  {item.detail}
                </div>
                <div className="text-sm text-gray-400">
                  {item.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col items-center">
            <p className="text-2xl font-bold mb-2">
              The question isn&apos;t <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">if</span> government buys—it&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">who wins the contracts</span>.
            </p>
            <p className="text-gray-400 mb-8">
              Position your organization to win, no matter what changes.
            </p>
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              See How We Help You Win
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
