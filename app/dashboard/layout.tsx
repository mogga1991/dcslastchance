import { ReactNode } from "react";
import DashboardTopNav from "./_components/navbar";
import DashboardSideBar from "./_components/sidebar";
import Chatbot from "./_components/chatbot";
import { ProfileChecker } from "./_components/profile-checker";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden w-full bg-white">
      <ProfileChecker />
      <DashboardSideBar />
      <main className="flex-1 overflow-y-auto bg-white">
        <DashboardTopNav>{children}</DashboardTopNav>
      </main>
      <Chatbot />
    </div>
  );
}
