"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { TrafficEvent } from "@/lib/supabase/types";
import { MAX_ARCS } from "@/lib/constants";
import type { GlobeMethods } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface GlobeSectionProps {
  events: TrafficEvent[];
}

interface ArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
  stroke: number;
  id: string;
  dashGap: number;
  dashLength: number;
  animateTime: number;
}

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 600, height: 500 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

export default function GlobeSection({ events }: GlobeSectionProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const { width, height } = useContainerSize(containerRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current as GlobeMethods & {
      controls: () => { autoRotate: boolean; autoRotateSpeed: number };
    };
    if (globe.controls) {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }
    }
  }, [mounted]);

  const arcsData = useMemo<ArcDatum[]>(() => {
    return events.slice(0, MAX_ARCS).map((event) => {
      const isThreat = event.threat_level > 0;
      return {
        startLat: event.src_lat,
        startLng: event.src_lng,
        endLat: event.dst_lat,
        endLng: event.dst_lng,
        color: isThreat
          ? (["rgba(255, 0, 64, 0.8)", "rgba(255, 102, 0, 0.4)"] as [string, string])
          : (["rgba(0, 255, 65, 0.8)", "rgba(0, 212, 255, 0.4)"] as [string, string]),
        stroke: isThreat ? 1.5 : 0.8,
        id: event.id,
        dashGap: isThreat ? 1 : 2,
        dashLength: isThreat ? 0.5 : 0.3,
        animateTime: 1500 + Math.random() * 1000,
      };
    });
  }, [events]);

  const pointsData = useMemo(() => {
    const cities = new Map<
      string,
      { lat: number; lng: number; size: number; color: string }
    >();
    events.forEach((event) => {
      const srcKey = `${event.src_lat},${event.src_lng}`;
      const dstKey = `${event.dst_lat},${event.dst_lng}`;
      const isThreat = event.threat_level > 0;

      if (!cities.has(srcKey)) {
        cities.set(srcKey, {
          lat: event.src_lat,
          lng: event.src_lng,
          size: 0.3,
          color: isThreat ? "#ff0040" : "#00ff41",
        });
      }
      if (!cities.has(dstKey)) {
        cities.set(dstKey, {
          lat: event.dst_lat,
          lng: event.dst_lng,
          size: 0.3,
          color: "#00d4ff",
        });
      }
    });
    return Array.from(cities.values());
  }, [events]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {!mounted ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-matrix-green/50 text-sm animate-pulse">
            INITIALIZING GLOBE...
          </div>
        </div>
      ) : (
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#00ff41"
          atmosphereAltitude={0.15}
          arcsData={arcsData}
          arcColor="color"
          arcStroke="stroke"
          arcDashLength="dashLength"
          arcDashGap="dashGap"
          arcDashAnimateTime="animateTime"
          arcAltitudeAutoScale={0.3}
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.01}
          pointRadius="size"
          pointsMerge={true}
          width={width}
          height={height}
          animateIn={true}
        />
      )}
    </div>
  );
}
