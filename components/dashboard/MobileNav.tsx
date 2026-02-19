"use client";

import { useState } from "react";
import StatsPanel from "./StatsPanel";
import ThreatPanel from "./ThreatPanel";
import type { TrafficStats } from "@/hooks/useTrafficStats";
import type { TrafficEvent } from "@/lib/supabase/types";

type Tab = "globe" | "stats" | "threats";

interface MobileNavProps {
  stats: TrafficStats;
  threats: TrafficEvent[];
  globeSlot: React.ReactNode;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "globe", label: "GLOBE", icon: "◉" },
  { id: "stats", label: "STATS", icon: "▦" },
  { id: "threats", label: "THREATS", icon: "⚠" },
];

export default function MobileNav({ stats, threats, globeSlot }: MobileNavProps) {
  const [activeTab, setActiveTab] = useState<Tab>("globe");

  return (
    <div className="flex flex-col h-full lg:hidden">
      {/* Tab bar */}
      <div className="flex border-b border-matrix-green/20 bg-black/80 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-[10px] font-bold tracking-widest uppercase transition-all
              ${
                activeTab === tab.id
                  ? "text-matrix-green border-b-2 border-matrix-green bg-matrix-green/5 text-glow-green"
                  : "text-matrix-green/40 hover:text-matrix-green/60"
              }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "globe" && (
          <div className="h-full min-h-[350px]">{globeSlot}</div>
        )}
        {activeTab === "stats" && <StatsPanel stats={stats} />}
        {activeTab === "threats" && <ThreatPanel threats={threats} stats={stats} />}
      </div>
    </div>
  );
}
