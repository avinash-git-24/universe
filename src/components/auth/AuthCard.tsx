/**
 * UniVerse — Auth Card Shell
 *
 * Centered glass-morphism card wrapping every auth form.
 * Accepts a title, subtitle, and children (the form content).
 */

import { AuthLogo } from "@/components/auth/AuthLogo";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cardEntranceVariants } from "@/lib/animations";
import { MouseEvent } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      className="w-full max-w-md mx-auto relative z-10 group"
      variants={cardEntranceVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      onMouseMove={handleMouseMove}
      style={{
        animation: "float 6s ease-in-out infinite"
      }}
    >
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <AuthLogo />
      </div>

      {/* Glass card */}
      <div
        className="rounded-[24px] border border-[#66FFB2]/50 overflow-hidden relative"
        style={{ 
          background: "linear-gradient(135deg, rgba(15, 25, 20, 0.4) 0%, rgba(5, 10, 8, 0.55) 100%)", 
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: "0 0 30px rgba(0, 230, 118, 0.2), inset 0 0 20px rgba(102, 255, 178, 0.1), 0 30px 60px -15px rgba(0, 0, 0, 0.9)",
        }}
      >
        {/* Mouse follow glow */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(102, 255, 178, 0.15),
                transparent 80%
              )
            `,
          }}
        />

        {/* Inner top glow highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#66FFB2] to-transparent opacity-90" />
        
        {/* Reflective bottom glow inside card */}
        <div className="absolute -bottom-10 left-0 right-0 h-1/2 bg-[#00E676]/10 blur-[50px] pointer-events-none" />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#00E676]/30 relative z-10 bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-transparent">
          <h1
            className="text-2xl font-bold text-white tracking-tight drop-shadow-md"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            {title}
          </h1>
          <p
            className="mt-1.5 text-sm text-[#A7B8B0]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {subtitle}
          </p>
        </div>

        {/* Form content */}
        <div className="px-8 py-6">{children}</div>
      </div>
    </motion.div>
  );
}
