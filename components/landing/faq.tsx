"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is an RLP?",
      answer:
        'A Request for Lease Proposals (RLP) is how federal agencies solicit offers for commercial space. They\'re typically 80-200 pages of requirements, deadlines, and compliance criteria.',
    },
    {
      question: "Do I need a GSA schedule to use FedSpace?",
      answer:
        "No. FedSpace helps commercial property owners and brokers respond to GSA lease solicitations. You don't need any existing federal contracting relationship.",
    },
    {
      question: "How does the matching algorithm work?",
      answer:
        "We analyze your property's location, square footage, building class, availability, and compliance status against RLP requirements. Our weighted scoring considers geographic fit (35%), space requirements (30%), building specifications (20%), pricing alignment (10%), and historical success patterns (5%).",
    },
    {
      question: "What documents does FedSpace generate?",
      answer:
        "Compliance matrices, pricing schedules (shell rent, TI amortization, BSAC), and structured RLP response packages. All formatted to GSA standards.",
    },
    {
      question: "Is my property data secure?",
      answer:
        "Yes. We use industry-standard encryption and never share your property data with competitors. Your listings are only visible to you and matched against public GSA solicitations.",
    },
  ];

  return (
    <Section className="bg-white">
      <SectionHeader title="Frequently Asked Questions" />

      <div className="max-w-3xl mx-auto">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[var(--color-fedspace-border)] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-lg text-[var(--color-fedspace-text-primary)]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-[var(--color-fedspace-text-secondary)] transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-[var(--color-fedspace-text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
