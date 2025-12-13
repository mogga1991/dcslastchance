"use client";

import React from "react";

const categories = [
  {
    category: "Professional Services",
    examples: ["Photography & Videography", "Graphic Design", "Event Planning", "Translation Services", "Consulting", "Training & Education"],
    icon: "💼",
    spend: "$50B+",
  },
  {
    category: "Facilities & Maintenance",
    examples: ["Janitorial Services", "Landscaping", "HVAC Maintenance", "Security Services", "Pest Control", "Waste Management"],
    icon: "🏢",
    spend: "$30B+",
  },
  {
    category: "Food & Hospitality",
    examples: ["Catering Services", "Cafeteria Operations", "Vending Machines", "Food Supply", "Event Catering", "Meal Programs"],
    icon: "🍽️",
    spend: "$12B+",
  },
  {
    category: "Technology & IT",
    examples: ["Software Development", "Cybersecurity", "Cloud Services", "IT Support", "Hardware", "Network Infrastructure"],
    icon: "💻",
    spend: "$100B+",
  },
  {
    category: "Construction & Trades",
    examples: ["General Contracting", "Electrical Work", "Plumbing", "Painting", "Carpentry", "Renovation"],
    icon: "🔨",
    spend: "$80B+",
  },
  {
    category: "Creative & Media",
    examples: ["Marketing & Advertising", "Web Design", "Content Creation", "Printing Services", "Signage", "Video Production"],
    icon: "🎨",
    spend: "$8B+",
  },
  {
    category: "Transportation & Logistics",
    examples: ["Fleet Services", "Moving Services", "Courier Services", "Vehicle Maintenance", "Logistics", "Shipping"],
    icon: "🚚",
    spend: "$25B+",
  },
  {
    category: "Retail & Supply",
    examples: ["Office Supplies", "Furniture", "Uniforms", "Equipment Rental", "Medical Supplies", "Safety Equipment"],
    icon: "📦",
    spend: "$45B+",
  },
  {
    category: "Healthcare & Wellness",
    examples: ["Medical Services", "Mental Health", "Fitness Programs", "Wellness Coaching", "Occupational Health", "Telemedicine"],
    icon: "⚕️",
    spend: "$60B+",
  },
  {
    category: "Education & Research",
    examples: ["Curriculum Development", "Educational Materials", "Research Services", "Lab Equipment", "Academic Programs", "Testing Services"],
    icon: "📚",
    spend: "$35B+",
  },
  {
    category: "Environmental Services",
    examples: ["Recycling Programs", "Environmental Consulting", "Energy Audits", "Sustainability Programs", "Green Building", "Water Treatment"],
    icon: "🌱",
    spend: "$20B+",
  },
  {
    category: "Personal & Specialty",
    examples: ["Barbershops", "Dry Cleaning", "Tailoring", "Florists", "Gift Shops", "Pet Services"],
    icon: "✂️",
    spend: "$5B+",
  },
];

export default function GovernmentBuysEverythingSection() {
  return (
    <section className="w-full py-24 px-4 bg-gradient-to-b from-white via-indigo-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 mb-6 border border-green-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            YES, the government really does buy everything
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            From Rockets to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Catering Services</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            The federal government is the world's largest buyer—spending over <span className="font-bold text-gray-900">$700 billion annually</span> on everything imaginable. If you provide a product or service, there's a government contract for it.
          </p>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-lg font-semibold text-gray-800">
              <span className="text-2xl">🎯</span> Whatever your business—from photography studios to janitorial companies, bakeries to consulting firms—the government needs what you offer. Our platform helps you find and win those opportunities.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              {/* Icon & Spend */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{cat.icon}</div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Annual Spend</div>
                  <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{cat.spend}</div>
                </div>
              </div>

              {/* Category */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {cat.category}
              </h3>

              {/* Examples */}
              <ul className="space-y-2">
                {cat.examples.map((example, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call-out Box */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Your Business + Our AI = Contracts Won
              </h3>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Whether you're a one-person photography studio or a 500-person facilities management company, government contracts are accessible. Our AI analyzes opportunities, extracts requirements, and tells you exactly what you need to compete.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-200"><strong className="text-white">Find opportunities</strong> that match YOUR business—automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-200"><strong className="text-white">Understand requirements</strong> without reading 200-page PDFs</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-200"><strong className="text-white">Know if you can win</strong> before investing hours in a proposal</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              {/* Real Examples */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-sm font-semibold text-indigo-300 mb-2 uppercase tracking-wide">Real Example</div>
                <h4 className="text-xl font-bold mb-2">Photography Services for National Parks</h4>
                <p className="text-gray-300 text-sm mb-3">Department of Interior • $250K annually</p>
                <div className="text-xs text-gray-400">
                  "Provide professional photography services for marketing materials, visitor guides, and digital media across 10+ national parks and historic sites."
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide">Real Example</div>
                <h4 className="text-xl font-bold mb-2">Janitorial Services for VA Medical Centers</h4>
                <p className="text-gray-300 text-sm mb-3">Veterans Affairs • $2M annually</p>
                <div className="text-xs text-gray-400">
                  "Comprehensive cleaning and sanitation services for VA medical facilities including patient areas, administrative offices, and common spaces."
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-sm font-semibold text-green-300 mb-2 uppercase tracking-wide">Real Example</div>
                <h4 className="text-xl font-bold mb-2">Catering for Federal Training Events</h4>
                <p className="text-gray-300 text-sm mb-3">General Services Administration • $500K annually</p>
                <div className="text-xs text-gray-400">
                  "Full-service catering for federal employee training programs, conferences, and official events across the mid-Atlantic region."
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Discover Opportunities for Your Business
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">33M</div>
            <div className="text-sm text-gray-600 mt-1">U.S. businesses eligible for contracts</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">23%</div>
            <div className="text-sm text-gray-600 mt-1">Reserved for small businesses by law</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">$700B+</div>
            <div className="text-sm text-gray-600 mt-1">Total federal procurement annually</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ALL</div>
            <div className="text-sm text-gray-600 mt-1">Industries have opportunities</div>
          </div>
        </div>
      </div>
    </section>
  );
}
