"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import type { TrafficEvent } from "@/lib/types";
import { MAX_ARCS, ARC_TTL_MS, RING_TTL_MS } from "@/lib/constants";
import type { GlobeMethods } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const MAX_RINGS = 15;

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
  createdAt: number;
}

interface RingDatum {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
  color: string;
  id: string;
  createdAt: number;
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

  // Arc TTL lifecycle state
  const [arcsData, setArcsData] = useState<ArcDatum[]>([]);
  const arcIdsRef = useRef<Set<string>>(new Set());

  // Ring TTL lifecycle state
  const [ringsData, setRingsData] = useState<RingDatum[]>([]);
  const ringIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate + initial camera position
  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current as GlobeMethods & {
      controls: () => { autoRotate: boolean; autoRotateSpeed: number };
    };
    if (globe.controls) {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
      }
    }
    // Set initial camera: Atlantic-centered view
    globe.pointOfView({ lat: 20, lng: -20, altitude: 2.2 }, 0);
  }, [mounted]);

  // Customize globe material and lighting on ready
  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const scene = globe.scene();

    // Find the globe mesh and add emissive glow
    scene.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshPhongMaterial) {
        obj.material.emissive = new THREE.Color(0x003311);
        obj.material.emissiveIntensity = 0.4;
      }
    });

    // Add a subtle point light for depth
    const pointLight = new THREE.PointLight(0x00d4ff, 0.6, 400);
    pointLight.position.set(-80, 80, 120);
    scene.add(pointLight);
  }, []);

  // Add new arcs and rings when events change
  useEffect(() => {
    const now = Date.now();
    let arcsChanged = false;
    let ringsChanged = false;

    const newArcs: ArcDatum[] = [];
    const newRings: RingDatum[] = [];

    for (const event of events) {
      // Add arc if not already tracked
      if (!arcIdsRef.current.has(event.id)) {
        if (arcIdsRef.current.size < MAX_ARCS) {
          arcIdsRef.current.add(event.id);
          const isThreat = event.threat_level > 0;
          newArcs.push({
            startLat: event.src_lat,
            startLng: event.src_lng,
            endLat: event.dst_lat,
            endLng: event.dst_lng,
            color: isThreat
              ? ["rgba(255, 0, 64, 0.9)", "rgba(255, 102, 0, 0.6)"] as [string, string]
              : ["rgba(0, 255, 65, 0.9)", "rgba(0, 212, 255, 0.6)"] as [string, string],
            stroke: isThreat ? 2.5 : 1.2,
            id: event.id,
            dashGap: isThreat ? 0.6 : 1.5,
            dashLength: isThreat ? 0.8 : 0.4,
            animateTime: 1000 + Math.random() * 800,
            createdAt: now,
          });
          arcsChanged = true;
        }
      }

      // Add ring if not already tracked
      const ringId = `ring-${event.id}`;
      if (!ringIdsRef.current.has(ringId)) {
        if (ringIdsRef.current.size < MAX_RINGS) {
          ringIdsRef.current.add(ringId);
          const isThreat = event.threat_level > 0;
          newRings.push({
            lat: event.dst_lat,
            lng: event.dst_lng,
            maxR: isThreat ? 4 : 2,
            propagationSpeed: isThreat ? 4 : 2,
            repeatPeriod: isThreat ? 600 : 1200,
            color: isThreat ? "rgba(255, 0, 64, 0.6)" : "rgba(0, 255, 65, 0.4)",
            id: ringId,
            createdAt: now,
          });
          ringsChanged = true;
        }
      }
    }

    if (arcsChanged) {
      setArcsData((prev) => [...prev, ...newArcs]);
    }
    if (ringsChanged) {
      setRingsData((prev) => [...prev, ...newRings]);
    }
  }, [events]);

  // Cleanup timer: remove expired arcs and rings every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      setArcsData((prev) => {
        const next = prev.filter((arc) => now - arc.createdAt < ARC_TTL_MS);
        // Sync the ID set
        const nextIds = new Set(next.map((a) => a.id));
        arcIdsRef.current = nextIds;
        if (next.length !== prev.length) return next;
        return prev; // no change → skip re-render
      });

      setRingsData((prev) => {
        const next = prev.filter((ring) => now - ring.createdAt < RING_TTL_MS);
        const nextIds = new Set(next.map((r) => r.id));
        ringIdsRef.current = nextIds;
        if (next.length !== prev.length) return next;
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
          size: isThreat ? 0.7 : 0.5,
          color: isThreat ? "#ff0040" : "#00ff41",
        });
      }
      if (!cities.has(dstKey)) {
        cities.set(dstKey, {
          lat: event.dst_lat,
          lng: event.dst_lng,
          size: 0.6,
          color: "#00d4ff",
        });
      }
    });
    return Array.from(cities.values());
  }, [events]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <div className="globe-vignette" />
      {!mounted ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-matrix-green/50 text-sm animate-pulse">
            INITIALIZING GLOBE...
          </div>
        </div>
      ) : (
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#00d4ff"
          atmosphereAltitude={0.25}
          onGlobeReady={handleGlobeReady}
          arcsData={arcsData}
          arcColor="color"
          arcStroke="stroke"
          arcDashLength="dashLength"
          arcDashGap="dashGap"
          arcDashAnimateTime="animateTime"
          arcAltitudeAutoScale={0.45}
          arcsTransitionDuration={800}
          ringsData={ringsData}
          ringLat="lat"
          ringLng="lng"
          ringColor="color"
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.02}
          pointRadius="size"
          pointsMerge={false}
          pointsTransitionDuration={800}
          enablePointerInteraction={false}
          width={width}
          height={height}
          animateIn={true}
        />
      )}
    </div>
  );
}
