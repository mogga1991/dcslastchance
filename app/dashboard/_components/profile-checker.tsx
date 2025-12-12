"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function ProfileChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      // Don't check if already on onboarding page
      if (pathname === "/dashboard/onboarding") {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/profile/check");
        if (!response.ok) {
          throw new Error("Failed to check profile");
        }

        const data = await response.json();

        if (!data.hasProfile) {
          router.push("/dashboard/onboarding");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, [router, pathname]);

  // Show nothing while checking
  if (checking && pathname !== "/dashboard/onboarding") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return null;
}
