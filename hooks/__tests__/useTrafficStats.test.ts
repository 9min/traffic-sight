import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTrafficStats } from "../useTrafficStats";
import type { TrafficEvent } from "@/lib/types";
import { BANDWIDTH_BUCKET_COUNT, BANDWIDTH_WINDOW_SEC } from "@/lib/constants";

function makeEvent(overrides: Partial<TrafficEvent> = {}): TrafficEvent {
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    src_ip: "192.168.1.1",
    src_country_code: "US",
    src_city: "New York",
    src_lat: 40.7128,
    src_lng: -74.006,
    dst_ip: "10.0.0.1",
    dst_country_code: "GB",
    dst_city: "London",
    dst_lat: 51.5074,
    dst_lng: -0.1278,
    protocol: "TCP",
    port: 443,
    packet_size: 1024,
    threat_level: 0,
    threat_type: null,
    status: "active",
    ...overrides,
  };
}

describe("useTrafficStats", () => {
  it("should return zero stats for empty inputs", () => {
    const { result } = renderHook(() => useTrafficStats([], []));
    const stats = result.current;

    expect(stats.totalPackets).toBe(0);
    expect(stats.totalBandwidth).toBe(0);
    expect(stats.threatCount).toBe(0);
    expect(stats.avgThreatLevel).toBe(0);
    expect(stats.packetsPerSecond).toBe(0);
    expect(Object.keys(stats.protocolDistribution)).toHaveLength(0);
    expect(Object.keys(stats.countryDistribution)).toHaveLength(0);
    expect(Object.keys(stats.threatsByType)).toHaveLength(0);
    expect(stats.bandwidthHistory).toHaveLength(BANDWIDTH_BUCKET_COUNT);
    expect(stats.bandwidthHistory.every((v) => v === 0)).toBe(true);
  });

  it("should count total packets correctly", () => {
    const events = [makeEvent(), makeEvent(), makeEvent()];
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.totalPackets).toBe(3);
  });

  it("should sum bandwidth correctly", () => {
    const events = [
      makeEvent({ packet_size: 100 }),
      makeEvent({ packet_size: 200 }),
      makeEvent({ packet_size: 300 }),
    ];
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.totalBandwidth).toBe(600);
  });

  it("should compute protocol distribution", () => {
    const events = [
      makeEvent({ protocol: "TCP" }),
      makeEvent({ protocol: "TCP" }),
      makeEvent({ protocol: "UDP" }),
      makeEvent({ protocol: "DNS" }),
    ];
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.protocolDistribution).toEqual({
      TCP: 2,
      UDP: 1,
      DNS: 1,
    });
  });

  it("should compute country distribution from source", () => {
    const events = [
      makeEvent({ src_country_code: "US" }),
      makeEvent({ src_country_code: "US" }),
      makeEvent({ src_country_code: "JP" }),
      makeEvent({ src_country_code: "KR" }),
    ];
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.countryDistribution).toEqual({
      US: 2,
      JP: 1,
      KR: 1,
    });
  });

  it("should count threats correctly", () => {
    const threats = [
      makeEvent({ threat_level: 3, threat_type: "DDoS Attack" }),
      makeEvent({ threat_level: 5, threat_type: "SQL Injection" }),
    ];
    const { result } = renderHook(() => useTrafficStats([], threats));

    expect(result.current.threatCount).toBe(2);
  });

  it("should compute average threat level", () => {
    const threats = [
      makeEvent({ threat_level: 2, threat_type: "Port Scan" }),
      makeEvent({ threat_level: 4, threat_type: "DDoS Attack" }),
    ];
    const { result } = renderHook(() => useTrafficStats([], threats));

    expect(result.current.avgThreatLevel).toBe(3);
  });

  it("should group threats by type", () => {
    const threats = [
      makeEvent({ threat_level: 3, threat_type: "DDoS Attack" }),
      makeEvent({ threat_level: 2, threat_type: "DDoS Attack" }),
      makeEvent({ threat_level: 4, threat_type: "SQL Injection" }),
    ];
    const { result } = renderHook(() => useTrafficStats([], threats));

    expect(result.current.threatsByType).toEqual({
      "DDoS Attack": 2,
      "SQL Injection": 1,
    });
  });

  it("should ignore threats with null threat_type", () => {
    const threats = [
      makeEvent({ threat_level: 3, threat_type: null }),
    ];
    const { result } = renderHook(() => useTrafficStats([], threats));

    expect(result.current.threatsByType).toEqual({});
    expect(result.current.threatCount).toBe(1);
  });

  it("should produce bandwidth history buckets from time-distributed events", () => {
    const now = Date.now();
    // Create events spread across the 30-second window (3 sec per bucket)
    // Place 2 events in each of the 10 buckets
    const events: TrafficEvent[] = [];
    for (let bucket = 0; bucket < BANDWIDTH_BUCKET_COUNT; bucket++) {
      // Place events in the middle of each bucket
      const bucketMidMs = now - (BANDWIDTH_WINDOW_SEC * 1000) + (bucket * 3000) + 1500;
      events.push(makeEvent({ packet_size: 100, created_at: new Date(bucketMidMs).toISOString() }));
      events.push(makeEvent({ packet_size: 100, created_at: new Date(bucketMidMs + 100).toISOString() }));
    }
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.bandwidthHistory).toHaveLength(BANDWIDTH_BUCKET_COUNT);
    // Each bucket should have 200 bytes (2 events * 100)
    result.current.bandwidthHistory.forEach((b) => {
      expect(b).toBe(200);
    });
  });

  it("should calculate packetsPerSecond from 5-second window", () => {
    const now = Date.now();
    // 10 events all within the last 5 seconds
    const events = Array.from({ length: 10 }, (_, i) =>
      makeEvent({ created_at: new Date(now - i * 400).toISOString() })
    );
    const { result } = renderHook(() => useTrafficStats(events, []));

    // 10 events in 5-second window → 10/5 = 2 pkt/sec
    expect(result.current.packetsPerSecond).toBe(2);
  });

  it("should handle single event correctly", () => {
    const events = [makeEvent({ packet_size: 512, protocol: "HTTPS" })];
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.totalPackets).toBe(1);
    expect(result.current.totalBandwidth).toBe(512);
    expect(result.current.protocolDistribution).toEqual({ HTTPS: 1 });
    expect(result.current.bandwidthHistory).toHaveLength(BANDWIDTH_BUCKET_COUNT);
    // single recent event goes into the last bucket (most recent)
    const total = result.current.bandwidthHistory.reduce((s, v) => s + v, 0);
    expect(total).toBe(512);
    // single event in 5-second window → 1/5 = 0 pkt/sec (rounds down)
    expect(result.current.packetsPerSecond).toBe(0);
  });

  it("should exclude events outside the bandwidth window", () => {
    const now = Date.now();
    const oldTime = now - (BANDWIDTH_WINDOW_SEC + 5) * 1000; // 5 sec beyond window
    const events = [
      makeEvent({ packet_size: 999, created_at: new Date(oldTime).toISOString() }),
      makeEvent({ packet_size: 100, created_at: new Date(now - 1000).toISOString() }),
    ];
    const { result } = renderHook(() => useTrafficStats(events, []));

    // Only the recent event should appear in bandwidth history
    const total = result.current.bandwidthHistory.reduce((s, v) => s + v, 0);
    expect(total).toBe(100);
    // But totalBandwidth includes all events
    expect(result.current.totalBandwidth).toBe(1099);
  });

  it("should exclude old events from packetsPerSecond", () => {
    const now = Date.now();
    const events = [
      // 5 events within last 5 seconds
      ...Array.from({ length: 5 }, (_, i) =>
        makeEvent({ created_at: new Date(now - i * 500).toISOString() })
      ),
      // 5 events older than 5 seconds
      ...Array.from({ length: 5 }, (_, i) =>
        makeEvent({ created_at: new Date(now - 10000 - i * 500).toISOString() })
      ),
    ];
    const { result } = renderHook(() => useTrafficStats(events, []));

    // Only 5 recent events in the 5-second window → 5/5 = 1 pkt/sec
    expect(result.current.packetsPerSecond).toBe(1);
  });
});
