"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TrafficEvent } from "@/lib/supabase/types";

interface LogTerminalProps {
  events: TrafficEvent[];
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function LogTerminal({ events }: LogTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  return (
    <div className="h-full flex flex-col bg-black/80 backdrop-blur-sm border border-matrix-green/20 neon-glow-green overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-matrix-green/20 bg-matrix-green/5 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-threat-red/60" />
          <div className="w-2 h-2 rounded-full bg-threat-yellow/60" />
          <div className="w-2 h-2 rounded-full bg-matrix-green/60" />
        </div>
        <span className="text-[10px] text-matrix-green/50 tracking-widest uppercase font-bold">
          Network Traffic Log
        </span>
        <div className="flex-1" />
        <span className="text-[10px] text-matrix-green/30 tabular-nums">
          {events.length} entries
        </span>
      </div>

      {/* Log content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <AnimatePresence mode="popLayout">
          {events.map((event) => {
            const isThreat = event.threat_level > 0;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`font-mono text-[11px] leading-5 px-2 py-0.5 rounded-sm flex items-center gap-1 ${
                  isThreat
                    ? "bg-threat-red/5 border-l-2 border-threat-red/40"
                    : "hover:bg-matrix-green/5"
                }`}
              >
                {/* Timestamp */}
                <span className="text-matrix-green/40 shrink-0 tabular-nums">
                  [{formatTime(event.created_at)}]
                </span>

                {/* Source */}
                <span className="text-cyber-cyan shrink-0">{event.src_ip}</span>

                {/* Arrow */}
                <span className="text-matrix-green/30 shrink-0">→</span>

                {/* Destination */}
                <span className="text-cyber-cyan shrink-0">{event.dst_ip}</span>

                {/* Protocol */}
                <span
                  className={`font-bold shrink-0 ${
                    isThreat ? "text-threat-red" : "text-matrix-green"
                  }`}
                >
                  {event.protocol}
                </span>

                {/* Port */}
                <span className="text-matrix-green/50 shrink-0">:{event.port}</span>

                {/* Size */}
                <span className="text-neon-purple/60 shrink-0">
                  [{formatSize(event.packet_size)}]
                </span>

                {/* Route */}
                <span className="text-matrix-green/25 truncate hidden lg:inline">
                  {event.src_city},{event.src_country_code} → {event.dst_city},
                  {event.dst_country_code}
                </span>

                {/* Threat badge */}
                {isThreat && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0 border border-threat-red/40 text-threat-red bg-threat-red/10 rounded shrink-0 text-glow-red">
                    ⚠ {event.threat_type}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="flex items-center justify-center h-full text-matrix-green/30 text-xs">
            <span className="animate-pulse">Waiting for traffic data...</span>
          </div>
        )}
      </div>

      {/* Terminal prompt */}
      <div className="px-4 py-1 border-t border-matrix-green/10 bg-black/50 shrink-0">
        <span className="text-matrix-green/40 text-[10px]">
          root@traffic-sight:~$ <span className="animate-pulse">█</span>
        </span>
      </div>
    </div>
  );
}
