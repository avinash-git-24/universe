"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Option 3: Modern Tech Dot-Grid + Spotlight Beam
 *
 * High-tech developer & futuristic campus portal aesthetic (Linear / Raycast / Supabase style):
 * - Deep obsidian tech slate (#04060d)
 * - Top-center architectural Spotlight Beam illuminating the login card
 * - Interactive precision dot matrix with dynamic cursor proximity illumination
 * - Ambient tech crosshairs (+) and coordinate indicators
 * - Floating projector light dust particles inside the spotlight beam
 */
export default function TechSpotlightBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initial mouse pos in center-upper area (where the card is)
    let curMouseX = width / 2;
    let curMouseY = Math.min(height * 0.45, 420);
    let targetMouseX = curMouseX;
    let targetMouseY = curMouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Micro dust particles catching the spotlight beam
    const DUST_COUNT = 55;
    const dustParticles = Array.from({ length: DUST_COUNT }, () => {
      const angle = (Math.random() - 0.5) * 0.7 + Math.PI / 2; // downwards cone
      const dist = Math.random() * (height * 0.9);
      return {
        x: width / 2 + Math.cos(angle) * dist * 0.6,
        y: Math.sin(angle) * dist,
        size: Math.random() * 1.5 + 0.5,
        speedY: Math.random() * 0.25 + 0.08,
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.7 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      };
    });

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      curMouseX += (targetMouseX - curMouseX) * 0.08;
      curMouseY += (targetMouseY - curMouseY) * 0.08;

      // ─── 1. Draw Architectural Spotlight Beam from Top Center ────────────────
      const beamApexX = width / 2;
      const beamApexY = -40;
      const beamSpread = Math.max(width * 0.55, 600);

      // Main Soft Spotlight Cone
      const coneGradient = ctx.createRadialGradient(
        beamApexX,
        beamApexY,
        20,
        beamApexX,
        height * 0.5,
        Math.max(width * 0.7, 700)
      );
      coneGradient.addColorStop(0, "rgba(16, 185, 129, 0.22)"); // Vibrant emerald core
      coneGradient.addColorStop(0.2, "rgba(20, 184, 166, 0.14)"); // Soft teal mid
      coneGradient.addColorStop(0.45, "rgba(59, 130, 246, 0.06)"); // Cyber blue fringe
      coneGradient.addColorStop(0.8, "rgba(6, 9, 20, 0)");
      coneGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = coneGradient;
      ctx.beginPath();
      ctx.moveTo(beamApexX, beamApexY);
      ctx.lineTo(beamApexX - beamSpread, height);
      ctx.lineTo(beamApexX + beamSpread, height);
      ctx.closePath();
      ctx.fill();

      // Secondary focused center spotlight for login card pedestal
      const centerGlow = ctx.createRadialGradient(
        beamApexX,
        Math.min(height * 0.45, 420),
        50,
        beamApexX,
        Math.min(height * 0.45, 420),
        360
      );
      centerGlow.addColorStop(0, "rgba(16, 185, 129, 0.12)");
      centerGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.05)");
      centerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(beamApexX, Math.min(height * 0.45, 420), 360, 0, Math.PI * 2);
      ctx.fill();

      // ─── 2. Draw Precision Dot Matrix ────────────────────────────────────────
      const dotSpacing = 32;
      const startX = (width % dotSpacing) / 2;
      const startY = (height % dotSpacing) / 2;

      for (let x = startX; x < width; x += dotSpacing) {
        for (let y = startY; y < height; y += dotSpacing) {
          // Proximity to mouse
          const dx = x - curMouseX;
          const dy = y - curMouseY;
          const distMouse = Math.sqrt(dx * dx + dy * dy);

          // Proximity to top spotlight center
          const distApexX = Math.abs(x - beamApexX);
          const apexWeight = Math.max(0, 1 - distApexX / (width * 0.45));

          // Base dot brightness
          let alpha = 0.07;
          let dotColor = "rgba(255, 255, 255, ";
          let radius = 0.9;

          // Proximity highlight (cursor spotlight)
          if (distMouse < 180) {
            const mouseProximityFactor = 1 - distMouse / 180;
            alpha += mouseProximityFactor * 0.55;
            radius = 1.1 + mouseProximityFactor * 0.9;
            dotColor = "rgba(52, 211, 153, "; // Emerald neon highlight
          } else if (apexWeight > 0.2 && y < height * 0.75) {
            alpha += apexWeight * 0.12;
            dotColor = "rgba(167, 243, 208, ";
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${dotColor}${Math.min(1, alpha)})`;
          ctx.fill();
        }
      }

      // ─── 3. Draw Floating Projector Light Dust Particles ────────────────────
      for (const p of dustParticles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity += Math.sin(time * 2 + p.x) * 0.006;

        // Reset if drifted off top or sides
        if (p.y < 0) {
          p.y = height + 10;
          p.x = width / 2 + (Math.random() - 0.5) * (width * 0.6);
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Particles glow brighter inside the spotlight cone
        const distFromCenter = Math.abs(p.x - width / 2);
        const insideBeam = Math.max(0, 1 - distFromCenter / (width * 0.35));
        const alpha = Math.max(0.1, Math.min(0.9, (p.opacity + insideBeam * 0.4) * 0.8));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110, 231, 183, ${alpha})`;
        ctx.shadowColor = `rgba(16, 185, 129, ${alpha * 0.6})`;
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ─── 4. Tech Crosshairs (+) at Strategic Points ──────────────────────────
      const crosshairPositions = [
        { x: 0.12 * width, y: 0.18 * height, label: "SYS_NODE.01" },
        { x: 0.88 * width, y: 0.18 * height, label: "SEC_PORT.443" },
        { x: 0.12 * width, y: 0.82 * height, label: "LAT_22.5.MU" },
        { x: 0.88 * width, y: 0.82 * height, label: "AUTH_GATE.OK" },
      ];

      for (const c of crosshairPositions) {
        ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
        ctx.lineWidth = 1;
        const arm = 7;

        // Draw crosshair '+'
        ctx.beginPath();
        ctx.moveTo(c.x - arm, c.y);
        ctx.lineTo(c.x + arm, c.y);
        ctx.moveTo(c.x, c.y - arm);
        ctx.lineTo(c.x, c.y + arm);
        ctx.stroke();

        // Subtle tiny mono tech coordinate text
        ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
        ctx.font = "9px monospace";
        ctx.fillText(c.label, c.x + 10, c.y + 3);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#04060d]">
      {/* 1. Dynamic Canvas Layer (Spotlight + Dot Matrix + Dust + Crosshairs) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* 2. Top Laser Emitter Fixture (The physical light slit at the top) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        {/* Intense horizontal laser line */}
        <div className="h-[1.5px] w-64 md:w-96 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_25px_#10b981]" />
        {/* Subtle glowing lens flare bulb */}
        <div className="h-2 w-32 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-sm -mt-[1px]" />
      </div>

      {/* 3. High-Tech Edge Vignette & Ambient Vignetting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(4, 6, 13, 0.75) 85%, #04060d 100%)",
        }}
      />

      {/* 4. Very Subtle Top Ambient Scanner Line */}
      <div
        className="absolute top-0 inset-x-0 h-40 pointer-events-none opacity-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
