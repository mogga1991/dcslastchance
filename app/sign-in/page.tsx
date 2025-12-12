"use client";

import SignInPage from "@/components/ui/signin-page";
import { Suspense } from "react";

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center w-full h-screen">
          <div className="max-w-md w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg h-96"></div>
        </div>
      }
    >
      <SignInPage />
    </Suspense>
  );
}
