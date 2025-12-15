"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Bell,
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FedSpace</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                How It Works
              </button>
            </div>

            {/* CTA Button */}
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Government Lease Opportunities{" "}
              <span className="text-blue-600">Before Your Competition</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              The only platform that combines GSA opportunities with federal building
              intelligence. See where government leases are expiring and get matched to
              opportunities automatically.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("how-it-works")}
                className="text-lg px-8 py-6"
              >
                See How It Works
              </Button>
            </div>

            {/* Hero Visual */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 blur-3xl"></div>
              <div className="relative bg-white rounded-lg shadow-2xl p-4 border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 rounded flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Federal Footprint Intelligence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Stop Wasting Hours on SAM.gov
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pain Point 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Manual searching takes 10+ hours per opportunity
              </h3>
              <p className="text-gray-600">
                Sifting through SAM.gov listings and cross-referencing federal data is
                time-consuming and error-prone.
              </p>
            </div>

            {/* Pain Point 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                You're missing opportunities because you can't see where federal presence is
                growing
              </h3>
              <p className="text-gray-600">
                Without visibility into federal building locations and trends, you're always
                reacting instead of leading.
              </p>
            </div>

            {/* Pain Point 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Lease expirations mean future RFPs—but you can't predict them
              </h3>
              <p className="text-gray-600">
                By the time an RFP is posted, your competitors are already preparing. You need
                early intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Win Government Leases
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg blur group-hover:blur-xl transition"></div>
              <div className="relative bg-white p-8 rounded-lg border border-gray-200 h-full">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <MapPin className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Federal Footprint Map
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  See every federal building in your market. Our Federal Neighborhood Score
                  shows where government presence is concentrated and growing.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg blur group-hover:blur-xl transition"></div>
              <div className="relative bg-white p-8 rounded-lg border border-gray-200 h-full">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Bell className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Expiring Lease Alerts
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Know which federal leases expire in the next 24 months. Get ahead of RFPs
                  before they're even posted on SAM.gov.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg blur group-hover:blur-xl transition"></div>
              <div className="relative bg-white p-8 rounded-lg border border-gray-200 h-full">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Smart Opportunity Matching
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Add your properties and we automatically match them to active GSA
                  opportunities. Stop sifting through irrelevant listings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started in 3 Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Add Your Properties
              </h3>
              <p className="text-gray-600 text-center">
                Enter your available commercial spaces with basic details—address, square
                footage, availability.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                We Scan Federal Data
              </h3>
              <p className="text-gray-600 text-center">
                Our system searches GSA opportunities and federal building databases to find
                matches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                Get Matched Opportunities
              </h3>
              <p className="text-gray-600 text-center">
                See which opportunities fit your properties, ranked by match score. Set alerts
                for expiring leases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-400 mb-2">$75B+</div>
              <div className="text-gray-300">in annual GSA leases</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-400 mb-2">23,000+</div>
              <div className="text-gray-300">federal buildings tracked</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-400 mb-2">Real-time</div>
              <div className="text-gray-300">SAM.gov integration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Next Government Lease?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join brokers who are winning GSA contracts with better intelligence.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-6"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-blue-100 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Tagline */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-white">FedSpace</span>
              </div>
              <p className="text-gray-400">
                Federal lease intelligence for commercial real estate brokers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white transition"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="hover:text-white transition"
                  >
                    How It Works
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">© 2024 FedSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
