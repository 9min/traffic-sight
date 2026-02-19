"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: "> INITIALIZING TRAFFIC SIGHT v2.0.4...", delay: 0 },
  { text: "> LOADING KERNEL MODULES...", delay: 300 },
  { text: "> CONNECTING TO SUPABASE REALTIME...", delay: 600 },
  { text: "> INITIALIZING 3D GLOBE RENDERER...", delay: 900 },
  { text: "> ACTIVATING THREAT DETECTION ENGINE...", delay: 1200 },
  { text: "> ALL SYSTEMS OPERATIONAL", delay: 1500 },
  { text: "> LAUNCHING DASHBOARD...", delay: 1900 },
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
        }, line.delay)
      );
    });

    // Start fade out
    timers.push(
      setTimeout(() => {
        setFading(true);
      }, 2300)
    );

    // Complete
    timers.push(
      setTimeout(() => {
        onComplete();
      }, 2800)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!fading && (
        <motion.div
          className="fixed inset-0 z-50 bg-cyber-bg flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-lg w-full px-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="text-2xl font-bold text-matrix-green text-glow-green tracking-[0.3em]">
                TRAFFIC SIGHT
              </div>
              <div className="text-[10px] text-matrix-green/30 tracking-widest mt-1">
                NETWORK MONITORING SYSTEM
              </div>
            </div>

            {/* Boot lines */}
            <div className="space-y-1 font-mono text-xs">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={
                    i === BOOT_LINES.length - 1
                      ? "text-cyber-cyan text-glow-cyan"
                      : i === BOOT_LINES.length - 2
                        ? "text-matrix-green text-glow-green"
                        : "text-matrix-green/60"
                  }
                >
                  {line.text}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-0.5 bg-matrix-green/10 rounded overflow-hidden">
              <motion.div
                className="h-full bg-matrix-green"
                initial={{ width: "0%" }}
                animate={{
                  width: `${Math.min((visibleLines / BOOT_LINES.length) * 100, 100)}%`,
                }}
                transition={{ duration: 0.3 }}
                style={{ boxShadow: "0 0 8px rgba(0, 255, 65, 0.6)" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
