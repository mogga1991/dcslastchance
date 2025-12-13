"use client";

import React from "react";

const testimonials = [
  {
    quote: "Sentyr cut our RFP analysis time from 12 hours to under 90 minutes. The AI extraction is remarkably accurate—we've won 3 contracts in the first 2 months.",
    author: "Sarah Mitchell",
    role: "VP Business Development",
    company: "Apex Defense Solutions",
    industry: "Government Contracting",
    avatar: "SM",
  },
  {
    quote: "As a commercial real estate broker, matching properties to GSA requirements was tedious. Sentyr's automated matching saved us hundreds of hours. We're now tracking 10x more opportunities.",
    author: "David Chen",
    role: "Senior Broker",
    company: "Metropolitan CRE Partners",
    industry: "Commercial Real Estate",
    avatar: "DC",
  },
  {
    quote: "Grant writing is our core business. Sentyr extracts requirements and compliance criteria we used to spend days manually identifying. ROI was immediate.",
    author: "Dr. Amanda Rodriguez",
    role: "Principal Consultant",
    company: "Grant Strategy Group",
    industry: "Grant Consulting",
    avatar: "AR",
  },
];

const stats = [
  { number: "500+", label: "Organizations Using Sentyr" },
  { number: "10K+", label: "RFPs Analyzed" },
  { number: "95%", label: "Customer Satisfaction" },
  { number: "$2.4B+", label: "Contract Value Analyzed" },
];

const logos = [
  { name: "Defense Prime", sector: "Aerospace & Defense" },
  { name: "Federal Solutions Group", sector: "IT Services" },
  { name: "Infrastructure Partners", sector: "Construction" },
  { name: "Healthcare Systems Inc", sector: "Healthcare" },
  { name: "Global Logistics Corp", sector: "Supply Chain" },
  { name: "Research Institute", sector: "R&D" },
];

export default function SocialProofSection() {
  return (
    <section className="w-full py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 mb-6 border border-indigo-100">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Trusted by Professionals
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Hundreds of Organizations
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Winning More Contracts</span>
          </h2>
          <p className="text-xl text-gray-600">
            From defense contractors to small businesses, professionals rely on Sentyr to streamline opportunity analysis and increase win rates.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-10 h-10 text-indigo-200 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-700 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-indigo-600 font-medium">{testimonial.company}</div>
                  <div className="text-xs text-gray-500">{testimonial.industry}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Industry Sectors */}
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Serving Organizations Across Sectors
            </h3>
            <p className="text-gray-600">
              From Fortune 500 companies to small businesses competing for their first contract
            </p>
          </div>

          {/* Logo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{logo.name}</div>
                <div className="text-xs text-gray-500">{logo.sector}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Ready to join successful contractors winning more with AI?
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Start Your Free Trial Today
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
