"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { generateTrafficEvent } from "@/lib/traffic-generator";
import type { TrafficEvent } from "@/lib/types";
import { ROLLING_WINDOW, MAX_THREAT_ENTRIES } from "@/lib/constants";
import { EventBuffer } from "@/lib/event-buffer";

export const GENERATION_INTERVAL_MS = 300;
export const FLUSH_INTERVAL_MS = 500;

export function useTrafficStream() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [threats, setThreats] = useState<TrafficEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const flushPending = useCallback((batch: TrafficEvent[]) => {
    if (batch.length === 0) return;

    setEvents((prev) => [...batch, ...prev].slice(0, ROLLING_WINDOW));
    setTotalCount((prev) => prev + batch.length);

    const threatBatch = batch.filter((e) => e.threat_level > 0);
    if (threatBatch.length > 0) {
      setThreats((prev) => [...threatBatch, ...prev].slice(0, MAX_THREAT_ENTRIES));
    }
  }, []);

  const bufferRef = useRef<EventBuffer<TrafficEvent> | null>(null);

  useEffect(() => {
    setIsConnected(true);

    const buffer = new EventBuffer<TrafficEvent>(flushPending, FLUSH_INTERVAL_MS);
    bufferRef.current = buffer;
    buffer.start();

    const interval = setInterval(() => {
      const raw = generateTrafficEvent();
      const event: TrafficEvent = {
        ...raw,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      buffer.push(event);
    }, GENERATION_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      buffer.stop();
      bufferRef.current = null;
    };
  }, [flushPending]);

  return { events, threats, isConnected, totalCount };
}
