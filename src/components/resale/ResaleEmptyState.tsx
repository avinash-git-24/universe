"use client";

import { memo } from "react";
import Link from "next/link";
import {
  Tag,
  ShoppingBag,
  Plus,
  Camera,
  MessageSquare,
  Bike,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const POPULAR_CAMPUS_TAGS = [
  { label: "Engineering Books", icon: "📚" },
  { label: "Electric Kettle", icon: "☕" },
  { label: "Bicycle", icon: "🚲" },
  { label: "Drafter & Sheet Holder", icon: "📐" },
  { label: "Lab Coat & Kit", icon: "🔬" },
  { label: "Scientific Calculator", icon: "🧮" },
  { label: "Study Table Lamp", icon: "💡" },
  { label: "Hostel Mattress", icon: "🛏️" },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Snap & List in 30s",
    desc: "Take quick photos of your textbook, gadget, or hostel item. Set your campus price.",
    icon: Camera,
    color: "from-blue-500/20 to-teal-400/20 text-blue-400 border-blue-500/30",
  },
  {
    step: "02",
    title: "Chat with Peers",
    desc: "Interested students message you directly. Negotiate or accept offers safely in chat.",
    icon: MessageSquare,
    color: "from-emerald-500/20 to-teal-400/20 text-emerald-400 border-emerald-500/30",
  },
  {
    step: "03",
    title: "Hostel Pickup or Runner",
    desc: "Meet at the hostel gate or request a verified UniVerse runner to deliver it.",
    icon: Bike,
    color: "from-purple-500/20 to-pink-400/20 text-purple-400 border-purple-500/30",
  },
];

interface ResaleEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onSelectTag?: (tag: string) => void;
}

export const ResaleEmptyState = memo(function ResaleEmptyState({
  isFiltered = false,
  onClearFilters,
  onSelectTag,
}: ResaleEmptyStateProps) {
  if (isFiltered) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-emerald-500/20 rounded-3xl bg-[#0c1410]/50 backdrop-blur-md"
        role="status"
        aria-label="No listings found"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
          <Tag className="w-7 h-7" />
        </div>

        <h3 className="text-white text-lg font-bold mb-2">No listings match your filters</h3>
        <p className="text-white/50 text-sm max-w-sm mb-6 leading-relaxed">
          Try adjusting your search query, changing the category, or expanding your price range.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm font-semibold hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          )}
          <Link href="/dashboard/marketplace/sell">
            <button className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all cursor-pointer">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Sell an Item</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6" role="status" aria-label="No listings yet">
      {/* ── Hero Empty State Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0c1611] via-[#09110d] to-[#070c09] border border-emerald-500/20 p-8 sm:p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Campus Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Marwadi University Campus Marketplace</span>
        </div>

        {/* Big Pulsing Icon */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight mb-3">
          No listings yet
        </h2>
        <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8">
          Be the first student to list your used textbooks, lab coats, calculators, or hostel gear.
          Your campus peers are actively browsing!
        </p>

        <Link href="/dashboard/marketplace/sell">
          <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-black font-extrabold text-sm sm:text-base rounded-2xl shadow-[0_0_28px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>List an Item for Sale</span>
          </button>
        </Link>
      </div>

      {/* ── Trending Student Search Tags ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <TrendingUp className="w-4 h-4" />
          <span>Popular On Campus · What Students Are Looking For</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CAMPUS_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => onSelectTag?.(tag.label)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0c1410]/80 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/35 text-xs text-white/80 hover:text-emerald-300 font-medium transition-all cursor-pointer backdrop-blur-sm shadow-sm"
            >
              <span>{tag.icon}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── How It Works — 3 Simple Steps ── */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <h3 className="text-white text-lg sm:text-xl font-extrabold">How UniVerse Resale Works</h3>
          <p className="text-white/50 text-xs sm:text-sm mt-1">
            Zero fees, safe verified campus peers, hostel-to-hostel delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {HOW_IT_WORKS_STEPS.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.step}
                className="p-5 rounded-2xl bg-[#0c1410]/70 border border-white/10 hover:border-emerald-500/30 transition-all backdrop-blur-md relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${step.color} border flex items-center justify-center shadow-sm`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-black text-white/30 tracking-widest">
                      {step.step}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">{step.title}</h4>
                  <p className="text-white/50 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
