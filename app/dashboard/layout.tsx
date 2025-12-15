import { ReactNode } from "react";
import DashboardTopNav from "./_components/navbar";
import DashboardSideBar from "./_components/sidebar";
// MVP: Hidden for initial launch - uncomment when AI chat is ready
// import Chatbot from "./_components/chatbot";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden w-full bg-white">
      <DashboardSideBar />
      <main className="flex-1 overflow-y-auto bg-white">
        <DashboardTopNav>{children}</DashboardTopNav>
      </main>
      {/* MVP: Hidden for initial launch - uncomment when AI chat is ready */}
      {/* <Chatbot /> */}
    </div>
  );
}
