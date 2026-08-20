"use client";

import { useEffect, useRef } from "react";

// Fixed-position star coordinates across the upper/middle sky matching background star field
const STAR_POINTS = [
  { x: 0.49, y: 0.06, baseR: 1.8, speed: 0.7, phase: 0.0, halo: true },
  { x: 0.37, y: 0.12, baseR: 1.4, speed: 1.1, phase: 0.8, halo: true },
  { x: 0.60, y: 0.22, baseR: 2.0, speed: 0.5, phase: 1.6, halo: true },
  { x: 0.14, y: 0.22, baseR: 1.5, speed: 0.9, phase: 2.4, halo: false },
  { x: 0.55, y: 0.34, baseR: 1.7, speed: 0.6, phase: 3.2, halo: true },
  { x: 0.78, y: 0.28, baseR: 1.9, speed: 1.2, phase: 4.0, halo: true },
  { x: 0.30, y: 0.30, baseR: 1.3, speed: 0.8, phase: 0.5, halo: false },
  { x: 0.92, y: 0.18, baseR: 1.6, speed: 1.0, phase: 1.3, halo: true },
  { x: 0.08, y: 0.36, baseR: 1.4, speed: 0.7, phase: 2.1, halo: false },
  { x: 0.65, y: 0.48, baseR: 1.5, speed: 0.9, phase: 2.9, halo: false },
  { x: 0.44, y: 0.55, baseR: 1.8, speed: 0.6, phase: 3.7, halo: true },
  { x: 0.83, y: 0.55, baseR: 1.4, speed: 1.3, phase: 4.5, halo: false },
  { x: 0.22, y: 0.15, baseR: 1.5, speed: 0.8, phase: 0.3, halo: false },
  { x: 0.71, y: 0.10, baseR: 2.2, speed: 0.4, phase: 1.1, halo: true },
  { x: 0.88, y: 0.25, baseR: 1.6, speed: 1.1, phase: 1.9, halo: false },
  { x: 0.41, y: 0.26, baseR: 1.7, speed: 0.7, phase: 2.7, halo: true },
  { x: 0.52, y: 0.18, baseR: 2.0, speed: 0.5, phase: 3.5, halo: true },
  { x: 0.18, y: 0.42, baseR: 1.4, speed: 1.0, phase: 4.3, halo: false },
  { x: 0.33, y: 0.46, baseR: 1.6, speed: 0.6, phase: 0.7, halo: false },
  { x: 0.76, y: 0.48, baseR: 1.5, speed: 0.9, phase: 1.5, halo: false },
  { x: 0.95, y: 0.35, baseR: 1.8, speed: 0.8, phase: 2.3, halo: true },
  { x: 0.05, y: 0.25, baseR: 2.0, speed: 0.5, phase: 3.1, halo: true },
  { x: 0.62, y: 0.08, baseR: 1.3, speed: 1.2, phase: 3.9, halo: false },
  { x: 0.84, y: 0.14, baseR: 1.7, speed: 0.7, phase: 4.7, halo: true },
  { x: 0.28, y: 0.08, baseR: 1.5, speed: 1.0, phase: 0.2, halo: false },
  { x: 0.12, y: 0.10, baseR: 1.3, speed: 0.9, phase: 1.0, halo: false },
  { x: 0.45, y: 0.04, baseR: 1.9, speed: 0.6, phase: 1.8, halo: true },
  { x: 0.68, y: 0.04, baseR: 1.4, speed: 1.3, phase: 2.6, halo: false },
  { x: 0.79, y: 0.06, baseR: 1.6, speed: 0.8, phase: 3.4, halo: false },
  { x: 0.96, y: 0.08, baseR: 1.8, speed: 0.5, phase: 4.2, halo: true },
  { x: 0.03, y: 0.45, baseR: 1.4, speed: 1.1, phase: 0.6, halo: false },
  { x: 0.15, y: 0.50, baseR: 1.5, speed: 0.7, phase: 1.4, halo: false },
  { x: 0.25, y: 0.52, baseR: 1.3, speed: 1.0, phase: 2.2, halo: false },
  { x: 0.38, y: 0.50, baseR: 1.6, speed: 0.6, phase: 3.0, halo: true },
  { x: 0.58, y: 0.52, baseR: 1.4, speed: 1.2, phase: 3.8, halo: false },
  { x: 0.70, y: 0.55, baseR: 1.7, speed: 0.8, phase: 4.6, halo: true },
  { x: 0.85, y: 0.45, baseR: 1.5, speed: 0.9, phase: 0.4, halo: false },
  { x: 0.90, y: 0.52, baseR: 1.8, speed: 0.6, phase: 1.2, halo: true },
  { x: 0.50, y: 0.42, baseR: 1.6, speed: 1.1, phase: 2.0, halo: false },
  { x: 0.36, y: 0.38, baseR: 1.4, speed: 0.7, phase: 2.8, halo: false },
  { x: 0.63, y: 0.36, baseR: 1.9, speed: 0.5, phase: 3.6, halo: true },
  { x: 0.81, y: 0.38, baseR: 1.5, speed: 1.0, phase: 4.4, halo: false },
  { x: 0.27, y: 0.22, baseR: 1.7, speed: 0.8, phase: 0.9, halo: true },
  { x: 0.48, y: 0.30, baseR: 1.4, speed: 1.2, phase: 1.7, halo: false },
  { x: 0.73, y: 0.20, baseR: 1.6, speed: 0.6, phase: 2.5, halo: false },
];

export default function StarTwinkleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const t = (now - startTimeRef.current) / 1000;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < STAR_POINTS.length; i++) {
        const s = STAR_POINTS[i];
        const sx = s.x * W;
        const sy = s.y * H;

        // Smooth sine wave modulation for opacity & brightness
        const phase = s.phase + t * s.speed;
        const sine = 0.5 + 0.5 * Math.sin(phase);

        // Opacity ranges between 0.15 and 0.85
        const alpha = 0.15 + sine * 0.70;
        const currentRadius = s.baseR * (0.85 + sine * 0.4);

        ctx.save();
        ctx.globalAlpha = alpha;

        // Soft halo during peak brightness phase
        if (s.halo && sine > 0.6) {
          const haloRadius = currentRadius * 3.2;
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloRadius);
          grad.addColorStop(0, "rgba(224, 242, 254, 0.9)");
          grad.addColorStop(0.35, "rgba(56, 189, 248, 0.35)");
          grad.addColorStop(1, "rgba(56, 189, 248, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core star dot (pure white/soft cyan dot)
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(sx, sy, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mediaQuery.matches) {
      rafRef.current = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
