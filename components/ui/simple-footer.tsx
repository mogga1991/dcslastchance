"use client";

import Link from "next/link";

export default function SimpleFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-600">
            © {currentYear} FedSpace. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="text-gray-600 hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
