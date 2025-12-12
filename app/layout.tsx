import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Providers } from "../components/provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Sentyr - AI-Powered RFP Analysis for Government Contractors",
  description:
    "AI-powered RFP/RFI/RFQ analysis platform that extracts requirements, evaluates criteria, and delivers bid/no-bid recommendations in minutes. Save 10+ hours per opportunity.",
  openGraph: {
    title: "Sentyr - AI-Powered RFP Analysis",
    description:
      "AI-powered RFP analysis that transforms complex solicitations into actionable intelligence for government contractors.",
    url: "https://sentyr.ai",
    siteName: "Sentyr",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
        width: 1200,
        height: 630,
        alt: "Sentyr - AI-Powered RFP Analysis",
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
      <body className={`font-[-apple-system,BlinkMacSystemFont]antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
