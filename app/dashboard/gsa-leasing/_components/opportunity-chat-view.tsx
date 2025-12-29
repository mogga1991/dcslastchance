"use client";

import { SAMOpportunity } from "@/lib/sam-gov";
import { OpportunityChatInterface } from "./opportunity-chat-interface";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import map component (client-side only)
const OpportunitiesMap = dynamic(
  () => import("./opportunities-map").then((mod) => mod.OpportunitiesMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    ),
  }
);

interface OpportunityChatViewProps {
  opportunity: SAMOpportunity;
  onBack: () => void;
}

export function OpportunityChatView({
  opportunity,
  onBack,
}: OpportunityChatViewProps) {
  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-6">
      {/* Left Panel - Chat Interface */}
      <div className="w-full lg:w-[620px] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        <OpportunityChatInterface opportunity={opportunity} onBack={onBack} />
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative min-h-[40vh] lg:min-h-0 rounded-lg overflow-hidden shadow-lg">
        <OpportunitiesMap
          opportunities={[opportunity]}
          selectedOpportunity={opportunity}
          onOpportunityClick={() => {}}
        />
      </div>
    </div>
  );
}
