"use client";

import { motion } from "framer-motion";

// ─── Individual product SVGs ──────────────────────────────────────────────────

const SnackPacket = () => (
  <svg width="60" height="74" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <rect x="6" y="14" width="40" height="44" fill="url(#snackGrad)" rx="6" stroke="#C09040" strokeWidth="1.5"/>
    <path d="M 6 14 Q 26 8 46 14" fill="#E8B040" stroke="#B07030" strokeWidth="1"/>
    <path d="M 8 16 Q 26 10 44 16" fill="#F0C060" stroke="none"/>
    <rect x="6" y="28" width="40" height="16" fill="#10B981" opacity="0.9"/>
    <rect x="12" y="32" width="28" height="8" fill="#059669" rx="4" />
    <text x="26" y="39.5" textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">SNACK</text>
    <rect x="8" y="16" width="6" height="38" fill="white" opacity="0.4" rx="3"/>
    <path d="M 8 56 Q 26 62 44 56" fill="#C09040" stroke="none"/>
    <defs>
      <linearGradient id="snackGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE68A"/>
        <stop offset="100%" stopColor="#F59E0B"/>
      </linearGradient>
    </defs>
  </svg>
);

const ChocolateBar = () => (
  <svg width="64" height="50" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <rect x="2" y="4" width="52" height="36" fill="url(#chocoWrap)" rx="5" stroke="#904020" strokeWidth="1.5"/>
    <rect x="2" y="4" width="52" height="8" fill="#B05030" rx="5"/>
    <rect x="2" y="12" width="52" height="2" fill="#904020"/>
    {[0,1,2,3].map(col =>
      [0,1].map(row => (
        <rect
          key={`${col}-${row}`}
          x={8 + col * 11} y={18 + row * 10}
          width="9" height="8"
          fill="#4A2511" rx="1.5"
        />
      ))
    )}
    <rect x="4" y="6" width="5" height="32" fill="white" opacity="0.4" rx="2.5"/>
    <text x="28" y="11.5" textAnchor="middle" fill="white" fontSize="6" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">CHOCO</text>
    <defs>
      <linearGradient id="chocoWrap" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D97706"/>
        <stop offset="100%" stopColor="#92400E"/>
      </linearGradient>
    </defs>
  </svg>
);

