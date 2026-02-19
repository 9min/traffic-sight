// OffscreenCanvas Matrix Rain Worker
// Can be used as an optimization if main-thread canvas becomes a bottleneck

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
let drops: number[] = [];
let columns: number;
const fontSize = 14;

self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data;

  if (type === "init") {
    canvas = data.canvas;
    ctx = canvas.getContext("2d")!;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns)
      .fill(0)
      .map(() => Math.random() * -100);
    draw();
  }

  if (type === "resize") {
    canvas.width = data.width;
    canvas.height = data.height;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns)
      .fill(0)
      .map(() => Math.random() * -100);
  }
};

function draw() {
  if (!ctx) return;

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

  requestAnimationFrame(draw);
}
