"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Option 3: Modern Tech Dot-Grid + Spotlight Beam (Enhanced Edition)
 *
 * High-tech developer & futuristic campus portal aesthetic:
 * - Deep obsidian tech slate (#03050c)
 * - Volumetric overhead Spotlight Beam illuminating the login card
 * - Touch & cursor proximity illumination across a precision dot matrix
 * - Gentle ambient idle breathing pulse for dynamic vitality
 * - Floating projector dust particles catching the light beam
 * - Energy-efficient pause on tab blur
 */
export default function TechSpotlightBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    let isUserActive = false;
    let lastActiveTime = Date.now();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const updatePointer = (x: number, y: number) => {
      targetMouseX = x;
      targetMouseY = y;
      isUserActive = true;
      lastActiveTime = Date.now();
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("touchstart", handleTouch, { passive: true });

    // Micro dust particles catching the spotlight beam
    const DUST_COUNT = 60;
    const dustParticles = Array.from({ length: DUST_COUNT }, () => {
      const angle = (Math.random() - 0.5) * 0.75 + Math.PI / 2; // downwards cone
      const dist = Math.random() * (height * 0.95);
      return {
        x: width / 2 + Math.cos(angle) * dist * 0.65,
        y: Math.sin(angle) * dist,
        size: Math.random() * 1.5 + 0.5,
        speedY: Math.random() * 0.22 + 0.08,
        speedX: (Math.random() - 0.5) * 0.16,
        opacity: Math.random() * 0.65 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      };
    });

    let time = 0;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (!isVisible) return;
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // If no recent mouse activity, create gentle breathing focal drift around card
      const idleElapsed = Date.now() - lastActiveTime;
      if (idleElapsed > 3500) {
        targetMouseX = width / 2 + Math.sin(time * 0.8) * 80;
        targetMouseY = Math.min(height * 0.45, 420) + Math.cos(time * 0.6) * 45;
      }

      // Smooth mouse interpolation
      curMouseX += (targetMouseX - curMouseX) * 0.075;
      curMouseY += (targetMouseY - curMouseY) * 0.075;

      // ─── 1. Volumetric Overhead Architectural Spotlight Beam ─────────────────
      const beamApexX = width / 2;
      const beamApexY = -30;
      const beamSpread = Math.max(width * 0.58, 640);

      // Primary Volumetric Light Cone
      const coneGradient = ctx.createRadialGradient(
        beamApexX,
        beamApexY,
        15,
        beamApexX,
        height * 0.52,
        Math.max(width * 0.75, 750)
      );
      coneGradient.addColorStop(0, "rgba(16, 185, 129, 0.24)"); // Emerald core
      coneGradient.addColorStop(0.22, "rgba(20, 184, 166, 0.15)"); // Teal mid
      coneGradient.addColorStop(0.48, "rgba(56, 189, 248, 0.06)"); // Soft sky blue fringe
      coneGradient.addColorStop(0.85, "rgba(3, 5, 12, 0)");
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
        40,
        beamApexX,
        Math.min(height * 0.45, 420),
        380
      );
      centerGlow.addColorStop(0, "rgba(16, 185, 129, 0.14)");
      centerGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.06)");
      centerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(beamApexX, Math.min(height * 0.45, 420), 380, 0, Math.PI * 2);
      ctx.fill();

      // Bottom ambient pedestal bounce
      const floorGlow = ctx.createRadialGradient(
        beamApexX,
        height,
        50,
        beamApexX,
        height,
        Math.max(width * 0.4, 400)
      );
      floorGlow.addColorStop(0, "rgba(16, 185, 129, 0.08)");
      floorGlow.addColorStop(0.6, "rgba(20, 184, 166, 0.03)");
      floorGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = floorGlow;
      ctx.fillRect(0, height - 200, width, 200);

      // ─── 2. Interactive Precision Dot Matrix ─────────────────────────────────
      const dotSpacing = 30;
      const startX = (width % dotSpacing) / 2;
      const startY = (height % dotSpacing) / 2;
      const idlePulse = Math.sin(time * 1.5) * 0.04;

      for (let x = startX; x < width; x += dotSpacing) {
        for (let y = startY; y < height; y += dotSpacing) {
          // Proximity to mouse / touch
          const dx = x - curMouseX;
          const dy = y - curMouseY;
          const distMouse = Math.sqrt(dx * dx + dy * dy);

          // Proximity to top spotlight beam
          const distApexX = Math.abs(x - beamApexX);
          const apexWeight = Math.max(0, 1 - distApexX / (width * 0.48));

          // Base dot brightness
          let alpha = 0.065 + idlePulse;
          let dotColor = "rgba(255, 255, 255, ";
          let radius = 0.95;

          // Proximity highlight (cursor spotlight)
          if (distMouse < 190) {
            const mouseProximityFactor = 1 - distMouse / 190;
            alpha += mouseProximityFactor * 0.65;
            radius = 1.1 + mouseProximityFactor * 1.1;
            dotColor = "rgba(52, 211, 153, "; // Emerald neon highlight
          } else if (apexWeight > 0.15 && y < height * 0.78) {
            alpha += apexWeight * 0.13;
            dotColor = "rgba(167, 243, 208, ";
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${dotColor}${Math.max(0, Math.min(1, alpha))})`;
          ctx.fill();
        }
      }

      // ─── 3. Floating Projector Light Dust Particles ──────────────────────────
      for (const p of dustParticles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity += Math.sin(time * 2 + p.x) * 0.005;

        // Reset if drifted off
        if (p.y < 0) {
          p.y = height + 10;
          p.x = width / 2 + (Math.random() - 0.5) * (width * 0.6);
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Particles glow brighter inside the spotlight cone
        const distFromCenter = Math.abs(p.x - width / 2);
        const insideBeam = Math.max(0, 1 - distFromCenter / (width * 0.38));
        const alpha = Math.max(0.1, Math.min(0.9, (p.opacity + insideBeam * 0.42) * 0.85));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110, 231, 183, ${alpha})`;
        ctx.shadowColor = `rgba(16, 185, 129, ${alpha * 0.7})`;
        ctx.shadowBlur = p.size * 3.5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ─── 4. Tech Crosshairs (+) at Strategic Points ──────────────────────────
      const crosshairPositions = [
        { x: 0.10 * width, y: 0.16 * height, label: "SYS_NODE.01" },
        { x: 0.90 * width, y: 0.16 * height, label: "SEC_PORT.443" },
        { x: 0.10 * width, y: 0.84 * height, label: "LAT_22.5.MU" },
        { x: 0.90 * width, y: 0.84 * height, label: "GATEWAY.OK" },
      ];

      for (const c of crosshairPositions) {
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
        ctx.lineWidth = 1;
        const arm = 8;

        // Draw crosshair '+'
        ctx.beginPath();
        ctx.moveTo(c.x - arm, c.y);
        ctx.lineTo(c.x + arm, c.y);
        ctx.moveTo(c.x, c.y - arm);
        ctx.lineTo(c.x, c.y + arm);
        ctx.stroke();

        // Subtle tiny mono tech coordinate text
        ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
        ctx.font = "9px monospace";
        ctx.fillText(c.label, c.x + 11, c.y + 3);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchstart", handleTouch);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#03050c]">
      {/* 1. Dynamic Canvas Layer (Spotlight + Dot Matrix + Dust + Crosshairs) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* 2. Top Laser Emitter Fixture (The physical light slit at the top) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
        {/* Subtle pulsating halo */}
        <div className="h-10 w-72 bg-emerald-500/20 blur-xl -mt-5 rounded-full" />
        {/* Intense horizontal laser line */}
        <div className="h-[2px] w-72 md:w-[480px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_30px_#10b981]" />
        {/* Cyan center focal flare */}
        <div className="h-1 w-28 bg-gradient-to-r from-transparent via-cyan-300 to-transparent blur-[1px] -mt-[1px]" />
      </div>

      {/* 3. High-Tech Edge Vignette & Depth Masking */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(3, 5, 12, 0.72) 80%, #03050c 100%)",
        }}
      />

      {/* 4. Ambient Top Light Incline */}
      <div
        className="absolute top-0 inset-x-0 h-48 pointer-events-none opacity-60"
        style={{
          background:
            "linear-gradient(180deg, rgba(16, 185, 129, 0.07) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