const SodaCan = () => (
  <svg width="50" height="78" viewBox="0 0 42 66" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.55)) drop-shadow(0 6px 8px rgba(0,0,0,0.3))" }}>
    <defs>
      {/* 3D Metallic Red Coke Can Body */}
      <linearGradient id="cokeRedGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7F1D1D" />
        <stop offset="12%" stopColor="#991B1B" />
        <stop offset="32%" stopColor="#EF4444" />
        <stop offset="55%" stopColor="#DC2626" />
        <stop offset="85%" stopColor="#991B1B" />
        <stop offset="100%" stopColor="#5B1111" />
      </linearGradient>

      {/* Metallic Aluminum Rim & Lid */}
      <linearGradient id="aluminumGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="25%" stopColor="#F1F5F9" />
        <stop offset="50%" stopColor="#CBD5E1" />
        <stop offset="80%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>

      {/* Metallic Neck Inset Gradient */}
      <linearGradient id="neckGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="30%" stopColor="#E2E8F0" />
        <stop offset="70%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* Pull Tab Gradient */}
      <linearGradient id="tabGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
    </defs>

    {/* Base Ambient Shadow */}
    <ellipse cx="21" cy="62" rx="14" ry="3" fill="#000000" opacity="0.4" />

    {/* Tapered Bottom Aluminum Rim */}
    <path d="M 7 57 L 9 60 Q 21 63 33 60 L 35 57 Z" fill="url(#aluminumGrad)" />
    <ellipse cx="21" cy="60" rx="12" ry="2.2" fill="#64748B" />

    {/* Main Can Body */}
    <path d="M 6 15 L 7 57 Q 21 60.5 35 57 L 36 15 Q 21 17.5 6 15 Z" fill="url(#cokeRedGrad)" />

    {/* Left Aluminum Specular Highlight Sheen (Glossy Reflection) */}
    <path d="M 9.5 16 L 10.5 56.5 Q 12 57 13.5 56.8 L 12.5 16.2 Z" fill="#FFFFFF" opacity="0.65" />
    <path d="M 11 16.2 L 12 56.5 Q 12.8 56.7 13.5 56.6 L 12.5 16.3 Z" fill="#FFFFFF" opacity="0.85" />

    {/* Right Soft Ambient Rim Reflection */}
    <path d="M 33 16.5 L 32.5 56 Q 34 56.5 34.8 56 L 35.2 16.3 Z" fill="#FFFFFF" opacity="0.25" />

    {/* Dynamic Iconic Coke Wave / Ribbon */}
    <path d="M 6 38 Q 14 34 21 38 Q 28 42 36 36 L 36 39.5 Q 28 45.5 21 41.5 Q 14 37.5 6 41 Z" fill="#FFFFFF" opacity="0.95" />
    <path d="M 6 42 Q 14 38.5 21 42 Q 28 45.5 36 40.5 L 36 41.5 Q 28 46.5 21 43 Q 14 39.5 6 43 Z" fill="#FFFFFF" opacity="0.4" />

    {/* BOLD "COKE" Typography */}
    <text x="21" y="32.5" textAnchor="middle" fill="#5B1111" fontSize="8.5" fontFamily="'Impact', 'Arial Black', sans-serif" fontWeight="900" letterSpacing="1">COKE</text>
    <text x="21" y="31.8" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontFamily="'Impact', 'Arial Black', sans-serif" fontWeight="900" letterSpacing="1">COKE</text>

    {/* Secondary "ORIGINAL" Badge / Text */}
    <text x="21" y="24" textAnchor="middle" fill="#FECACA" fontSize="2.8" fontFamily="-apple-system, sans-serif" fontWeight="800" letterSpacing="1.2" opacity="0.9">ORIGINAL</text>

    {/* Cold Ice Droplets */}
    <circle cx="16" cy="22" r="0.8" fill="#FFFFFF" opacity="0.8" />
    <circle cx="15.8" cy="22.2" r="0.4" fill="#7F1D1D" opacity="0.5" />
    <circle cx="28" cy="46" r="0.7" fill="#FFFFFF" opacity="0.8" />
    <circle cx="28" cy="46.2" r="0.3" fill="#7F1D1D" opacity="0.5" />
    <circle cx="10" cy="45" r="0.6" fill="#FFFFFF" opacity="0.7" />

    {/* Tapered Upper Neck (Chime) */}
    <path d="M 6 15 L 8 11 Q 21 13 34 11 L 36 15 Q 21 17.5 6 15 Z" fill="url(#neckGrad)" />
    <ellipse cx="21" cy="11.5" rx="13" ry="3.5" fill="#475569" />

    {/* Metallic Aluminum Top Rim */}
    <ellipse cx="21" cy="10.5" rx="13" ry="3.8" fill="url(#aluminumGrad)" />
    <ellipse cx="21" cy="10.2" rx="12" ry="3.3" fill="#E2E8F0" />
    <ellipse cx="21" cy="10" rx="11" ry="2.9" fill="#94A3B8" />
    <ellipse cx="21" cy="9.8" rx="10.5" ry="2.6" fill="#CBD5E1" />

    {/* Recessed Drinking Spout Hole */}
    <path d="M 18 10 C 18 9, 24 9, 24 10 C 24 11, 18 11, 18 10 Z" fill="#475569" stroke="#334155" strokeWidth="0.3" />
    <ellipse cx="21" cy="9.9" rx="2" ry="0.6" fill="#0F172A" />

    {/* 3D Metal Pull-Tab */}
    <g transform="translate(19.5, 6.2)">
      <path d="M 0 3.5 L 1.2 0.8 Q 1.5 0.3 2.5 0.3 L 3.5 0.3 Q 4.5 0.3 4.8 0.8 L 6 3.5 Q 6.5 4.5 5 4.8 L 1 4.8 Q -0.5 4.5 0 3.5 Z" fill="url(#tabGrad)" stroke="#64748B" strokeWidth="0.3" />
      <ellipse cx="3" cy="2.2" rx="1.1" ry="0.6" fill="#64748B" />
      <circle cx="3" cy="4" r="0.6" fill="#334155" />
      <circle cx="3" cy="3.9" r="0.3" fill="#FFFFFF" opacity="0.8" />
    </g>
  </svg>
);

