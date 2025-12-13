"use client";

import { FileUp, Brain, FileCheck, Target, CheckCircle2 } from "lucide-react";

const processSteps = [
  {
    id: 1,
    title: "Select or Upload",
    description: "Pick an opportunity or upload a solicitation",
    icon: FileUp,
    color: "blue",
  },
  {
    id: 2,
    title: "AI Analysis",
    description: "Our AI analyzes the solicitation",
    icon: Brain,
    color: "purple",
  },
  {
    id: 3,
    title: "Gather Context",
    description: "Reads business info or requests capability statements",
    icon: FileCheck,
    color: "indigo",
  },
  {
    id: 4,
    title: "Bid/No-Bid Score",
    description: "Get recommendation with detailed reasoning",
    icon: Target,
    color: "orange",
  },
  {
    id: 5,
    title: "Make Decision",
    description: "Choose whether to respond to the solicitation",
    icon: CheckCircle2,
    color: "green",
  },
];

export default function ProposalProcessFlow() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100 p-6 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          How It Works
        </h2>
        <p className="text-sm text-gray-600">
          Our streamlined process from opportunity to decision
        </p>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"
             style={{ left: '5%', right: '5%' }} />

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === processSteps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Mobile connector */}
                {!isLast && (
                  <div className="md:hidden absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200 -mb-4" />
                )}

                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Icon Circle */}
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center mb-3
                    bg-gradient-to-br shadow-lg
                    ${step.color === 'blue' ? 'from-blue-500 to-blue-600' : ''}
                    ${step.color === 'purple' ? 'from-purple-500 to-purple-600' : ''}
                    ${step.color === 'indigo' ? 'from-indigo-500 to-indigo-600' : ''}
                    ${step.color === 'orange' ? 'from-orange-500 to-orange-600' : ''}
                    ${step.color === 'green' ? 'from-green-500 to-green-600' : ''}
                  `}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Step Number Badge */}
                  <div className="absolute top-0 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 md:-top-2
                                  w-6 h-6 rounded-full bg-white border-2 border-gray-200
                                  flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-700">{step.id}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-6 pt-6 border-t border-blue-200/50 text-center">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Ready to get started?</span> Click{" "}
          <span className="text-blue-600 font-semibold">"New Proposal"</span> above to begin your first analysis.
        </p>
      </div>
    </div>
  );
}
