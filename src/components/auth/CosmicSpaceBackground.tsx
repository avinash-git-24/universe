"use client";

import React, { useEffect, useRef } from "react";

/**
 * Option 2: "Subtle Space / UniVerse" Minimal Cosmic
 *
 * An ethereal, deep space canvas designed for UniVerse:
 * - Deep midnight cosmic space (#02040c to #060a1a)
 * - Multi-depth twinkling starfield (distant dust + foreground stars)
 * - Ambient cosmic nebula aura (soft violet, sapphire & emerald-teal glow)
 * - Occasional gentle shooting star streak
 * - Ethereal celestial orbit ring
 */
export default function CosmicSpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 1. Generate multi-depth stars
    const STAR_COUNT = 130;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      baseAlpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.03 + 0.008,
      phase: Math.random() * Math.PI * 2,
      color:
        Math.random() > 0.7
          ? "#a5f3fc" // faint cyan
          : Math.random() > 0.5
          ? "#ddd6fe" // soft lavender
          : Math.random() > 0.3
          ? "#fef08a" // faint warm gold
          : "#ffffff", // pure white
    }));

    // 2. Shooting star tracker
    let shootingStar: {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      angle: number;
      active: boolean;
    } = {
      x: 0,
      y: 0,
      length: 120,
      speed: 16,
      opacity: 0,
      angle: Math.PI / 4 + 0.15,
      active: false,
    };

    let nextShootTime = Date.now() + 2500;

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // A. Draw twinkling stars
      for (const s of stars) {
        const twinkle = Math.sin(time * s.twinkleSpeed * 100 + s.phase);
        const alpha = Math.max(0.1, Math.min(1, s.baseAlpha + twinkle * 0.35));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Extra soft glow for slightly bigger stars
        if (s.size > 1.3) {
          ctx.shadowColor = s.color;
          ctx.shadowBlur = s.size * 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;

      // B. Trigger shooting star
      const now = Date.now();
      if (!shootingStar.active && now > nextShootTime) {
        shootingStar = {
          x: Math.random() * (width * 0.7),
          y: Math.random() * (height * 0.35),
          length: Math.random() * 80 + 100,
          speed: Math.random() * 8 + 14,
          opacity: 1,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          active: true,
        };
        nextShootTime = now + Math.random() * 6000 + 4000;
      }

      // C. Render shooting star streak
      if (shootingStar.active) {
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

        const grad = ctx.createLinearGradient(
          tailX,
          tailY,
          shootingStar.x,
          shootingStar.y
        );
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(0.7, `rgba(165, 243, 252, ${shootingStar.opacity * 0.5})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.stroke();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.opacity -= 0.018;

        if (
          shootingStar.opacity <= 0 ||
          shootingStar.x > width + 100 ||
          shootingStar.y > height + 100
        ) {
          shootingStar.active = false;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#02040a]">
      {/* 1. Deep Cosmic Nebula Glows (Violet, Sapphire & Teal) */}
      <div
        className="absolute -top-[15%] left-[20%] w-[700px] h-[700px] rounded-full opacity-35 blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(79, 70, 229, 0.2) 45%, transparent 75%)",
          animation: "cosmicDrift 16s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute top-[45%] -right-[10%] w-[650px] h-[650px] rounded-full opacity-30 blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 80%)",
          animation: "cosmicDriftReverse 18s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -bottom-[20%] left-[10%] w-[750px] h-[750px] rounded-full opacity-25 blur-[160px]"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 60%, transparent 80%)",
          animation: "cosmicDrift 20s ease-in-out infinite alternate",
        }}
      />

      {/* 2. Ethereal Celestial Planetary Orbit Rings (Faint geometric circles) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-indigo-500/[0.08] pointer-events-none"
        style={{ animation: "spinSlow 140s linear infinite" }}
      >
        <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-cyan-400/40 blur-[2px]" />
      </div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1250px] h-[1250px] rounded-full border border-cyan-500/[0.05] pointer-events-none"
        style={{ animation: "spinSlowReverse 200s linear infinite" }}
      />

      {/* 3. Starfield & Shooting Stars Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 4. Vignette Softening */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(2, 4, 12, 0.85) 90%)",
        }}
      />

      <style jsx>{`
        @keyframes cosmicDrift {
          0% {
            transform: translate(0px, 0px) scale(0.95);
          }
          100% {
            transform: translate(40px, 35px) scale(1.1);
          }
        }
        @keyframes cosmicDriftReverse {
          0% {
            transform: translate(0px, 0px) scale(1.05);
          }
          100% {
            transform: translate(-35px, -30px) scale(0.9);
          }
        }
        @keyframes spinSlow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes spinSlowReverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