const WaterBottle = () => (
  <svg
    width="50"
    height="96"
    viewBox="0 0 38 74"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.65)) drop-shadow(0 8px 16px rgba(2,132,199,0.35))",
    }}
  >
    <defs>
      {/* 3D Clear PET Plastic Bottle Shell */}
      <linearGradient id="petShellGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.55" />
        <stop offset="12%" stopColor="#BAE6FD" stopOpacity="0.4" />
        <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#E0F2FE" stopOpacity="0.25" />
        <stop offset="68%" stopColor="#38BDF8" stopOpacity="0.2" />
        <stop offset="86%" stopColor="#7DD3FC" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.75" />
      </linearGradient>

      {/* Pure Sparkling Water Fill */}
      <linearGradient id="liquidGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0284C7" stopOpacity="0.65" />
        <stop offset="18%" stopColor="#38BDF8" stopOpacity="0.5" />
        <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.35" />
        <stop offset="80%" stopColor="#38BDF8" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#0369A1" stopOpacity="0.75" />
      </linearGradient>

      {/* Vibrant High-Visibility Mineral Water Label */}
      <linearGradient id="vibrantLabelGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0369A1" />
        <stop offset="18%" stopColor="#0284C7" />
        <stop offset="40%" stopColor="#0EA5E9" />
        <stop offset="50%" stopColor="#38BDF8" />
        <stop offset="60%" stopColor="#0EA5E9" />
        <stop offset="82%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>

      {/* Foil Accent Borders */}
      <linearGradient id="silverFoilGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="20%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#CBD5E1" />
        <stop offset="80%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* 3D Cyan Screw Cap */}
      <linearGradient id="screwCapGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0369A1" />
        <stop offset="22%" stopColor="#0284C7" />
        <stop offset="48%" stopColor="#38BDF8" />
        <stop offset="76%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>
    </defs>

    {/* Ambient Drop Shadow */}
    <ellipse cx="19" cy="71" rx="12" ry="2.2" fill="#000000" opacity="0.55" />

    {/* Molded Base (Reinforced Petaloid Feet) */}
    <path d="M 8.8 64 L 10 68.2 Q 19 71 28 68.2 L 29.2 64 Z" fill="#0284C7" opacity="0.6" stroke="#38BDF8" strokeWidth="0.5" />
    <ellipse cx="19" cy="67.8" rx="8.5" ry="1.8" fill="#075985" opacity="0.7" />
    <ellipse cx="19" cy="67.4" rx="5" ry="1.0" fill="#E0F2FE" opacity="0.8" />

    {/* Liquid Water Body (Filled to shoulder, 85%) */}
    <path d="M 7.8 25.5 Q 19 28 30.2 25.5 L 29.2 64 Q 19 67 8.8 64 Z" fill="url(#liquidGrad)" />

    {/* Curved Meniscus Line (Water Surface) */}
    <ellipse cx="19" cy="25.5" rx="11.2" ry="2.2" fill="#7DD3FC" opacity="0.5" />
    <ellipse cx="19" cy="25.3" rx="9.5" ry="1.5" fill="#E0F2FE" opacity="0.85" />
    <path d="M 7.8 25.5 Q 19 28 30.2 25.5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.95" />

    {/* Crystal Clear PET Outer Bottle Silhouette (Slender & Ergonomic) */}
    <path d="M 14.5 16.5 L 8.5 25.5 C 7.2 27.5, 7.2 29.5, 7.8 34 C 8.2 38, 7.6 42, 7.6 47 L 8.5 64 Q 19 67.5 29.5 64 L 30.4 47 C 30.4 42, 29.8 38, 30.2 34 C 30.8 29.5, 30.8 27.5, 29.5 25.5 L 23.5 16.5 Q 19 17.8 14.5 16.5 Z" fill="url(#petShellGrad)" stroke="#7DD3FC" strokeWidth="0.65" />

    {/* Molded Grip Reinforcement Ribs */}
    <path d="M 7.8 30 Q 19 32.5 30.2 30" fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.75" />
    <path d="M 7.8 33.8 Q 19 36.3 30.2 33.8" fill="none" stroke="#FFFFFF" strokeWidth="0.55" opacity="0.6" />
    <path d="M 7.8 53.5 Q 19 56 30.2 53.5" fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.65" />
    <path d="M 8.2 57.5 Q 19 60 29.8 57.5" fill="none" stroke="#FFFFFF" strokeWidth="0.55" opacity="0.55" />

    {/* ── VIBRANT WRAPAROUND MINERAL WATER LABEL ── */}
    {/* Label Cast Shadow */}
    <path d="M 7.2 51.2 Q 19 53.8 30.8 51.2 L 30.8 52.4 Q 19 55 7.2 52.4 Z" fill="#000000" opacity="0.45" />

    {/* Label Main Background (Deep Aquatic Glacier Blue) */}
    <path d="M 7.2 36 L 7.5 50.8 Q 19 53.5 30.5 50.8 L 30.8 36 Q 19 38.8 7.2 36 Z" fill="url(#vibrantLabelGrad)" stroke="#38BDF8" strokeWidth="0.5" />

    {/* Silver Metallic Border Pinstripes */}
    <path d="M 7.2 36.8 Q 19 39.6 30.8 36.8" fill="none" stroke="url(#silverFoilGrad)" strokeWidth="0.75" />
    <path d="M 7.5 50 Q 19 52.7 30.5 50" fill="none" stroke="url(#silverFoilGrad)" strokeWidth="0.75" />

    {/* Minimalist Alpine Mountain Emblem */}
    <g transform="translate(19, 39.8)">
      <polygon points="-4.8,2.8 -2.2,-1.2 -0.4,2.8" fill="#38BDF8" opacity="0.85" />
      <polygon points="-2.6,2.8 0,-2.8 2.6,2.8" fill="#FFFFFF" />
      <polygon points="-1,0.5 0,-2.8 1,0.5" fill="#BAE6FD" />
      <polygon points="0.4,2.8 2.2,-0.8 4.8,2.8" fill="#7DD3FC" opacity="0.85" />
    </g>

    {/* Crisp "AQUA" Wordmark with 3D Shadow */}
    <text x="19" y="46.0" textAnchor="middle" fill="#082F49" fontSize="5.2" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontWeight="900" letterSpacing="1.4">AQUA</text>
    <text x="19" y="45.4" textAnchor="middle" fill="#FFFFFF" fontSize="5.2" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontWeight="900" letterSpacing="1.4">AQUA</text>

    {/* Subtext: "MINERAL WATER" */}
    <text x="19" y="48.8" textAnchor="middle" fill="#BAE6FD" fontSize="1.5" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif" fontWeight="800" letterSpacing="0.8">MINERAL WATER</text>

    {/* Specular Gloss Reflection Sheens (Glossy Plastic Highlights) */}
    {/* Left High-Gloss Vertical Stripe */}
    <path d="M 9.5 25.5 L 10.3 64 Q 11.5 64.4 12 64 L 11.2 25.5 Z" fill="#FFFFFF" opacity="0.8" />
    <path d="M 10.3 26 L 10.9 63.5 Q 11.3 63.7 11.7 63.5 L 11 26 Z" fill="#FFFFFF" opacity="0.95" />

    {/* Shoulder Curved Flare Highlight */}
    <path d="M 14.5 18 Q 19 19.5 23.5 18 L 22.8 18.8 Q 19 20.2 15.2 18.8 Z" fill="#FFFFFF" opacity="0.75" />

    {/* Right Soft Rim Highlight */}
    <path d="M 28.5 25.5 L 28 64 Q 28.6 64.2 29 64 L 29.5 25.5 Z" fill="#FFFFFF" opacity="0.35" />

    {/* Sparkling Micro Air Bubbles in Water */}
    <circle cx="14" cy="57" r="0.65" fill="#FFFFFF" opacity="0.9" />
    <circle cx="24" cy="40" r="0.55" fill="#FFFFFF" opacity="0.85" />
    <circle cx="15.5" cy="32" r="0.45" fill="#FFFFFF" opacity="0.8" />
    <circle cx="22" cy="60" r="0.55" fill="#FFFFFF" opacity="0.85" />

    {/* Cold Condensation Droplets on Bottle Surface */}
    <ellipse cx="9" cy="27" rx="0.5" ry="0.9" fill="#FFFFFF" opacity="0.95" />
    <circle cx="9" cy="35" r="0.5" fill="#FFFFFF" opacity="0.9" />
    <circle cx="28.5" cy="55" r="0.6" fill="#FFFFFF" opacity="0.9" />

    {/* Transparent Threaded Neck */}
    <rect x="15" y="11" width="8" height="5.5" fill="url(#petShellGrad)" stroke="#7DD3FC" strokeWidth="0.5" />
    <line x1="15.5" y1="12.4" x2="22.5" y2="13.1" stroke="#FFFFFF" strokeWidth="0.45" opacity="0.9" />
    <line x1="15.5" y1="14.2" x2="22.5" y2="14.9" stroke="#FFFFFF" strokeWidth="0.45" opacity="0.9" />

    {/* Bottle Collar Ring (Support Ledge) */}
    <rect x="14" y="15.5" width="10" height="1.5" rx="0.4" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="0.45" />
    <ellipse cx="19" cy="15.9" rx="4.5" ry="0.4" fill="#FFFFFF" opacity="0.9" />

    {/* Tamper-Evident Security Break-Ring */}
    <rect x="14.5" y="10.2" width="9" height="1.4" rx="0.4" fill="url(#screwCapGrad)" stroke="#0369A1" strokeWidth="0.4" />
    <line x1="15" y1="10.8" x2="23" y2="10.8" stroke="#082F49" strokeWidth="0.3" strokeDasharray="1 1" />

    {/* 3D Cyan Screw Cap Body */}
    <rect x="14" y="4.2" width="10" height="6.2" rx="1.5" fill="url(#screwCapGrad)" stroke="#0369A1" strokeWidth="0.5" />

    {/* Crisp Vertical Grip Knurls on Cap */}
    <line x1="15.5" y1="4.8" x2="15.5" y2="10.0" stroke="#FFFFFF" strokeWidth="0.45" opacity="0.55" />
    <line x1="17" y1="4.8" x2="17" y2="10.0" stroke="#FFFFFF" strokeWidth="0.65" opacity="0.8" />
    <line x1="18.5" y1="4.8" x2="18.5" y2="10.0" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.95" />
    <line x1="20" y1="4.8" x2="20" y2="10.0" stroke="#FFFFFF" strokeWidth="0.65" opacity="0.75" />
    <line x1="21.5" y1="4.8" x2="21.5" y2="10.0" stroke="#082F49" strokeWidth="0.45" opacity="0.65" />
    <line x1="22.5" y1="4.8" x2="22.5" y2="10.0" stroke="#082F49" strokeWidth="0.45" opacity="0.75" />

    {/* Cap Top Crown & Beveled Rim */}
    <ellipse cx="19" cy="4.6" rx="5" ry="1.2" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.3" />
    <ellipse cx="19" cy="4.4" rx="4" ry="0.9" fill="#BAE6FD" opacity="0.95" />
  </svg>
);

