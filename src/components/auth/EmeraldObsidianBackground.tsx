"use client";

import React, { useEffect, useRef } from "react";

/**
 * Option 1: Linear / Stripe Style Deep Obsidian + Ambient Emerald Aurora
 *
 * Designed specifically for UniVerse campus platform:
 * - Deep obsidian dark space canvas (#030704)
 * - Gentle, floating emerald & teal ambient light orbs
 * - Modern subtle dot-grid overlay for high-tech campus feel
 * - Lightweight floating micro-particles (60fps canvas, hardware-accelerated)
 */
export default function EmeraldObsidianBackground() {
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

    // Particle setup - gentle, slow floating fireflies/stars
    const PARTICLE_COUNT = 45;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.35 - 0.1, // gentle upward drift
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      hue: Math.random() > 0.4 ? 150 : 180, // emerald to teal
    }));

    let time = 0;
    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Render floating micro-particles
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += Math.sin(time * 3 + p.x) * 0.005;

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = Math.max(0.1, Math.min(0.8, p.opacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${currentOpacity})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, ${currentOpacity * 0.8})`;
        ctx.shadowBlur = p.size * 4;
        ctx.fill();
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
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#030704]">
      {/* 1. Large Ambient Glowing Orbs (CSS Animated Mesh) */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full opacity-40 blur-[130px] transition-all duration-1000"
        style={{
          background: "radial-gradient(circle, rgba(0,230,118,0.35) 0%, rgba(5,150,105,0.15) 50%, transparent 75%)",
          animation: "auroraPulse 9s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute top-[40%] -left-[15%] w-[600px] h-[600px] rounded-full opacity-30 blur-[140px]"
        style={{
          background: "radial-gradient(circle, rgba(0,180,216,0.3) 0%, rgba(0,230,118,0.1) 60%, transparent 80%)",
          animation: "auroraDriftLeft 14s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[700px] h-[700px] rounded-full opacity-35 blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(6,78,59,0.2) 60%, transparent 80%)",
          animation: "auroraDriftRight 12s ease-in-out infinite alternate",
        }}
      />

      {/* 2. Precision Tech Dot-Matrix Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(0, 230, 118, 0.45) 1.5px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* 3. Subtle Vignette Edge Shading */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(3, 7, 4, 0.85) 90%)",
        }}
      />

      {/* 4. Canvas Floating Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* CSS Keyframe Animations for Natural Fluid Ambient Lighting */}
      <style jsx>{`
        @keyframes auroraPulse {
          0% {
            transform: translate(-50%, -5%) scale(0.95);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, 8%) scale(1.1);
            opacity: 0.5;
          }
        }
        @keyframes auroraDriftLeft {
          0% {
            transform: translateY(0px) scale(0.9);
          }
          100% {
            transform: translateY(60px) scale(1.15);
          }
        }
        @keyframes auroraDriftRight {
          0% {
            transform: translateY(0px) scale(1);
          }
          100% {
            transform: translateY(-50px) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
