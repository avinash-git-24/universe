"use client";

import React, { useRef, useEffect } from "react";

interface SignalParticlesBackgroundProps {
  className?: string;
  dotSpacing?: number;
  baseDotRadius?: number;
}

interface SignalPacket {
  angle: number; // Angle along the arc in radians
  speed: number;
  radius: number; // Angular width / spatial influence
  hue: "emerald" | "cyan" | "violet";
  intensity: number;
}

export function SignalParticlesBackground({
  className = "",
  dotSpacing = 22,
  baseDotRadius = 1.25,
}: SignalParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;

    // Interactive pointer state
    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
    };

    // Click ripples
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
    }
    const ripples: Ripple[] = [];

    // Signal packets travelling along the predictive arc
    const packets: SignalPacket[] = [
      { angle: 0.2, speed: 0.18, radius: 0.35, hue: "emerald", intensity: 1.0 },
      { angle: 1.1, speed: -0.14, radius: 0.40, hue: "cyan", intensity: 0.85 },
      { angle: 2.2, speed: 0.22, radius: 0.30, hue: "emerald", intensity: 0.95 },
      { angle: 2.9, speed: -0.16, radius: 0.45, hue: "violet", intensity: 0.75 },
      { angle: 0.7, speed: 0.26, radius: 0.25, hue: "emerald", intensity: 0.9 },
    ];

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    // Pointer listeners on canvas parent
    const parent = canvas.parentElement;
    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const onPointerDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (ripples.length < 5) {
        ripples.push({
          x: px,
          y: py,
          radius: 0,
          maxRadius: Math.max(width, height) * 0.45,
          alpha: 0.85,
        });
      }
    };

    if (parent) {
      parent.addEventListener("mousemove", onPointerMove);
      parent.addEventListener("mouseleave", onPointerLeave);
      parent.addEventListener("mousedown", onPointerDown);
    }

    let lastTime = performance.now();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!prefersReducedMotion) {
        // Advance packets along the arc
        for (const p of packets) {
          p.angle += p.speed * dt;
          if (p.angle > Math.PI) p.angle -= Math.PI;
          if (p.angle < 0) p.angle += Math.PI;
        }

        // Advance ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += 180 * dt;
          r.alpha -= 0.65 * dt;
          if (r.alpha <= 0 || r.radius >= r.maxRadius) {
            ripples.splice(i, 1);
          }
        }
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Arc origin & geometry (predictive dome centered below bottom edge)
      const arcCenterX = width * 0.5;
      const arcCenterY = height * 1.25;
      const arcRadius = Math.max(width * 0.52, height * 1.15);
      const arcBandWidth = Math.max(height * 0.42, 140);

      // Grid dimensions
      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;

      // Draw faint soft ambient glow at the arc summit
      const summitGlow = ctx.createRadialGradient(
        arcCenterX,
        arcCenterY - arcRadius,
        0,
        arcCenterX,
        arcCenterY - arcRadius,
        arcBandWidth * 1.8
      );
      summitGlow.addColorStop(0, "rgba(16, 185, 129, 0.07)");
      summitGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.03)");
      summitGlow.addColorStop(1, "transparent");
      ctx.fillStyle = summitGlow;
      ctx.fillRect(0, 0, width, height);

      // Arrays to collect bright dots for micro-connectivity lines
      const excitedDots: Array<{ x: number; y: number; brightness: number; color: string }> = [];

      // Render Matrix Grid
      for (let r = 0; r < rows; r++) {
        const y = r * dotSpacing;

        for (let c = 0; c < cols; c++) {
          const x = c * dotSpacing;

          // Distance from predictive arc center
          const dx = x - arcCenterX;
          const dy = (y - arcCenterY) * 1.15; // slightly flattened ellipse
          const dist = Math.hypot(dx, dy);

          // Gaussian falloff from the predictive arc path
          const distFromArc = Math.abs(dist - arcRadius);
          const arcWeight = Math.exp(-Math.pow(distFromArc / (arcBandWidth * 0.55), 2));

          // Angle on the upper half-circle (0 to PI)
          // Angle 0 is right, PI is left. Normalize so center is ~PI/2.
          const theta = Math.atan2(-(y - arcCenterY), dx);

          // Base dot brightness (very dark subtle background grid)
          let brightness = 0.05 + arcWeight * 0.32;
          let dotRadius = baseDotRadius;
          let dotColor = "rgba(255, 255, 255, 0.12)";

          // Signal packet illumination
          if (!prefersReducedMotion) {
            for (const p of packets) {
              const dTheta = Math.abs(theta - p.angle);
              // Wrap angular distance
              const angularDist = Math.min(dTheta, Math.PI * 2 - dTheta);

              if (angularDist < p.radius && distFromArc < arcBandWidth * 0.8) {
                const packetInfluence =
                  Math.cos((angularDist / p.radius) * (Math.PI / 2)) *
                  (1 - distFromArc / (arcBandWidth * 0.8)) *
                  p.intensity;

                if (packetInfluence > 0) {
                  brightness += packetInfluence * 0.75;
                  dotRadius = Math.max(dotRadius, baseDotRadius + packetInfluence * 1.5);

                  if (p.hue === "emerald") {
                    dotColor = `rgba(52, 211, 153, ${Math.min(0.95, brightness)})`;
                  } else if (p.hue === "cyan") {
                    dotColor = `rgba(34, 211, 238, ${Math.min(0.92, brightness)})`;
                  } else {
                    dotColor = `rgba(167, 139, 250, ${Math.min(0.88, brightness)})`;
                  }
                }
              }
            }

            // Ripple influence from clicks
            for (const rip of ripples) {
              const dRip = Math.hypot(x - rip.x, y - rip.y);
              const ringDist = Math.abs(dRip - rip.radius);
              if (ringDist < 45) {
                const ripFactor = (1 - ringDist / 45) * rip.alpha;
                brightness += ripFactor * 0.8;
                dotRadius += ripFactor * 1.8;
                dotColor = `rgba(52, 211, 153, ${Math.min(1, brightness)})`;
              }
            }
          }

          // Interactive Pointer proximity
          if (pointer.active) {
            const ptrDist = Math.hypot(x - pointer.x, y - pointer.y);
            const ptrRadius = 130;
            if (ptrDist < ptrRadius) {
              const ptrFactor = (1 - ptrDist / ptrRadius) * 0.65;
              brightness += ptrFactor;
              dotRadius = Math.max(dotRadius, baseDotRadius + ptrFactor * 1.4);
              dotColor = `rgba(110, 231, 183, ${Math.min(0.95, brightness)})`;
            }
          }

          // Top edge fade so it melts seamlessly into the section above
          const topFade = Math.min(1, y / 70);
          brightness *= topFade;

          if (brightness < 0.03) continue;

          // Draw the dot
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);

          if (brightness > 0.45) {
            ctx.fillStyle = dotColor;
            ctx.shadowColor = dotColor;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            // Collect for micro-connectivity
            if (excitedDots.length < 80) {
              excitedDots.push({ x, y, brightness, color: dotColor });
            }
          } else {
            ctx.fillStyle = `rgba(148, 163, 184, ${Math.min(0.25, brightness)})`;
            ctx.fill();
          }
        }
      }

      // Draw subtle micro-connectivity lines between close excited dots
      if (excitedDots.length > 1) {
        ctx.lineWidth = 0.75;
        for (let i = 0; i < excitedDots.length; i++) {
          const d1 = excitedDots[i];
          for (let j = i + 1; j < excitedDots.length; j++) {
            const d2 = excitedDots[j];
            const dist = Math.hypot(d1.x - d2.x, d1.y - d2.y);
            if (dist < dotSpacing * 1.55) {
              const lineAlpha = (1 - dist / (dotSpacing * 1.55)) * Math.min(d1.brightness, d2.brightness) * 0.35;
              ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(d1.x, d1.y);
              ctx.lineTo(d2.x, d2.y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (parent) {
        parent.removeEventListener("mousemove", onPointerMove);
        parent.removeEventListener("mouseleave", onPointerLeave);
        parent.removeEventListener("mousedown", onPointerDown);
      }
    };
  }, [dotSpacing, baseDotRadius]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    />
  );
}

export default SignalParticlesBackground;
