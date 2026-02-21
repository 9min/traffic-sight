import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ROLLING_WINDOW, MAX_THREAT_ENTRIES } from "@/lib/constants";

const mockEvent = {
  src_ip: "1.2.3.4",
  src_country_code: "US",
  src_city: "New York",
  src_lat: 40.7,
  src_lng: -74.0,
  dst_ip: "5.6.7.8",
  dst_country_code: "KR",
  dst_city: "Seoul",
  dst_lat: 37.5,
  dst_lng: 127.0,
  protocol: "TCP",
  port: 443,
  packet_size: 1024,
  threat_level: 0,
  threat_type: null,
  status: "active" as const,
};

const mockThreatEvent = {
  ...mockEvent,
  threat_level: 3,
  threat_type: "DDoS Attack",
};

vi.mock("@/lib/traffic-generator", () => ({
  generateTrafficEvent: vi.fn(() => ({ ...mockEvent })),
}));

import { useTrafficStream, GENERATION_INTERVAL_MS } from "../useTrafficStream";
import { generateTrafficEvent } from "@/lib/traffic-generator";

const mockedGenerate = vi.mocked(generateTrafficEvent);

/**
 * Advance timers by the given number of interval ticks, then flush all
 * pending timers (including RAF polyfill which uses setTimeout(cb, 0)).
 */
function advanceAndFlush(ticks: number) {
  // Advance through the interval ticks to queue events
  act(() => {
    vi.advanceTimersByTime(GENERATION_INTERVAL_MS * ticks);
  });
  // Flush the RAF polyfill (setTimeout(cb, 0)) and any React batched updates
  act(() => {
    vi.runAllTicks();
    vi.advanceTimersByTime(1);
  });
}

describe("useTrafficStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedGenerate.mockReturnValue({ ...mockEvent });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useTrafficStream());
    expect(result.current.events).toEqual([]);
    expect(result.current.threats).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it("should set isConnected to true immediately", () => {
    const { result } = renderHook(() => useTrafficStream());
    expect(result.current.isConnected).toBe(true);
  });

  it("should return all expected fields", () => {
    const { result } = renderHook(() => useTrafficStream());
    expect(result.current).toHaveProperty("events");
    expect(result.current).toHaveProperty("threats");
    expect(result.current).toHaveProperty("isConnected");
    expect(result.current).toHaveProperty("totalCount");
  });

  it("should accumulate events after interval ticks", () => {
    const { result } = renderHook(() => useTrafficStream());

    advanceAndFlush(3);

    expect(result.current.events.length).toBeGreaterThanOrEqual(1);
    expect(result.current.totalCount).toBeGreaterThanOrEqual(1);
  });

  it("should assign id and created_at to each event", () => {
    const { result } = renderHook(() => useTrafficStream());

    advanceAndFlush(3);

    expect(result.current.events.length).toBeGreaterThanOrEqual(1);
    const event = result.current.events[0];
    expect(event.id).toBeDefined();
    expect(typeof event.id).toBe("string");
    expect(event.created_at).toBeDefined();
    expect(typeof event.created_at).toBe("string");
  });

  it("should cap events at ROLLING_WINDOW", () => {
    const { result } = renderHook(() => useTrafficStream());

    // Generate well over ROLLING_WINDOW events in smaller batches
    // to ensure RAF flushes happen periodically
    for (let i = 0; i < ROLLING_WINDOW + 20; i++) {
      act(() => {
        vi.advanceTimersByTime(GENERATION_INTERVAL_MS);
      });
    }
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.events.length).toBeLessThanOrEqual(ROLLING_WINDOW);
  });

  it("should filter threat events into threats array", () => {
    mockedGenerate.mockReturnValue({ ...mockThreatEvent });

    const { result } = renderHook(() => useTrafficStream());

    advanceAndFlush(3);

    expect(result.current.threats.length).toBeGreaterThanOrEqual(1);
    expect(result.current.threats[0].threat_level).toBe(3);
  });

  it("should not add non-threat events to threats array", () => {
    mockedGenerate.mockReturnValue({ ...mockEvent, threat_level: 0 });

    const { result } = renderHook(() => useTrafficStream());

    advanceAndFlush(5);

    expect(result.current.threats.length).toBe(0);
  });

  it("should cap threats at MAX_THREAT_ENTRIES", () => {
    mockedGenerate.mockReturnValue({ ...mockThreatEvent });

    const { result } = renderHook(() => useTrafficStream());

    for (let i = 0; i < MAX_THREAT_ENTRIES + 20; i++) {
      act(() => {
        vi.advanceTimersByTime(GENERATION_INTERVAL_MS);
      });
    }
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.threats.length).toBeLessThanOrEqual(MAX_THREAT_ENTRIES);
  });

  it("should clean up interval on unmount", () => {
    const { unmount } = renderHook(() => useTrafficStream());

    unmount();

    // After unmount, advancing timers should not trigger more events
    const callsBefore = mockedGenerate.mock.calls.length;
    act(() => {
      vi.advanceTimersByTime(GENERATION_INTERVAL_MS * 10);
    });
    expect(mockedGenerate.mock.calls.length).toBe(callsBefore);
  });
});
