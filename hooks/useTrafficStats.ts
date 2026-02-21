"use client";

import { useMemo, useRef } from "react";
import type { TrafficEvent } from "@/lib/types";
import { BANDWIDTH_BUCKET_COUNT, BANDWIDTH_WINDOW_SEC, BANDWIDTH_BUCKET_SEC } from "@/lib/constants";

export interface TrafficStats {
  totalPackets: number;
  totalBandwidth: number;
  protocolDistribution: Record<string, number>;
  countryDistribution: Record<string, number>;
  threatCount: number;
  threatsByType: Record<string, number>;
  avgThreatLevel: number;
  bandwidthHistory: number[];
  packetsPerSecond: number;
}

const PPS_WINDOW_SEC = 5;

function shallowRecordEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function arrayEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function useStableRef<T>(value: T, isEqual: (a: T, b: T) => boolean): T {
  const ref = useRef(value);
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}

export function useTrafficStats(events: TrafficEvent[], threats: TrafficEvent[]): TrafficStats {
  // Compute raw stats
  const raw = useMemo(() => {
    const protocolDistribution: Record<string, number> = {};
    const countryDistribution: Record<string, number> = {};
    const threatsByType: Record<string, number> = {};
    let totalBandwidth = 0;
    let threatLevelSum = 0;

    events.forEach((event) => {
      protocolDistribution[event.protocol] = (protocolDistribution[event.protocol] || 0) + 1;
      const country = event.src_country_code;
      countryDistribution[country] = (countryDistribution[country] || 0) + 1;
      totalBandwidth += event.packet_size;
    });

    threats.forEach((threat) => {
      if (threat.threat_type) {
        threatsByType[threat.threat_type] = (threatsByType[threat.threat_type] || 0) + 1;
      }
      threatLevelSum += threat.threat_level;
    });

    const now = Date.now();
    const windowStart = now - BANDWIDTH_WINDOW_SEC * 1000;
    const bandwidthHistory: number[] = new Array(BANDWIDTH_BUCKET_COUNT).fill(0);

    events.forEach((event) => {
      const eventTime = new Date(event.created_at).getTime();
      if (eventTime < windowStart) return;
      const offsetMs = eventTime - windowStart;
      const bucketIdx = Math.min(
        BANDWIDTH_BUCKET_COUNT - 1,
        Math.floor(offsetMs / (BANDWIDTH_BUCKET_SEC * 1000))
      );
      bandwidthHistory[bucketIdx] += event.packet_size;
    });

    const ppsWindowStart = now - PPS_WINDOW_SEC * 1000;
    let recentCount = 0;
    for (const event of events) {
      if (new Date(event.created_at).getTime() >= ppsWindowStart) {
        recentCount++;
      }
    }
    const packetsPerSecond = Math.round(recentCount / PPS_WINDOW_SEC);

    return {
      totalPackets: events.length,
      totalBandwidth,
      protocolDistribution,
      countryDistribution,
      threatCount: threats.length,
      threatsByType,
      avgThreatLevel: threats.length > 0 ? threatLevelSum / threats.length : 0,
      bandwidthHistory,
      packetsPerSecond,
    };
  }, [events, threats]);

  // Stabilize sub-values so child components only re-render when their data actually changes
  const protocolDistribution = useStableRef(raw.protocolDistribution, shallowRecordEqual);
  const countryDistribution = useStableRef(raw.countryDistribution, shallowRecordEqual);
  const threatsByType = useStableRef(raw.threatsByType, shallowRecordEqual);
  const bandwidthHistory = useStableRef(raw.bandwidthHistory, arrayEqual);

  return useMemo(
    () => ({
      totalPackets: raw.totalPackets,
      totalBandwidth: raw.totalBandwidth,
      protocolDistribution,
      countryDistribution,
      threatCount: raw.threatCount,
      threatsByType,
      avgThreatLevel: raw.avgThreatLevel,
      bandwidthHistory,
      packetsPerSecond: raw.packetsPerSecond,
    }),
    [
      raw.totalPackets,
      raw.totalBandwidth,
      protocolDistribution,
      countryDistribution,
      raw.threatCount,
      threatsByType,
      raw.avgThreatLevel,
      bandwidthHistory,
      raw.packetsPerSecond,
    ]
  );
}
