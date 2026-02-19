"use client";

import { ReactNode } from "react";

interface CyberPanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
  variant?: "green" | "cyan" | "red";
  pulse?: boolean;
}

const borderColors = {
  green: "border-matrix-green/30",
  cyan: "border-cyber-cyan/30",
  red: "border-threat-red/30",
};

const glowClasses = {
  green: "neon-glow-green",
  cyan: "neon-glow-cyan",
  red: "neon-glow-red",
};

const titleColors = {
  green: "text-matrix-green text-glow-green",
  cyan: "text-cyber-cyan text-glow-cyan",
  red: "text-threat-red text-glow-red",
};

const dotColors = {
  green: "bg-matrix-green",
  cyan: "bg-cyber-cyan",
  red: "bg-threat-red",
};

export default function CyberPanel({
  children,
  title,
  className = "",
  variant = "green",
  pulse = false,
}: CyberPanelProps) {
  return (
    <div
      className={`
        relative bg-black/70 backdrop-blur-sm border
        ${borderColors[variant]}
        ${pulse ? "cyber-border-pulse" : ""}
        ${glowClasses[variant]}
        ${className}
      `}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-matrix-green/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-matrix-green/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-matrix-green/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-matrix-green/60" />

      {/* Title bar */}
      {title && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-matrix-green/20">
          <div className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />
          <span className={`text-xs font-bold tracking-widest uppercase ${titleColors[variant]}`}>
            {title}
          </span>
          <div className="flex-1" />
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-matrix-green/40" />
            <div className="w-1 h-1 rounded-full bg-matrix-green/40" />
            <div className="w-1 h-1 rounded-full bg-matrix-green/40" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none scanline-effect overflow-hidden" />
    </div>
  );
}
