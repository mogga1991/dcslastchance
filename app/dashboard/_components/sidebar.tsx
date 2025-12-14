"use client";

import UserProfile from "@/components/user-profile";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  DollarSign,
  Settings,
  CreditCard,
  Newspaper,
  LogOut,
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

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard"
              ? "text-white"
              : "text-white/70"
          )}
        />
      ),
    },
    {
      label: "GSA Leasing",
      href: "/dashboard/gsa-leasing",
      icon: (
        <Building2
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/gsa-leasing"
              ? "text-white"
              : "text-white/70"
          )}
        />
      ),
    },
    {
      label: "Broker Listing",
      href: "/dashboard/broker-listing",
      icon: (
        <Users
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/broker-listing"
              ? "text-white"
              : "text-white/70"
          )}
        />
      ),
    },
    {
      label: "My Proposals",
      href: "/dashboard/my-proposals",
      icon: (
        <FileText
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/my-proposals"
              ? "text-white"
              : "text-white/70"
          )}
        />
      ),
    },
    {
      label: "Market News",
      href: "/dashboard/market-news",
      icon: (
        <Newspaper
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/market-news"
              ? "text-white"
              : "text-white/70"
          )}
        />
      ),
    },
    {
      label: "My Earnings",
      href: "/dashboard/my-earnings",
      icon: (
        <DollarSign
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/my-earnings"
              ? "text-white"
              : "text-white/70"
          )}
        />
      ),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: (
        <Settings
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/settings"
              ? "text-white"
              : "text-white/70"
          )}
        />
      ),
    },
    {
      label: "Upgrade",
      href: "/dashboard/upgrade",
      icon: (
        <CreditCard
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/upgrade"
              ? "text-white"
              : "text-white/70"
          )}
        />
      ),
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
                className={cn(
                  pathname === link.href
                    ? "bg-blue-600/30 text-white rounded-lg"
                    : "hover:bg-slate-700/50 rounded-lg"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {open ? (
            <>
              {/* Logout Button */}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-slate-700/50"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              {/* Logout Button - Icon only */}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-slate-700/50"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
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
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-blue-500 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-white whitespace-pre"
      >
        Sentyr
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-blue-500 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
