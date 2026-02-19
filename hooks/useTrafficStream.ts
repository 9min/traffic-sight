"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { TrafficEvent } from "@/lib/supabase/types";
import { ROLLING_WINDOW, MAX_THREAT_ENTRIES } from "@/lib/constants";

export function useTrafficStream() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [threats, setThreats] = useState<TrafficEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const addEvent = useCallback((event: TrafficEvent) => {
    setEvents((prev) => {
      const next = [event, ...prev];
      return next.slice(0, ROLLING_WINDOW);
    });

    setTotalCount((prev) => prev + 1);

    if (event.threat_level > 0) {
      setThreats((prev) => {
        const next = [event, ...prev];
        return next.slice(0, MAX_THREAT_ENTRIES);
      });
    }
  }, []);

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
          addEvent(newEvent);
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
  }, [addEvent]);

  return { events, threats, isConnected, totalCount };
}
