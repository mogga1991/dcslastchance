"use client";

import React from "react";

const comparisons = [
  {
    traditional: "12+ hours per RFP analysis",
    withSentyr: "< 90 minutes with AI",
    savings: "10+ hours saved",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    traditional: "Manual PDF reading & highlighting",
    withSentyr: "AI extracts 50+ data points automatically",
    savings: "95%+ accuracy",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    traditional: "Subjective bid/no-bid decisions",
    withSentyr: "Data-driven scoring (0-100 scale)",
    savings: "Objective analysis",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    traditional: "Days to build compliance matrix",
    withSentyr: "Instant auto-generation",
    savings: "3-5 days saved",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const roiCalculator = {
  assumptions: [
    { label: "Average capture manager salary", value: "$120K/year" },
    { label: "Hourly rate (salary + overhead)", value: "$80/hour" },
    { label: "Hours saved per RFP with Sentyr", value: "10 hours" },
    { label: "RFPs analyzed per month", value: "5 RFPs" },
  ],
  calculation: [
    { step: "Monthly time savings", value: "5 RFPs × 10 hours = 50 hours" },
    { step: "Monthly cost savings", value: "50 hours × $80 = $4,000" },
    { step: "Annual cost savings", value: "$4,000 × 12 = $48,000" },
    { step: "Sentyr annual cost (Pro plan)", value: "$149/mo × 12 = $1,788" },
  ],
  result: {
    roi: "2,585%",
    payback: "< 2 weeks",
    annualSavings: "$46,212",
  },
};

export default function ValuePropositionSection() {
  return (
    <section className="w-full py-24 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 mb-6 border border-green-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Measurable ROI, Immediate Impact
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Traditional Way vs
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> The Sentyr Way</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Stop wasting valuable hours on manual RFP analysis. Let AI do the heavy lifting while your team focuses on winning proposals.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-red-600 mb-6">
                {comparison.icon}
              </div>

              {/* Traditional Way */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Traditional Way</div>
                <div className="text-lg text-gray-700">
                  <span className="line-through opacity-60">{comparison.traditional}</span>
                </div>
              </div>

              {/* Sentyr Way */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">With Sentyr</div>
                <div className="text-lg font-semibold text-gray-900">
                  {comparison.withSentyr}
                </div>
              </div>

              {/* Savings Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold text-green-700">{comparison.savings}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ROI Calculator */}
        <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Real ROI Calculation
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Based on average government contractor costs and typical usage patterns
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Assumptions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Assumptions
              </h4>
              <div className="space-y-4">
                {roiCalculator.assumptions.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculation
              </h4>
              <div className="space-y-4">
                {roiCalculator.calculation.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <span className="text-gray-300 flex-1">{item.step}</span>
                    <span className="font-bold text-white text-right ml-4">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-green-400/30">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold mb-2">Your ROI with Sentyr</h4>
              <p className="text-gray-300">Conservative estimate based on 5 RFPs/month</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 mb-2">
                  {roiCalculator.result.roi}
                </div>
                <div className="text-gray-300 font-medium">Annual ROI</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 mb-2">
                  {roiCalculator.result.payback}
                </div>
                <div className="text-gray-300 font-medium">Payback Period</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 mb-2">
                  {roiCalculator.result.annualSavings}
                </div>
                <div className="text-gray-300 font-medium">Net Annual Savings</div>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-8">
            <p className="text-gray-300 text-sm">
              * This is a conservative estimate. Many customers analyze 10-20 RFPs/month, doubling or tripling these savings.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-xl text-gray-700 mb-6 font-semibold">
            Stop losing money on manual RFP analysis. Start winning more contracts with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Start Free Trial - See ROI Immediately
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300"
            >
              View Pricing Plans
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
