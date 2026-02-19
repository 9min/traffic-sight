import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTrafficStats } from "../useTrafficStats";
import type { TrafficEvent } from "@/lib/supabase/types";

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
    expect(stats.bandwidthHistory).toHaveLength(0);
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

  it("should produce bandwidth history buckets", () => {
    // 20 events → should produce ~10 buckets
    const events = Array.from({ length: 20 }, (_, i) =>
      makeEvent({ packet_size: 100 })
    );
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.bandwidthHistory.length).toBeGreaterThan(0);
    expect(result.current.bandwidthHistory.length).toBeLessThanOrEqual(11);

    // Each bucket should be sum of 2 events = 200
    result.current.bandwidthHistory.forEach((b) => {
      expect(b).toBe(200);
    });
  });

  it("should cap packetsPerSecond at 5", () => {
    const events = Array.from({ length: 50 }, () => makeEvent());
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.packetsPerSecond).toBe(5);
  });

  it("should handle single event correctly", () => {
    const events = [makeEvent({ packet_size: 512, protocol: "HTTPS" })];
    const { result } = renderHook(() => useTrafficStats(events, []));

    expect(result.current.totalPackets).toBe(1);
    expect(result.current.totalBandwidth).toBe(512);
    expect(result.current.protocolDistribution).toEqual({ HTTPS: 1 });
    expect(result.current.bandwidthHistory).toHaveLength(1);
    expect(result.current.bandwidthHistory[0]).toBe(512);
  });
});
