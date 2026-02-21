"use client";

import { useRef, useEffect, useMemo, memo } from "react";
import ReactECharts from "echarts-for-react";
import CyberPanel from "@/components/ui/CyberPanel";
import type { TrafficStats } from "@/hooks/useTrafficStats";

interface StatsPanelProps {
  stats: TrafficStats;
}

function AnimatedCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = prevValue.current;
    const end = value;
    const duration = 400;
    const startTime = Date.now();

    let frameId: number;
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);
      el!.textContent = current.toLocaleString();

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();
    prevValue.current = value;

    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-matrix-green text-glow-green tabular-nums">
        <span ref={ref}>0</span>
      </div>
      <div className="text-[10px] text-matrix-green/50 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function StatsPanel({ stats }: StatsPanelProps) {
  const protocolData = useMemo(
    () =>
      Object.entries(stats.protocolDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    [stats.protocolDistribution]
  );

  const protocolChartOption = useMemo(
    () => ({
      animation: false,
      animationDurationUpdate: 300,
      animationEasingUpdate: "cubicInOut",
      tooltip: {
        trigger: "item" as const,
        backgroundColor: "rgba(0,0,0,0.85)",
        borderColor: "#00ff41",
        textStyle: { color: "#00ff41", fontFamily: "monospace", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["45%", "70%"],
          center: ["50%", "50%"],
          data: protocolData.map(([name, value], i) => ({
            name,
            value,
            itemStyle: {
              color: [
                "#00ff41",
                "#00d4ff",
                "#0066ff",
                "#bf00ff",
                "#ff6600",
                "#ffcc00",
              ][i],
            },
          })),
          label: {
            show: true,
            color: "#00ff41",
            fontSize: 9,
            fontFamily: "monospace",
            formatter: "{b}",
          },
          labelLine: {
            lineStyle: { color: "#00ff41", opacity: 0.3 },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 255, 65, 0.5)",
            },
          },
        },
      ],
    }),
    [protocolData]
  );

  const bandwidthChartOption = useMemo(
    () => ({
      animation: false,
      animationDurationUpdate: 300,
      animationEasingUpdate: "cubicInOut",
      grid: { top: 10, right: 10, bottom: 20, left: 40 },
      xAxis: {
        type: "category" as const,
        data: stats.bandwidthHistory.map((_, i) => `${i}`),
        axisLine: { lineStyle: { color: "#00ff41", opacity: 0.3 } },
        axisLabel: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value" as const,
        axisLine: { lineStyle: { color: "#00ff41", opacity: 0.3 } },
        axisLabel: {
          color: "#00ff41",
          fontSize: 9,
          fontFamily: "monospace",
          formatter: (v: number) => formatBytes(v),
        },
        splitLine: { lineStyle: { color: "#00ff41", opacity: 0.05 } },
      },
      series: [
        {
          type: "line",
          data: stats.bandwidthHistory,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#00d4ff", width: 2 },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(0, 212, 255, 0.3)" },
                { offset: 1, color: "rgba(0, 212, 255, 0)" },
              ],
            },
          },
        },
      ],
    }),
    [stats.bandwidthHistory]
  );

  const topCountries = useMemo(
    () =>
      Object.entries(stats.countryDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [stats.countryDistribution]
  );

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto p-2">
      {/* Counter cards */}
      <CyberPanel title="OVERVIEW" variant="green" pulse>
        <div className="grid grid-cols-2 gap-3 p-3">
          <AnimatedCounter value={stats.totalPackets} label="Total Packets" />
          <AnimatedCounter value={stats.threatCount} label="Threats" />
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-cyan text-glow-cyan">
              {formatBytes(stats.totalBandwidth)}
            </div>
            <div className="text-[10px] text-matrix-green/50 uppercase tracking-wider mt-1">
              Bandwidth
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-orange tabular-nums">
              {stats.packetsPerSecond}
            </div>
            <div className="text-[10px] text-matrix-green/50 uppercase tracking-wider mt-1">
              Pkts/sec
            </div>
          </div>
        </div>
      </CyberPanel>

      {/* Protocol Distribution */}
      <CyberPanel title="PROTOCOLS" variant="cyan">
        <div className="h-[180px]">
          <ReactECharts
            option={protocolChartOption}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "canvas" }}
            lazyUpdate
          />
        </div>
      </CyberPanel>

      {/* Bandwidth Chart */}
      <CyberPanel title="BANDWIDTH" variant="cyan">
        <div className="h-[120px]">
          <ReactECharts
            option={bandwidthChartOption}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "canvas" }}
            lazyUpdate
          />
        </div>
      </CyberPanel>

      {/* Top Countries */}
      <CyberPanel title="TOP SOURCES" variant="green">
        <div className="p-3 space-y-2">
          {topCountries.map(([code, count], i) => (
            <div key={code} className="flex items-center gap-2">
              <span className="text-[10px] text-matrix-green/50 w-4">{i + 1}.</span>
              <span className="text-xs font-bold text-matrix-green w-8">{code}</span>
              <div className="flex-1 h-1.5 bg-matrix-green/10 rounded overflow-hidden">
                <div
                  className="h-full bg-matrix-green/60 rounded transition-all duration-500"
                  style={{
                    width: `${(count / (topCountries[0]?.[1] || 1)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-matrix-green/50 tabular-nums w-8 text-right">
                {count}
              </span>
            </div>
          ))}
          {topCountries.length === 0 && (
            <div className="text-xs text-matrix-green/30 text-center py-4">
              Waiting for data...
            </div>
          )}
        </div>
      </CyberPanel>
    </div>
  );
}

export default memo(StatsPanel);
