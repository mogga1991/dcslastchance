"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-fedspace-border)] backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-[var(--color-fedspace-primary)]" />
            <span className="text-xl font-bold text-[var(--color-fedspace-text-primary)]">
              FedSpace
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-[var(--color-fedspace-text-secondary)] hover:text-[var(--color-fedspace-text-primary)] transition"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-[var(--color-fedspace-text-secondary)] hover:text-[var(--color-fedspace-text-primary)] transition"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-[var(--color-fedspace-text-secondary)] hover:text-[var(--color-fedspace-text-primary)] transition"
            >
              How It Works
            </button>
          </div>

          {/* CTA Button */}
          <Link href="/sign-up">
            <Button className="bg-[var(--color-fedspace-primary)] hover:bg-[var(--color-fedspace-primary-dark)] text-white">
              Get Started Free
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-[var(--color-fedspace-border)]">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("features")}
                className="text-left text-[var(--color-fedspace-text-secondary)] hover:text-[var(--color-fedspace-text-primary)] transition"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-left text-[var(--color-fedspace-text-secondary)] hover:text-[var(--color-fedspace-text-primary)] transition"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left text-[var(--color-fedspace-text-secondary)] hover:text-[var(--color-fedspace-text-primary)] transition"
              >
                How It Works
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
