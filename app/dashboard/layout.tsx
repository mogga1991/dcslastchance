import { ReactNode } from "react";
import HorizontalNav from "./_components/horizontal-nav";
// MVP: Hidden for initial launch - uncomment when AI chat is ready
// import Chatbot from "./_components/chatbot";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden w-full bg-white">
      <HorizontalNav />
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
      {/* MVP: Hidden for initial launch - uncomment when AI chat is ready */}
      {/* <Chatbot /> */}
    </div>
  );
}
