"use client";

import React, { useRef, useEffect } from "react";

interface SignalParticlesBackgroundProps {
  className?: string;
  spacing?: number;
  dotRadius?: number;
  speed?: number;
}

/**
 * Signal Particles — Exact ThreeUI Loop
 * Source: https://threeui.com/backgrounds/predictive-arc/signal-particles
 *
 * Implements the continuous double-sinusoidal wave field loop with deterministic
 * spatial highlights (cyan, emerald, purple) across a centered dot matrix.
 */
export function SignalParticlesBackground({
  className = "",
  spacing = 16,
  dotRadius = 1.45,
  speed = 1.0,
}: SignalParticlesBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const localCtx = canvas.getContext("2d", { alpha: true });
    if (!localCtx) return;
    const ctx: CanvasRenderingContext2D = localCtx;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;
    let rafId = 0;
    let isVisible = true;

    // Interactive pointer
    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    // Pause when footer is scrolled offscreen (saves 100% CPU/battery)
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? true;
      if (isVisible && !rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(draw);
      } else if (!isVisible && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    });
    io.observe(container);

    const onVisibilityChange = () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!document.hidden && isVisible && !rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Mouse movement listener on parent container
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onMouseLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastTime = performance.now();

    function draw(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);

      const offsetX = (width - cols * spacing) / 2;
      const offsetY = (height - rows * spacing) / 2;

      // Soft ambient background vignette
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.9,
        0,
        width / 2,
        height * 0.9,
        Math.max(width * 0.6, height)
      );
      bgGrad.addColorStop(0, "rgba(16, 185, 129, 0.05)");
      bgGrad.addColorStop(0.6, "rgba(6, 182, 212, 0.02)");
      bgGrad.addColorStop(1, "transparent");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = offsetX + i * spacing;
          const y = offsetY + j * spacing;

          const nx = i * 0.1;
          const ny = j * 0.1;

          // Exact ThreeUI double-sinusoidal interference wave loop
          const wave1 = Math.sin(nx + time * 0.5) * Math.cos(ny - time * 0.3);
          const wave2 = Math.sin(nx * 0.5 - ny * 0.5 + time * 0.8);
          let value = wave1 + wave2;

          // Pointer interaction boost
          if (pointer.active) {
            const pdx = x - pointer.x;
            const pdy = y - pointer.y;
            const pdist = Math.hypot(pdx, pdy);
            if (pdist < 110) {
              value += (1 - pdist / 110) * 0.6;
            }
          }

          if (value > 0.08) {
            // Soft top fade to blend smoothly into above sections
            const topFade = Math.min(1, y / 50);
            const alpha = Math.min(0.65, (value - 0.08) * 0.85) * topFade;

            if (alpha <= 0.015) continue;

            // Deterministic spatial coordinate highlight check from ThreeUI
            const highlightCheck = Math.sin(i * 12.34) * Math.cos(j * 56.78);

            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);

            if (highlightCheck > 0.98) {
              // UniVerse Emerald Signal
              ctx.fillStyle = "#10B981";
              ctx.shadowColor = "rgba(16, 185, 129, 0.85)";
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.shadowBlur = 0;
            } else if (highlightCheck > 0.955) {
              // Cyber Cyan / Blue Signal (ThreeUI #3b82f6)
              ctx.fillStyle = "#38BDF8";
              ctx.shadowColor = "rgba(56, 189, 248, 0.8)";
              ctx.shadowBlur = 5;
              ctx.fill();
              ctx.shadowBlur = 0;
            } else if (highlightCheck < -0.965) {
              // Neon Purple Signal (ThreeUI #8b5cf6)
              ctx.fillStyle = "#A855F7";
              ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
              ctx.shadowBlur = 5;
              ctx.fill();
              ctx.shadowBlur = 0;
            } else {
              // Base signal matrix particles
              ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
              ctx.shadowBlur = 0;
              ctx.fill();
            }
          }
        }
      }

      if (!prefersReducedMotion) {
        time += (dt / 0.016) * 0.02 * speed;
      }

      if (isVisible) {
        rafId = requestAnimationFrame(draw);
      }
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [spacing, dotRadius, speed]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full block pointer-events-none select-none"
      />
    </div>
  );
}

export default SignalParticlesBackground;
