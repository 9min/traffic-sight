"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { TrafficEvent } from "@/lib/supabase/types";
import { ROLLING_WINDOW, MAX_THREAT_ENTRIES } from "@/lib/constants";
import { EventBuffer } from "@/lib/event-buffer";

export function useTrafficStream() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [threats, setThreats] = useState<TrafficEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const bufferRef = useRef<EventBuffer<TrafficEvent> | null>(null);

  const handleFlush = useCallback((batch: TrafficEvent[]) => {
    setEvents((prev) => {
      const next = [...batch, ...prev];
      return next.slice(0, ROLLING_WINDOW);
    });

    setTotalCount((prev) => prev + batch.length);

    const threatBatch = batch.filter((e) => e.threat_level > 0);
    if (threatBatch.length > 0) {
      setThreats((prev) => {
        const next = [...threatBatch, ...prev];
        return next.slice(0, MAX_THREAT_ENTRIES);
      });
    }
  }, []);

  // Start/stop event buffer
  useEffect(() => {
    const buffer = new EventBuffer<TrafficEvent>(handleFlush, 300);
    buffer.start();
    bufferRef.current = buffer;

    return () => {
      buffer.stop();
      bufferRef.current = null;
    };
  }, [handleFlush]);

  useEffect(() => {
    // Fetch initial events
    async function fetchInitial() {
      const { data } = await supabase
        .from("traffic_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(ROLLING_WINDOW);

      if (data) {
        setEvents(data as TrafficEvent[]);
        const threatEvents = data.filter((e) => (e as TrafficEvent).threat_level > 0);
        setThreats(threatEvents as TrafficEvent[]);
        setTotalCount(data.length);
      }
    }

    fetchInitial();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("traffic-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "traffic_events",
        },
        (payload) => {
          const newEvent = payload.new as TrafficEvent;
          bufferRef.current?.push(newEvent);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return { events, threats, isConnected, totalCount };
}
