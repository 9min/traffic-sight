"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { useTrafficStream } from "@/hooks/useTrafficStream";
import { useTrafficStats } from "@/hooks/useTrafficStats";
import dynamic from "next/dynamic";
import Header from "@/components/dashboard/Header";
import StatsPanel from "@/components/dashboard/StatsPanel";
import ThreatPanel from "@/components/dashboard/ThreatPanel";
import LogTerminal from "@/components/dashboard/LogTerminal";
import MobileNav from "@/components/dashboard/MobileNav";
import BootSequence from "@/components/effects/BootSequence";

const MatrixRain = dynamic(() => import("@/components/effects/MatrixRain"), {
  ssr: false,
});

const GlobeSection = dynamic(
  () => import("@/components/dashboard/GlobeSection"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-matrix-green/50 text-sm animate-pulse tracking-widest">
          LOADING GLOBE...
        </div>
      </div>
    ),
  }
);

const panelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function DashboardPage() {
  const [booted, setBooted] = useState(false);
  const { events, threats, isConnected, totalCount } = useTrafficStream();
  const stats = useTrafficStats(events, threats);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  const globe = useMemo(
    () => <GlobeSection events={events} />,
    [events]
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-cyber-bg overflow-hidden">
      {/* Boot Sequence */}
      {!booted && <BootSequence onComplete={handleBootComplete} />}

      {/* Matrix Rain Background */}
      <MatrixRain />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={booted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        <Header isConnected={isConnected} totalCount={totalCount} />
      </motion.div>

      {/* Desktop: 3-column grid */}
      <main className="relative z-10 flex-1 hidden lg:grid lg:grid-cols-[280px_1fr_300px] gap-0 overflow-hidden">
        <motion.aside
          className="border-r border-matrix-green/10 overflow-y-auto"
          custom={0}
          initial="hidden"
          animate={booted ? "visible" : "hidden"}
          variants={panelVariants}
        >
          <StatsPanel stats={stats} />
        </motion.aside>

        <motion.section
          className="flex items-center justify-center overflow-hidden relative min-h-[400px]"
          custom={1}
          initial="hidden"
          animate={booted ? "visible" : "hidden"}
          variants={panelVariants}
        >
          {globe}
        </motion.section>

        <motion.aside
          className="border-l border-matrix-green/10 overflow-y-auto"
          custom={2}
          initial="hidden"
          animate={booted ? "visible" : "hidden"}
          variants={panelVariants}
        >
          <ThreatPanel threats={threats} stats={stats} />
        </motion.aside>
      </main>

      {/* Mobile: tab navigation */}
      <motion.div
        className="relative z-10 flex-1 lg:hidden overflow-hidden"
        initial={{ opacity: 0 }}
        animate={booted ? { opacity: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <MobileNav stats={stats} threats={threats} globeSlot={globe} />
      </motion.div>

      {/* Bottom: Log Terminal */}
      <motion.footer
        className="relative z-10 h-[200px] border-t border-matrix-green/20"
        custom={3}
        initial="hidden"
        animate={booted ? "visible" : "hidden"}
        variants={panelVariants}
      >
        <LogTerminal events={events} />
      </motion.footer>
    </div>
  );
}
