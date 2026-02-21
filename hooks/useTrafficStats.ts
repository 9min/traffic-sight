"use client";

import { useMemo } from "react";
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

export function useTrafficStats(events: TrafficEvent[], threats: TrafficEvent[]): TrafficStats {
  return useMemo(() => {
    const protocolDistribution: Record<string, number> = {};
    const countryDistribution: Record<string, number> = {};
    const threatsByType: Record<string, number> = {};
    let totalBandwidth = 0;
    let threatLevelSum = 0;

    events.forEach((event) => {
      // Protocol counts
      protocolDistribution[event.protocol] = (protocolDistribution[event.protocol] || 0) + 1;

      // Country counts (source)
      const country = event.src_country_code;
      countryDistribution[country] = (countryDistribution[country] || 0) + 1;

      // Bandwidth
      totalBandwidth += event.packet_size;
    });

    threats.forEach((threat) => {
      if (threat.threat_type) {
        threatsByType[threat.threat_type] = (threatsByType[threat.threat_type] || 0) + 1;
      }
      threatLevelSum += threat.threat_level;
    });

    // Time-based bandwidth history: last BANDWIDTH_WINDOW_SEC seconds
    // divided into BANDWIDTH_BUCKET_COUNT buckets of BANDWIDTH_BUCKET_SEC each
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

    // Calculate packets per second: events within last PPS_WINDOW_SEC seconds
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
}
