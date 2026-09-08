"use client";

import { useEffect, useRef } from "react";

export default function CyberpunkTerminalBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Characters for the matrix rain
    const chars = "0101010101ABCDEF0123456789UNIVERSE<>[]{}/*#$_+~";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));
    const speeds: number[] = new Array(columns).fill(1).map(() => 0.6 + Math.random() * 0.9);

    // Mouse interaction
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const newCols = Math.floor(width / fontSize);
      drops.length = newCols;
      speeds.length = newCols;
      for (let i = 0; i < newCols; i++) {
        if (drops[i] === undefined) {
          drops[i] = Math.floor(Math.random() * -50);
          speeds[i] = 0.6 + Math.random() * 0.9;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    let frame = 0;

    const render = () => {
      frame++;

      // Subtle fade to create motion trails
      ctx.fillStyle = "rgba(4, 8, 14, 0.12)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", "Fira Code", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Proximity glow to mouse
        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNearMouse = dist < 120;

        if (y > 0 && y < height + 40) {
          const char = chars[Math.floor(Math.random() * chars.length)];

          // Head character is glowing white/cyan, tail is matrix emerald
          if (isNearMouse) {
            ctx.fillStyle = "#6ee7b7";
            ctx.shadowColor = "#34d399";
            ctx.shadowBlur = 12;
            ctx.fillText(char, x, y);
            ctx.shadowBlur = 0;
          } else if (Math.random() > 0.96) {
            ctx.fillStyle = "#ecfdf5"; // Bright glitch character
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 8;
            ctx.fillText(char, x, y);
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = "rgba(16, 185, 129, 0.45)";
            ctx.fillText(char, x, y);
          }
        }

        // Advance drop
        drops[i] += speeds[i];

        // Reset drop when off-screen with random delay
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = 0.6 + Math.random() * 0.9;
        }
      }

      animId = requestAnimationFrame(render);
    };

    // Initial background fill
    ctx.fillStyle = "#03070b";
    ctx.fillRect(0, 0, width, height);
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#03070b]">
      {/* Matrix Rain Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Cyberpunk Perspective Floor Grid at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to top, rgba(16, 185, 129, 0.25) 1px, transparent 1px),
            linear-gradient(to right, rgba(16, 185, 129, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: "perspective(300px) rotateX(60deg)",
          transformOrigin: "bottom center",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 10%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 10%, transparent 100%)",
        }}
      />

      {/* Radial Vignette & Dark Center Focus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(3,7,11,0.65) 0%, rgba(2,5,9,0.92) 80%, #010306 100%)",
        }}
      />

      {/* CRT Scanline Overlay Effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.3) 3px, rgba(0, 255, 136, 0.3) 3px)",
        }}
      />

      {/* Subtle Corner Cyber Accents */}
      <div className="absolute top-6 left-6 font-mono text-[10px] text-emerald-500/40 tracking-widest pointer-events-none hidden md:block">
        SYS_NODE // UNIVERSE_OS_v4.2.0
      </div>
      <div className="absolute top-6 right-6 font-mono text-[10px] text-emerald-500/40 tracking-widest pointer-events-none hidden md:block">
        PORT: 443 // ENCRYPT: AES-GCM
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-emerald-500/40 tracking-widest pointer-events-none hidden md:block">
        &gt; MARWADI_UNIVERSITY_NETWORK: SECURE
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-emerald-500/40 tracking-widest pointer-events-none hidden md:block">
        STATUS: READY_FOR_HANDSHAKE
      </div>
    </div>
  );
}
