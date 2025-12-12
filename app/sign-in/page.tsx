"use client";

import dynamic from "next/dynamic";

// Force dynamic rendering for pages using auth
export const dynamic = 'force-dynamic';

// Lazy load with no SSR to avoid Clerk initialization during build
const SignInPage = dynamic(
  () => import("@/components/ui/signin-page").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <div className="max-w-md w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg h-96"></div>
      </div>
    ),
  }
);

export default function SignIn() {
  return <SignInPage />;
}
