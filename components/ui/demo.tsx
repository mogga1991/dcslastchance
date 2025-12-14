"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  Home,
  FileText,
  BarChart3,
  Settings,
  Users,
  Building2,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Load Roboto font
if (typeof window !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

export default function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Home className="text-blue-300 dark:text-blue-300 h-6 w-6 flex-shrink-0" />
      ),
    },
    {
      label: "Analyses",
      href: "/analyses",
      icon: (
        <FileText className="text-blue-300 dark:text-blue-300 h-6 w-6 flex-shrink-0" />
      ),
    },
    {
      label: "Reports",
      href: "/reports",
      icon: (
        <BarChart3 className="text-blue-300 dark:text-blue-300 h-6 w-6 flex-shrink-0" />
      ),
    },
    {
      label: "Organizations",
      href: "/organizations",
      icon: (
        <Building2 className="text-blue-300 dark:text-blue-300 h-6 w-6 flex-shrink-0" />
      ),
    },
    {
      label: "Team",
      href: "/team",
      icon: (
        <Users className="text-blue-300 dark:text-blue-300 h-6 w-6 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-blue-300 dark:text-blue-300 h-6 w-6 flex-shrink-0" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-blue-900 dark:bg-blue-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Logout",
                href: "/logout",
                icon: (
                  <LogOut className="text-blue-300 dark:text-blue-300 h-6 w-6 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-blue-400 dark:bg-blue-400 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-white text-xl whitespace-pre"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        FedSpace
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-blue-50 py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-blue-400 dark:bg-blue-400 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-blue-800 dark:border-blue-800 bg-blue-950 dark:bg-blue-950 flex flex-col gap-2 flex-1 w-full h-full overflow-auto">
        <h1
          className="text-white font-bold text-[15px] mb-4"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Dashboard Overview
        </h1>
        <div className="flex gap-2">
          {[...new Array(4)].map((_, i) => (
            <div
              key={"first-array-" + i}
              className="h-20 w-full rounded-lg bg-blue-900 dark:bg-blue-900 border border-blue-800 dark:border-blue-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((_, i) => (
            <div
              key={"second-array-" + i}
              className="h-full w-full rounded-lg bg-blue-900 dark:bg-blue-900 border border-blue-800 dark:border-blue-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