const CoffeeCup = () => (
  <svg width="68" height="82" viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.55)) drop-shadow(0 8px 10px rgba(0,0,0,0.3))" }}>
    <defs>
      {/* 3D Cylindrical Lighting: Rim Light, Core Highlight, Diffuse, Ambient Shadow */}
      <linearGradient id="cup3D" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="12%" stopColor="#F1F5F9" />
        <stop offset="35%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#E2E8F0" />
        <stop offset="90%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>

      {/* 3D Emerald Sleeve with cylindrical curve shading */}
      <linearGradient id="sleeve3D" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#022C22" />
        <stop offset="12%" stopColor="#065F46" />
        <stop offset="35%" stopColor="#10B981" />
        <stop offset="65%" stopColor="#059669" />
        <stop offset="88%" stopColor="#047857" />
        <stop offset="100%" stopColor="#022C22" />
      </linearGradient>

      {/* 3D Lid Rim & Bevel Gradient */}
      <linearGradient id="lidRim3D" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>

      <linearGradient id="lidTop3D" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="30%" stopColor="#334155" />
        <stop offset="70%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>

      {/* Steam Gradient */}
      <linearGradient id="steamFade" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#FEF3C7" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      {/* Badge Depth Gradient */}
      <radialGradient id="badgeGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#065F46" />
        <stop offset="70%" stopColor="#022C22" />
        <stop offset="100%" stopColor="#011612" />
      </radialGradient>
    </defs>

    {/* 3D Rising Steam Wisps */}
    <path d="M 23 15 C 20 10, 25 5, 22 0" fill="none" stroke="url(#steamFade)" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 30 14 C 34 8, 28 4, 31 -2" fill="none" stroke="url(#steamFade)" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M 37 16 C 41 11, 36 6, 38 1" fill="none" stroke="url(#steamFade)" strokeWidth="1.8" strokeLinecap="round" />

    {/* 3D Cup Base Shadow Cast */}
    <ellipse cx="30" cy="65.5" rx="13" ry="2.8" fill="#000000" opacity="0.35" />

    {/* 3D Cup Main Body (Cylindrical Paper Cup) */}
    <path d="M 12 21 L 17 63.5 Q 30 67 43 63.5 L 48 21 Q 30 24.5 12 21 Z" fill="url(#cup3D)" />
    
    {/* Base Rounding Curve */}
    <ellipse cx="30" cy="63.5" rx="13" ry="2.5" fill="#94A3B8" opacity="0.5" />

    {/* Left Specular Light Sheen (Vertical Cylindrical Reflection) */}
    <path d="M 15 22.5 L 19 62.5 Q 22 63 24 62.5 L 20 22.5 Q 17.5 22.3 15 22.5 Z" fill="#FFFFFF" opacity="0.65" />
    <path d="M 17 23 L 19.5 61.5 Q 20.8 62 22 61.5 L 19.5 23 Z" fill="#FFFFFF" opacity="0.85" />

    {/* Shadow cast by the sleeve onto the lower cup (True 3D Physical Separation) */}
    <path d="M 15.5 53.5 Q 30 57.5 44.5 53.5 L 44.7 55.5 Q 30 59.5 15.3 55.5 Z" fill="#0F172A" opacity="0.35" />

    {/* 3D Emerald Coffee Sleeve */}
    <path d="M 13.5 32 L 15.8 53 Q 30 57 44.2 53 L 46.5 32 Q 30 35.5 13.5 32 Z" fill="url(#sleeve3D)" />
    
    {/* Sleeve 3D Beveled Edges */}
    <path d="M 13.5 32 Q 30 35.5 46.5 32" fill="none" stroke="#6EE7B7" strokeWidth="0.9" opacity="0.85" />
    <path d="M 15.8 53 Q 30 57 44.2 53" fill="none" stroke="#022C22" strokeWidth="1.2" opacity="0.9" />
    
    {/* Sleeve Corrugated Texture Ribs */}
    <path d="M 14.3 39 Q 30 42.5 45.7 39" fill="none" stroke="#047857" strokeWidth="0.6" opacity="0.45" />
    <path d="M 15.1 46 Q 30 49.5 44.9 46" fill="none" stroke="#047857" strokeWidth="0.6" opacity="0.45" />

    {/* 3D Center Emblem Badge */}
    <circle cx="30" cy="43.5" r="9" fill="url(#badgeGrad)" stroke="#34D399" strokeWidth="1.2" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
    <circle cx="30" cy="43.5" r="7.4" fill="none" stroke="#A7F3D0" strokeWidth="0.6" strokeDasharray="1.5 1" opacity="0.85" />
    
    {/* Mini Coffee Bean Icon on top of emblem */}
    <g transform="translate(27.5, 36.8) scale(0.24)">
      <path d="M 10 2 C 5 2, 1 6, 1 12 C 1 18, 6 22, 12 22 C 18 22, 22 17, 22 11 C 22 5, 17 2, 10 2 Z" fill="#FBBF24" />
      <path d="M 4 12 Q 11 11 11 4 Q 11 11 19 12 Q 11 13 11 20 Q 11 13 4 12 Z" fill="#78350F" />
    </g>

    {/* BOLD "COFFEE" Text (High Contrast & 3D Depth) */}
    <text x="30" y="47.2" textAnchor="middle" fill="#011612" fontSize="5.2" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontWeight="900" letterSpacing="0.8">COFFEE</text>
    <text x="30" y="46.5" textAnchor="middle" fill="#FFFFFF" fontSize="5.2" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontWeight="900" letterSpacing="0.8">COFFEE</text>

    {/* 3D Takeaway Snap Lid */}
    {/* 1. Undercut Lip */}
    <ellipse cx="30" cy="21.5" rx="19.5" ry="5.2" fill="#090D16" />

    {/* 2. Main Overhanging Lid Rim */}
    <ellipse cx="30" cy="20.5" rx="19.5" ry="5.2" fill="url(#lidRim3D)" />
    
    {/* 3. Rim Specular Highlight (Crisp 3D plastic shine) */}
    <path d="M 11.5 20.2 Q 30 23.8 48.5 20.2" fill="none" stroke="#94A3B8" strokeWidth="1.1" opacity="0.75" />
    
    {/* 4. Recessed Inner Ring / Basin */}
    <ellipse cx="30" cy="18" rx="16.5" ry="4.2" fill="#0F172A" />
    <ellipse cx="30" cy="17" rx="15.5" ry="3.8" fill="url(#lidTop3D)" />

    {/* 5. Elevated 3D Drinking Spout (Mouthpiece) */}
    <path d="M 23 15 C 23 13, 37 13, 37 15 L 36 17 C 36 18.5, 24 18.5, 24 17 Z" fill="#334155" stroke="#475569" strokeWidth="0.5" />
    <ellipse cx="30" cy="14.8" rx="3.5" ry="1.2" fill="#020617" />
    <ellipse cx="30" cy="14.5" rx="3" ry="0.8" fill="#000000" />
    <path d="M 25 15.5 Q 30 16.5 35 15.5" fill="none" stroke="#94A3B8" strokeWidth="0.7" opacity="0.8" />
  </svg>
);

