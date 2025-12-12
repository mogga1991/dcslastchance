"use client";

import UserProfile from "@/components/user-profile";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Home,
  Bookmark,
  FileText,
  Newspaper,
  Settings,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DashboardSideBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard"
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
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
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
          )}
        />
      ),
    },
    {
      label: "Broker Listing",
      href: "/dashboard/broker-listing",
      icon: (
        <Home
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/broker-listing"
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
          )}
        />
      ),
    },
    {
      label: "Saved Opportunities",
      href: "/dashboard/saved-opportunities",
      icon: (
        <Bookmark
          className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/dashboard/saved-opportunities"
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
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
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
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
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
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
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
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
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
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
                    ? "bg-primary/10 text-primary rounded-lg"
                    : "hover:bg-muted rounded-lg"
                )}
              />
            ))}
          </div>
        </div>
        <div>
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
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        ProposalIQ
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
