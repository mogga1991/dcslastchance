"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const footerLinks = {
    product: [
      { label: "Features", action: () => scrollToSection("features") },
      { label: "Pricing", action: () => scrollToSection("pricing") },
      { label: "How It Works", action: () => scrollToSection("how-it-works") },
    ],
    resources: [
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "API Docs", href: "/docs" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  };

  return (
    <footer className="bg-[var(--color-fedspace-navy)] text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-[var(--color-fedspace-primary)]" />
              <span className="text-xl font-bold text-white">FedSpace</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-powered federal lease intelligence for commercial real estate brokers.
            </p>
            <p className="text-sm text-gray-500">
              Email:{" "}
              <a
                href="mailto:hello@fedspace.ai"
                className="text-[var(--color-fedspace-primary)] hover:underline"
              >
                hello@fedspace.ai
              </a>
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="hover:text-white transition text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="border-t border-gray-800 pt-8 space-y-2">
          <p className="text-sm text-center">© 2025 FedSpace. All rights reserved.</p>
          <p className="text-xs text-center text-gray-500">
            FedSpace is not affiliated with or endorsed by the General Services Administration.
          </p>
        </div>
      </div>
    </footer>
  );
}
