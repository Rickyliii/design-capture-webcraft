import { useEffect, useRef } from "react";
import { GOLDEN_FINALE_MS } from "@/lib/golden-finale";
import "./golden-finale.css";

/** Small, finite concert bursts; no library, full-screen flashes or hit targets. */
export function GoldenFinale({ command }: { command: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const ctx = element.getContext("2d");
    if (!ctx) return;
    const width = element.clientWidth, height = element.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    element.width = width * ratio; element.height = height * ratio;
    ctx.scale(ratio, ratio);
    const style = getComputedStyle(element);
    const gold = style.getPropertyValue("--finale-spark").trim();
    const trail = style.getPropertyValue("--finale-trail").trim();
    const bursts = [[0.28, 0.35, 0], [0.74, 0.46, 320], [0.48, 0.62, 650], [0.58, 0.27, 950]];
    const particles = bursts.flatMap(([x, y, delay]) => Array.from({ length: 28 }, (_, i) => ({
      x: x * width, y: y * height, delay,
      angle: i * Math.PI * 2 / 28 + delay / 1000,
      speed: Math.min(width, height) * (0.15 + (i % 5) * 0.027),
      star: i % 7 === 0,
    })));
    let frame = 0;
    const start = performance.now();
    const stop = () => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, width, height); };
    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);
      if (elapsed >= GOLDEN_FINALE_MS || reduced.matches) return;
      for (const p of particles) {
        const t = (elapsed - p.delay) / 1500;
        if (t <= 0 || t >= 1) continue;
        const distance = p.speed * (1 - Math.exp(-3 * t));
        const x = p.x + Math.cos(p.angle) * distance;
        const y = p.y + Math.sin(p.angle) * distance + 28 * t * t;
        ctx.globalAlpha = Math.min(1, t * 8) * (1 - t) ** 1.3;
        ctx.strokeStyle = trail; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(x - Math.cos(p.angle) * 13 * (1 - t), y - Math.sin(p.angle) * 13 * (1 - t)); ctx.stroke();
        ctx.fillStyle = gold; ctx.strokeStyle = gold;
        if (p.star) {
          ctx.beginPath(); ctx.moveTo(x - 3.5, y); ctx.lineTo(x + 3.5, y);
          ctx.moveTo(x, y - 3.5); ctx.lineTo(x, y + 3.5); ctx.stroke();
        } else { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const timeout = setTimeout(stop, GOLDEN_FINALE_MS);
    reduced.addEventListener("change", stop);
    return () => { stop(); clearTimeout(timeout); reduced.removeEventListener("change", stop); };
  }, [command]);
  return <canvas ref={canvas} className="golden-finale" aria-hidden="true" />;
}