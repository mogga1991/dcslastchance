"use client";

import { Button } from "@/components/ui/button";
import UserProfile from "@/components/user-profile";
import { FedSpaceLogo } from "@/components/brand/fedspace-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HorizontalNav() {
  const pathname = usePathname();

  const navItems = [
    {
      id: "opportunities",
      label: "Opportunities",
      href: "/dashboard/gsa-leasing",
    },
    {
      id: "list-property",
      label: "List Property",
      href: "/dashboard/broker-listing",
    },
    {
      id: "my-listings",
      label: "My Listings",
      href: "/dashboard/my-properties",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between gap-6">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Link href="/dashboard/gsa-leasing" className="flex items-center gap-2">
          <FedSpaceLogo variant="full" size="sm" />
        </Link>
      </div>

      {/* Right: Navigation Menu (Purple Pill) + Icons */}
      <div className="flex items-center gap-3">
        {/* Purple Navigation Pill */}
        <nav className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-white/20 rounded-full px-4",
                    isActive && "bg-white/30 font-medium"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="pl-2 border-l border-gray-200">
          <UserProfile mini={true} />
        </div>
      </div>
    </header>
  );
}
