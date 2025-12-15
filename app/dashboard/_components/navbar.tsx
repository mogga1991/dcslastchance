"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserProfile from "@/components/user-profile";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Bookmark,
  Settings,
  Menu,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardTopNav({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[52px] items-center gap-4 border-b px-3">
        <Dialog>
          <SheetTrigger className="min-[1024px]:hidden p-2 transition">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <Link prefetch={true} href="/dashboard">
                <SheetTitle>FedSpace</SheetTitle>
              </Link>
            </SheetHeader>
            {/* MVP: Mobile navigation - matches desktop sidebar */}
            <div className="flex flex-col space-y-3 mt-[1rem]">
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard/gsa-leasing">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    GSA Leasing
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard/broker-listing">
                  <Button variant="outline" className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    List Property
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard/saved-opportunities">
                  <Button variant="outline" className="w-full justify-start">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Opportunities
                  </Button>
                </Link>
              </DialogClose>
              <Separator className="my-3" />
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </DialogClose>
            </div>
          </SheetContent>
        </Dialog>
        <div className="flex justify-center items-center gap-2 ml-auto">
          <Link href="/contact" title="Help & Support">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </Button>
          </Link>
          <UserProfile mini={true} />
        </div>
      </header>
      {children}
    </div>
  );
}
