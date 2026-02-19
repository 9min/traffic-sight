"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function drawFallback(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const fontSize = 14;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array(columns)
    .fill(0)
    .map(() => Math.random() * -100);

  let animId: number;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns)
      .fill(0)
      .map(() => Math.random() * -100);
  }

  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.fillStyle = "rgba(10, 10, 15, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle =
        Math.random() > 0.98
          ? "#ffffff"
          : `rgba(0, 255, 65, ${0.3 + Math.random() * 0.7})`;
      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    animId = requestAnimationFrame(draw);
  }

  draw();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
  };
}

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try OffscreenCanvas + Worker path
    // IMPORTANT: Create Worker BEFORE transferring canvas control.
    // transferControlToOffscreen() is irreversible — if Worker creation
    // fails after transfer, the canvas becomes unusable for fallback.
    if (typeof OffscreenCanvas !== "undefined" && typeof Worker !== "undefined") {
      try {
        const worker = new Worker(
          new URL("../../workers/matrix-rain.worker.ts", import.meta.url)
        );

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const offscreen = canvas.transferControlToOffscreen();

        worker.postMessage({ type: "init", data: { canvas: offscreen } }, [
          offscreen,
        ]);

        workerRef.current = worker;

        function handleResize() {
          worker.postMessage({
            type: "resize",
            data: { width: window.innerWidth, height: window.innerHeight },
          });
        }

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          worker.terminate();
          workerRef.current = null;
        };
      } catch {
        // Worker creation failed (before transfer), fall through to main-thread fallback
      }
    }

    // Fallback: main-thread rendering
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    return drawFallback(canvas, ctx);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-15"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
