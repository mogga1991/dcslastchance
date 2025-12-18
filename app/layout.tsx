import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Providers } from "../components/provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { validateEnv } from "@/lib/env"; // ✅ FIXED: Validate environment variables at startup

// Validate environment variables on server startup
validateEnv();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fedspace.ai'),
  title: "FedSpace | AI-Powered Federal Lease Matching",
  description:
    "Stop spending 8-12 hours on RLPs. FedSpace automatically matches commercial properties to federal lease opportunities and generates compliant submissions in 30 minutes. Automated RLP analysis, compliance scoring, and submission generation.",
  keywords: [
    "GSA leasing",
    "federal real estate",
    "RLP",
    "government leasing",
    "commercial property",
    "SAM.gov",
    "federal lease opportunities",
    "GSA contract opportunities",
    "commercial real estate brokers",
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "FedSpace - AI for Federal Leasing",
    description:
      "Stop spending 8-12 hours on RLPs. Match properties to federal opportunities in 30 minutes. AI-powered GSA lease intelligence for commercial real estate.",
    url: "https://fedspace.ai",
    siteName: "FedSpace",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "FedSpace - AI for Federal Leasing",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FedSpace - AI for Federal Leasing",
    description: "Match commercial properties to federal lease opportunities in 30 minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <Providers>
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
