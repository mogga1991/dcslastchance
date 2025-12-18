"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[#FAF9F7] pt-32 pb-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 hover:shadow-md transition-shadow">
            <span className="text-sm text-gray-700">
              New announcement on your inbox
            </span>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:gap-2 transition-all"
            >
              Read more
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-gray-900">
            AI that matches commercial properties to{" "}
            <span className="text-[var(--color-fedspace-primary)]">
              federal lease opportunities
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Stop spending 8-12 hours reading 200-page RLPs. FedSpace automatically finds GSA
            opportunities that fit your properties and generates compliant submissions in 30 minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-[#2D3748] hover:bg-[#1A202C] text-white text-base px-8 py-6 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
