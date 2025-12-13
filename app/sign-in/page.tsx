"use client";

import { SupabaseSignIn } from "@/components/ui/supabase-sign-in";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center w-full h-screen bg-black">
          <div className="max-w-sm w-full bg-black/40 backdrop-blur-xl animate-pulse rounded-2xl h-96"></div>
        </div>
      }
    >
      <SupabaseSignIn />
    </Suspense>
  );
}
