"use client";

import { AnimatePresence, motion } from "motion/react";
import ReactECharts from "echarts-for-react";
import CyberPanel from "@/components/ui/CyberPanel";
import type { TrafficEvent } from "@/lib/supabase/types";
import type { TrafficStats } from "@/hooks/useTrafficStats";

interface ThreatPanelProps {
  threats: TrafficEvent[];
  stats: TrafficStats;
}

const threatLevelColors: Record<number, string> = {
  1: "#ffcc00",
  2: "#ffcc00",
  3: "#ff6600",
  4: "#ff0040",
  5: "#ff0040",
};

const threatLevelLabels: Record<number, string> = {
  1: "LOW",
  2: "MEDIUM",
  3: "HIGH",
  4: "CRITICAL",
  5: "SEVERE",
};

function ThreatBadge({ level }: { level: number }) {
  const color = threatLevelColors[level] || "#ffcc00";
  const label = threatLevelLabels[level] || "UNKNOWN";

  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 border rounded"
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}10`,
        textShadow: `0 0 6px ${color}60`,
      }}
    >
      {label}
    </span>
  );
}

export default function ThreatPanel({ threats, stats }: ThreatPanelProps) {
  // Threat gauge
  const gaugeValue = Math.min(stats.avgThreatLevel * 20, 100);
  const gaugeColor =
    gaugeValue < 30 ? "#00ff41" : gaugeValue < 60 ? "#ffcc00" : "#ff0040";

  const gaugeOption = {
    series: [
      {
        type: "gauge",
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: 100,
        pointer: { show: false },
        progress: {
          show: true,
          width: 10,
          roundCap: true,
          itemStyle: { color: gaugeColor },
        },
        axisLine: {
          lineStyle: {
            width: 10,
            color: [[1, "rgba(0, 255, 65, 0.1)"]],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          offsetCenter: [0, "0%"],
          fontSize: 20,
          fontWeight: "bold" as const,
          fontFamily: "monospace",
          color: gaugeColor,
          formatter: `${Math.round(gaugeValue)}%`,
        },
        data: [{ value: gaugeValue }],
      },
    ],
  };

  // Threat types distribution
  const threatTypeEntries = Object.entries(stats.threatsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto p-2">
      {/* Threat Gauge */}
      <CyberPanel title="THREAT LEVEL" variant="red" pulse>
        <div className="h-[140px]">
          <ReactECharts
            option={gaugeOption}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "canvas" }}
            lazyUpdate
          />
        </div>
      </CyberPanel>

      {/* Threat Types */}
      <CyberPanel title="THREAT TYPES" variant="red">
        <div className="p-3 space-y-2">
          {threatTypeEntries.map(([type, count]) => (
            <div key={type} className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-threat-red/80 truncate flex-1">
                {type}
              </span>
              <span className="text-[10px] text-threat-red font-bold tabular-nums">
                {count}
              </span>
            </div>
          ))}
          {threatTypeEntries.length === 0 && (
            <div className="text-xs text-matrix-green/30 text-center py-2">
              No threats detected
            </div>
          )}
        </div>
      </CyberPanel>

      {/* Live Threat Feed */}
      <CyberPanel title="LIVE THREAT FEED" variant="red">
        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {threats.slice(0, 10).map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-threat-red/20 bg-threat-red/5 px-2 py-1.5 rounded-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-threat-red/60 tabular-nums">
                    {new Date(threat.created_at).toLocaleTimeString("en-US", {
                      hour12: false,
                    })}
                  </span>
                  <ThreatBadge level={threat.threat_level} />
                </div>
                <div className="text-[10px] text-threat-orange font-medium truncate">
                  {threat.threat_type}
                </div>
                <div className="text-[9px] text-matrix-green/40 truncate">
                  {threat.src_ip} → {threat.dst_ip}
                </div>
                <div className="text-[9px] text-matrix-green/30">
                  {threat.src_city}, {threat.src_country_code} → {threat.dst_city},{" "}
                  {threat.dst_country_code}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {threats.length === 0 && (
            <div className="text-xs text-matrix-green/30 text-center py-6">
              <div className="text-2xl mb-2">🛡</div>
              Monitoring for threats...
            </div>
          )}
        </div>
      </CyberPanel>
    </div>
  );
}
