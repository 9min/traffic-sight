"use client";

import { useState, useEffect, useRef } from "react";
import GlitchText from "@/components/effects/GlitchText";

interface HeaderProps {
  isConnected: boolean;
  totalCount: number;
}

function useAnimatedCounter(value: number, duration = 400) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = prevValue.current;
    const end = value;
    const startTime = Date.now();

    let frameId: number;
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);
      el!.textContent = current.toLocaleString();

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();
    prevValue.current = value;

    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return ref;
}

export default function Header({ isConnected, totalCount }: HeaderProps) {
  const [time, setTime] = useState("");
  const counterRef = useAnimatedCounter(totalCount);

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-matrix-green/20 bg-black/80 backdrop-blur-sm">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Cyber logo icon */}
          <div className="w-8 h-8 border border-matrix-green/60 flex items-center justify-center relative neon-glow-green">
            <div className="w-4 h-4 bg-matrix-green/20 border border-matrix-green/40 rotate-45" />
            <div className="absolute inset-0 border border-matrix-green/20 rotate-12" />
          </div>
          <GlitchText
            text="TRAFFIC SIGHT"
            className="text-xl font-bold tracking-wider text-matrix-green text-glow-green"
          />
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-matrix-green/50">
          <span className="px-2 py-0.5 border border-matrix-green/20 bg-matrix-green/5">
            v2.0.4
          </span>
          <span className="px-2 py-0.5 border border-cyber-cyan/20 bg-cyber-cyan/5 text-cyber-cyan/60">
            REALTIME
          </span>
        </div>
      </div>

      {/* Center: Stats */}
      <div className="hidden lg:flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-matrix-green/50 uppercase tracking-wider">Events</span>
          <span ref={counterRef} className="text-matrix-green font-bold text-glow-green tabular-nums">
            0
          </span>
        </div>
      </div>

      {/* Right: Time + Status */}
      <div className="flex items-center gap-4">
        <div className="text-cyber-cyan font-bold tabular-nums text-sm text-glow-cyan tracking-widest">
          {time}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? "bg-matrix-green animate-pulse shadow-[0_0_6px_rgba(0,255,65,0.6)]"
                : "bg-threat-red shadow-[0_0_6px_rgba(255,0,64,0.6)]"
            }`}
          />
          <span
            className={`text-xs font-medium tracking-wider ${
              isConnected ? "text-matrix-green/70" : "text-threat-red/70"
            }`}
          >
            {isConnected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>
      </div>
    </header>
  );
}
