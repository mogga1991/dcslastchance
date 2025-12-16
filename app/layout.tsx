import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Providers } from "../components/provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { validateEnv } from "@/lib/env"; // ✅ FIXED: Validate environment variables at startup

// Validate environment variables on server startup
validateEnv();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fedspace.ai'), // ✅ FIXED: Added metadataBase for proper OG images
  title: "FedSpace - AI-Powered Federal Contract Intelligence",
  description:
    "AI-powered government contracting platform that extracts requirements, evaluates opportunities, and delivers bid/no-bid recommendations in minutes.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "FedSpace - AI-Powered Federal Contract Intelligence",
    description:
      "Transform complex government solicitations into actionable intelligence. Extract requirements, analyze opportunities, and make data-driven bid decisions.",
    url: "https://fedspace.ai",
    siteName: "FedSpace",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "FedSpace - AI-Powered Federal Contract Intelligence",
      },
    ],
    locale: "en-US",
    type: "website",
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
