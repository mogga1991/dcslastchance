"use client";

import SignUpBlock from "@/components/ui/sign-up-block";
import { Suspense } from "react";

// Force dynamic rendering for pages using auth
export const dynamic = 'force-dynamic';

function SignUpContent() {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen py-12 px-4">
      <SignUpBlock />
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center w-full h-screen">
          <div className="max-w-md w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg h-96"></div>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
