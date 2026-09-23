"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface LiquidMetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export function LiquidMetalButton({
  children,
  className,
  containerClassName,
  onClick,
  disabled,
  type = "button",
  ...props
}: LiquidMetalButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple: Ripple = { x, y, id: Date.now() };

        setRipples((prev) => [...prev.slice(-2), newRipple]);

        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 700);
      }

      onClick?.(e);
    },
    [disabled, onClick]
  );

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center select-none",
        containerClassName
      )}
    >
      {/* Ambient background bloom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-xl bg-emerald-500/25 blur-xl transition-all duration-300 group-hover:bg-emerald-500/40 opacity-80 pointer-events-none"
      />

      <button
        ref={buttonRef}
        type={type}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative z-10 w-full h-[50px] px-6 rounded-xl overflow-hidden",
          "inline-flex items-center justify-center gap-2.5",
          "font-semibold text-white tracking-wide",
          "cursor-pointer outline-none select-none",
          "transition-all duration-200 ease-out",
          "hover:scale-[1.02] active:scale-[0.98]",
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          "focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060A08]",
          className
        )}
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(16, 185, 129, 0.6),
            0 6px 20px -2px rgba(16, 185, 129, 0.45),
            0 2px 6px rgba(0, 0, 0, 0.25)
          `,
        }}
        {...props}
      >
        {/* Sleek diagonal light sweep on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.25) 45%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 55%, transparent 80%)",
            backgroundSize: "200% 100%",
            animation: "shimmerSweep 2.5s infinite linear",
          }}
        />

        {/* Click ripples */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            aria-hidden="true"
            className="absolute rounded-full bg-white/35 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              transform: "translate(-50%, -50%)",
              animation: "ripplePulse 0.7s ease-out forwards",
            }}
          />
        ))}

        {/* Button Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>

      <style jsx global>{`
        @keyframes shimmerSweep {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        @keyframes ripplePulse {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(15);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default LiquidMetalButton;
