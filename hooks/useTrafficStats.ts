"use client";

import { useMemo } from "react";
import type { TrafficEvent } from "@/lib/supabase/types";

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

    // Calculate bandwidth history (group events into time buckets)
    const bandwidthHistory: number[] = [];
    const bucketSize = Math.max(1, Math.floor(events.length / 10));
    for (let i = 0; i < events.length; i += bucketSize) {
      const bucket = events.slice(i, i + bucketSize);
      const bucketBandwidth = bucket.reduce((sum, e) => sum + e.packet_size, 0);
      bandwidthHistory.push(bucketBandwidth);
    }

    return {
      totalPackets: events.length,
      totalBandwidth,
      protocolDistribution,
      countryDistribution,
      threatCount: threats.length,
      threatsByType,
      avgThreatLevel: threats.length > 0 ? threatLevelSum / threats.length : 0,
      bandwidthHistory: bandwidthHistory.reverse(),
      packetsPerSecond: Math.min(events.length, 5),
    };
  }, [events, threats]);
}
