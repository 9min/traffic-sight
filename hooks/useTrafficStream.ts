"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { generateTrafficEvent } from "@/lib/traffic-generator";
import type { TrafficEvent } from "@/lib/types";
import { ROLLING_WINDOW, MAX_THREAT_ENTRIES } from "@/lib/constants";

export const GENERATION_INTERVAL_MS = 100;

export function useTrafficStream() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [threats, setThreats] = useState<TrafficEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // RAF-based micro-batching: collect events arriving within the same
  // animation frame and flush them together, so updates stay in sync
  // with the browser's paint cycle instead of a fixed timer.
  const pendingRef = useRef<TrafficEvent[]>([]);
  const rafRef = useRef<number | null>(null);

  const flushPending = useCallback(() => {
    rafRef.current = null;
    const batch = pendingRef.current;
    if (batch.length === 0) return;
    pendingRef.current = [];

    setEvents((prev) => [...batch, ...prev].slice(0, ROLLING_WINDOW));
    setTotalCount((prev) => prev + batch.length);

    const threatBatch = batch.filter((e) => e.threat_level > 0);
    if (threatBatch.length > 0) {
      setThreats((prev) => [...threatBatch, ...prev].slice(0, MAX_THREAT_ENTRIES));
    }
  }, []);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsConnected(true);

    const interval = setInterval(() => {
      const raw = generateTrafficEvent();
      const event: TrafficEvent = {
        ...raw,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      pendingRef.current.push(event);
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flushPending);
      }
    }, GENERATION_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [flushPending]);

  return { events, threats, isConnected, totalCount };
}