const _JuiceBox = () => (
  <svg width="56" height="68" viewBox="0 0 48 58" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <rect x="4" y="10" width="40" height="44" fill="url(#juiceGrad)" rx="4" stroke="#D97706" strokeWidth="1.5"/>
    <rect x="4" y="10" width="40" height="8" fill="#F59E0B" rx="4"/>
    <rect x="4" y="15" width="40" height="3" fill="#D97706" opacity="0.6"/>
    <rect x="8" y="24" width="32" height="22" fill="#7C2D12" rx="3" opacity="0.95"/>
    <circle cx="24" cy="32" r="7" fill="#F59E0B"/>
    <path d="M 24 26 L 26 22" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round"/>
    <text x="24" y="43.5" textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">JUICE</text>
    <rect x="30" y="2" width="5" height="16" fill="#FFF" rx="2.5" stroke="#FDE68A" strokeWidth="1"/>
    <rect x="6" y="12" width="5" height="40" fill="white" opacity="0.4" rx="2.5"/>
    <defs>
      <linearGradient id="juiceGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FCD34D"/>
        <stop offset="100%" stopColor="#F59E0B"/>
      </linearGradient>
    </defs>
  </svg>
);

const NoodleCup = () => (
  <svg width="62" height="70" viewBox="0 0 54 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 15px 20px rgba(0,0,0,0.4))" }}>
    <path d="M 6 18 L 10 56 Q 10 58 27 58 Q 44 58 44 56 L 48 18 Z" fill="url(#noodleGrad)"/>
    <path d="M 7 20 L 11 55 Q 11 57 27 57 Q 43 57 43 55 L 47 20 Z" fill="#FFF" stroke="#E2E8F0" strokeWidth="1"/>
    <ellipse cx="27" cy="18" rx="22" ry="7" fill="#EF4444"/>
    <ellipse cx="27" cy="16" rx="18" ry="5" fill="#DC2626"/>
    <path d="M 23 13 Q 25 8 23 3"  fill="none" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    <path d="M 31 14 Q 33 9 31 4"  fill="none" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    <rect x="11" y="26" width="32" height="20" fill="#EF4444" rx="3"/>
    <text x="27" y="35" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">RAMEN</text>
    <text x="27" y="44" textAnchor="middle" fill="#FEF2F2" fontSize="6" fontFamily="sans-serif" fontWeight="700">HOT & SPICY</text>
    <path d="M 16 16 Q 22 12 28 16 Q 34 12 40 16" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.9"/>
    <path d="M 18 14 Q 24 10 30 14" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.7"/>
    <rect x="9" y="22" width="5" height="34" fill="white" opacity="0.5" rx="2.5"/>
    <defs>
      <linearGradient id="noodleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FECACA"/>
        <stop offset="100%" stopColor="#F87171"/>
      </linearGradient>
    </defs>
  </svg>
);

