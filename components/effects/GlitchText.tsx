"use client";

import { useRef, useEffect } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export default function GlitchText({ text, className = "" }: GlitchTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const glitchChars = "!<>-_\\/[]{}—=+*^?#_アイウエオカキ";

    function triggerGlitch() {
      const original = text;
      const spans = el!.querySelectorAll<HTMLSpanElement>(".glitch-char");

      // Randomly glitch 2-4 characters
      const glitchCount = 2 + Math.floor(Math.random() * 3);
      const indices = new Set<number>();
      while (indices.size < Math.min(glitchCount, original.length)) {
        indices.add(Math.floor(Math.random() * original.length));
      }

      indices.forEach((idx) => {
        const span = spans[idx];
        if (!span) return;

        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        span.textContent = randomChar;
        span.style.color = Math.random() > 0.5 ? "#00d4ff" : "#ff0040";
        span.style.textShadow = `0 0 10px ${span.style.color}`;

        setTimeout(() => {
          span.textContent = original[idx] === " " ? "\u00A0" : original[idx];
          span.style.color = "";
          span.style.textShadow = "";
        }, 100 + Math.random() * 150);
      });

      // Schedule next glitch at random interval
      timeoutId = setTimeout(triggerGlitch, 2000 + Math.random() * 4000);
    }

    timeoutId = setTimeout(triggerGlitch, 1000);

    return () => clearTimeout(timeoutId);
  }, [text]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <span className="relative z-10">
        {text.split("").map((char, i) => (
          <span key={i} className="glitch-char inline-block transition-colors duration-75">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      {/* Glitch layers */}
      <span
        className="absolute top-0 left-0 z-0 opacity-60"
        style={{
          color: "#00d4ff",
          animation: "glitch1 3s infinite",
          animationDelay: "0.1s",
        }}
        aria-hidden
      >
        {text}
      </span>
      <span
        className="absolute top-0 left-0 z-0 opacity-60"
        style={{
          color: "#ff0040",
          animation: "glitch2 3s infinite",
          animationDelay: "0.2s",
        }}
        aria-hidden
      >
        {text}
      </span>
    </div>
  );
}
