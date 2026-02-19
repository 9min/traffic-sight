"use client";

import { useTrafficStream } from "@/hooks/useTrafficStream";
import { useTrafficStats } from "@/hooks/useTrafficStats";
import dynamic from "next/dynamic";
import Header from "@/components/dashboard/Header";
import StatsPanel from "@/components/dashboard/StatsPanel";
import ThreatPanel from "@/components/dashboard/ThreatPanel";
import LogTerminal from "@/components/dashboard/LogTerminal";

const MatrixRain = dynamic(() => import("@/components/effects/MatrixRain"), {
  ssr: false,
});

const GlobeSection = dynamic(() => import("@/components/dashboard/GlobeSection"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-matrix-green/50 text-sm animate-pulse tracking-widest">
        LOADING GLOBE...
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const { events, threats, isConnected, totalCount } = useTrafficStream();
  const stats = useTrafficStats(events, threats);

  return (
    <div className="relative min-h-screen flex flex-col bg-cyber-bg overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain />

      {/* Header */}
      <Header isConnected={isConnected} totalCount={totalCount} />

      {/* Main Content */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-0 overflow-hidden">
        {/* Left Panel: Stats */}
        <aside className="hidden lg:block border-r border-matrix-green/10 overflow-y-auto">
          <StatsPanel stats={stats} />
        </aside>

        {/* Center: 3D Globe */}
        <section className="flex items-center justify-center overflow-hidden relative min-h-[400px]">
          <GlobeSection events={events} />
        </section>

        {/* Right Panel: Threats */}
        <aside className="hidden lg:block border-l border-matrix-green/10 overflow-y-auto">
          <ThreatPanel threats={threats} stats={stats} />
        </aside>
      </main>

      {/* Bottom: Log Terminal */}
      <footer className="relative z-10 h-[200px] border-t border-matrix-green/20">
        <LogTerminal events={events} />
      </footer>
    </div>
  );
}
