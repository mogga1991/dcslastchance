import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-fedspace-navy)] text-white py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6">
          Stop missing federal lease opportunities
        </h2>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-300 mb-10">
          Join 100+ brokers using FedSpace to win GSA leases.
          <br />
          List your first property in 2 minutes.
        </p>

        {/* CTA Button */}
        <Link href="/sign-up" className="inline-block">
          <Button
            size="lg"
            className="bg-[var(--color-fedspace-primary)] hover:bg-[var(--color-fedspace-primary-dark)] text-white text-xl px-12 py-8 font-semibold"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </Link>

        {/* Below CTA */}
        <p className="text-gray-400 text-sm mt-6">
          No credit card required • Cancel anytime
        </p>
      </div>

      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[var(--color-fedspace-primary)] opacity-10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-[var(--color-fedspace-primary)] opacity-10 blur-3xl rounded-full"></div>
    </section>
  );
}
