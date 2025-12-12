"use client";

import dynamic from "next/dynamic";

// Force dynamic rendering for pages using auth
export const dynamic = 'force-dynamic';

// Lazy load with no SSR to avoid Clerk initialization during build
const SignUpBlock = dynamic(() => import("@/components/ui/sign-up-block"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <div className="max-w-md w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg h-96"></div>
    </div>
  ),
});

export default function SignUp() {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen py-12 px-4">
      <SignUpBlock />
    </div>
  );
}
