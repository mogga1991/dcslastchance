"use client";

import UserProfile from "@/components/user-profile";
import SidebarUsageStats from "@/components/sidebar-usage-stats";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FedSpaceLogo } from "@/components/brand/fedspace-logo";
import {
  Building2,
  Settings,
  LogOut,
  PlusCircle,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function DashboardSideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  // MVP: Core navigation items only
  const links = [
    {
      label: "Leasing Opportunities",
      href: "/dashboard/gsa-leasing",
      icon: (
        <Building2
          className="h-5 w-5 flex-shrink-0"
        />
      ),
    },
    {
      label: "List Property",
      href: "/dashboard/broker-listing",
      icon: (
        <PlusCircle
          className="h-5 w-5 flex-shrink-0"
        />
      ),
    },
    {
      label: "Saved Opportunities",
      href: "/dashboard/saved-opportunities",
      icon: (
        <Bookmark
          className="h-5 w-5 flex-shrink-0"
        />
      ),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: (
        <Settings
          className="h-5 w-5 flex-shrink-0"
        />
      ),
    },
    // MVP: Hidden for initial launch - uncomment when ready
    // {
    //   label: "My Proposals",
    //   href: "/dashboard/my-proposals",
    //   icon: (
    //     <FileText
    //       className="h-5 w-5 flex-shrink-0"
    //     />
    //   ),
    // },
    // {
    //   label: "Market News",
    //   href: "/dashboard/market-news",
    //   icon: (
    //     <Newspaper
    //       className="h-5 w-5 flex-shrink-0"
    //     />
    //   ),
    // },
    // {
    //   label: "My Earnings",
    //   href: "/dashboard/my-earnings",
    //   icon: (
    //     <DollarSign
    //       className="h-5 w-5 flex-shrink-0"
    //     />
    //   ),
    // },
    // {
    //   label: "Upgrade",
    //   href: "/dashboard/upgrade",
    //   icon: (
    //     <CreditCard
    //       className="h-5 w-5 flex-shrink-0"
    //     />
    //   ),
    // },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 bg-gradient-to-b from-[#4F46E5] to-[#3730A3] dark:from-[#3730A3] dark:to-[#312E81]">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
                className={cn(
                  pathname === link.href
                    ? "bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {/* Usage Stats */}
          <SidebarUsageStats mini={!open} />

          {/* Logout Button */}
          {open ? (
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Logout</span>
            </Button>
          ) : (
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}

          {/* User Profile - Always at bottom */}
          <UserProfile />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard/gsa-leasing"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FedSpaceLogo variant="full" size="sm" />
      </motion.div>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard/gsa-leasing"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <FedSpaceLogo variant="mark" size="sm" />
    </Link>
  );
};