// ─── Floating Item definitions ────────────────────────────────────────────────

interface FloatItem {
  id: string;
  component: React.ReactNode;
  style: React.CSSProperties;
  floatY: number[];
  floatDuration: number;
  floatDelay: number;
  rotate: number;
  rotateRange: number;
  mobileHidden?: boolean;
}

const ITEMS: FloatItem[] = [
  // ── Left Side (3 items: Top, Middle, Bottom) ──
  {
    id: "snack",
    component: <SnackPacket />,
    style: { top: "14%", left: "4.5%" },
    floatY: [0, -18, 0],
    floatDuration: 5.2,
    floatDelay: 0,
    rotate: -12,
    rotateRange: 6,
  },
  {
    id: "choco",
    component: <ChocolateBar />,
    style: { top: "45%", left: "2.5%" },
    floatY: [0, -16, 0],
    floatDuration: 6.0,
    floatDelay: 0.8,
    rotate: -18,
    rotateRange: 5,
    mobileHidden: true,
  },
  {
    id: "water",
    component: <WaterBottle />,
    style: { top: "75%", left: "4%" },
    floatY: [0, -18, 0],
    floatDuration: 6.5,
    floatDelay: 0.6,
    rotate: -10,
    rotateRange: 5,
    mobileHidden: true,
  },

  // ── Right Side (3 items: Top, Middle, Bottom) ──
  {
    id: "can",
    component: <SodaCan />,
    style: { top: "14%", right: "5%" },
    floatY: [0, -20, 0],
    floatDuration: 4.8,
    floatDelay: 0.4,
    rotate: 14,
    rotateRange: 7,
  },
  {
    id: "coffee",
    component: <CoffeeCup />,
    style: { top: "45%", right: "3%" },
    floatY: [0, -16, 0],
    floatDuration: 5.6,
    floatDelay: 1.2,
    rotate: 8,
    rotateRange: 5,
    mobileHidden: true,
  },
  {
    id: "noodles",
    component: <NoodleCup />,
    style: { top: "75%", right: "4.5%" },
    floatY: [0, -16, 0],
    floatDuration: 6.8,
    floatDelay: 1.8,
    rotate: -6,
    rotateRange: 4,
    mobileHidden: true,
  },
];


// ─── Component ────────────────────────────────────────────────────────────────

export function FloatingObjects() {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
      {ITEMS.map((item) => (
        <motion.div
          key={item.id}
          className={item.mobileHidden ? "hidden md:block" : "block"}
          style={{
            position: "absolute",
            ...item.style,
            rotate: item.rotate,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: item.floatY,
            rotate: [
              item.rotate,
              item.rotate + item.rotateRange,
              item.rotate - item.rotateRange,
              item.rotate,
            ],
          }}
          transition={{
            opacity: { duration: 1.5, delay: item.floatDelay, ease: "easeOut" },
            scale:   { duration: 1.5, delay: item.floatDelay, type: "spring", bounce: 0.4 },
            y: {
              duration: item.floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.floatDelay,
            },
            rotate: {
              duration: item.floatDuration * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.floatDelay,
            },
          }}
        >
          {item.component}
        </motion.div>
      ))}
    </div>
  );
}
