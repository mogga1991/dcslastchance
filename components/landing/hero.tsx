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
    <section className="relative overflow-hidden bg-[var(--color-fedspace-navy)] text-white pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
            AI that matches commercial properties to{" "}
            <span className="text-[var(--color-fedspace-primary)]">
              federal lease opportunities
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-4xl mx-auto">
            Stop spending 8-12 hours reading 200-page RLPs. FedSpace automatically finds GSA
            opportunities that fit your properties and generates compliant submissions in{" "}
            <span className="font-bold text-white">30 minutes</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[var(--color-fedspace-primary)] hover:bg-[var(--color-fedspace-primary-dark)] text-white text-lg px-8 py-6 font-semibold"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
            >
              See How It Works
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-sm sm:text-base text-gray-400">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[var(--color-fedspace-primary)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>2 Patents Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[var(--color-fedspace-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>$6B Federal Leasing Market</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[var(--color-fedspace-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--color-fedspace-primary)] opacity-10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[var(--color-fedspace-primary)] opacity-10 blur-3xl rounded-full"></div>
    </section>
  );
}
