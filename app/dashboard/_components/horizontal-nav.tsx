"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UserProfile from "@/components/user-profile";
import { FedSpaceLogo } from "@/components/brand/fedspace-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function HorizontalNav() {
  const pathname = usePathname();
  const [matchCount, setMatchCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    loadMatchCount();

    // Subscribe to real-time match updates
    const channel = supabase
      .channel('property_matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_matches',
        },
        () => {
          loadMatchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadMatchCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's properties
      const { data: properties } = await supabase
        .from('broker_listings')
        .select('id')
        .eq('user_id', user.id);

      if (!properties || properties.length === 0) {
        setMatchCount(0);
        return;
      }

      const propertyIds = properties.map(p => p.id);

      // Count matches for user's properties (score >= 70 for high-quality+)
      const { count } = await supabase
        .from('property_matches')
        .select('*', { count: 'exact', head: true })
        .in('property_id', propertyIds)
        .gte('overall_score', 70); // Only count high-quality matches (Grade A/B)

      setMatchCount(count || 0);
    } catch (error) {
      console.error('Error loading match count:', error);
    }
  }

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
      badge: matchCount,
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
            const hasBadge = item.badge && item.badge > 0;

            return (
              <Link key={item.id} href={item.href} className="relative">
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
                {hasBadge && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-red-600 text-white text-xs font-semibold rounded-full shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
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
