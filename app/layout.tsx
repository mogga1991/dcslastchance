import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Providers } from "../components/provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "FedSpace - AI-Native GovCon OS",
  description:
    "AI-powered government contracting platform that extracts requirements, evaluates opportunities, and delivers bid/no-bid recommendations. The operating system for federal contractors.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "FedSpace - AI-Native GovCon OS",
    description:
      "AI-powered platform that transforms complex government solicitations into actionable intelligence for federal contractors.",
    url: "https://fedspace.ai",
    siteName: "FedSpace",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
        width: 1200,
        height: 630,
        alt: "FedSpace - AI-Native GovCon OS",
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
