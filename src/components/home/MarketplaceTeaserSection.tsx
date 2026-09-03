"use client";

/**
 * UniVerse — Campus Marketplace Teaser Section
 *
 * Highlights peer-to-peer campus buying and selling for books, drafters,
 * electronics, and hostel essentials with 0% platform fee.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Compass, Laptop, Bed, ArrowRight, ShieldCheck, Tag, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const CATEGORIES = [
  {
    icon: BookOpen,
    title: "Books & Semester Notes",
    desc: "Engineering, Pharmacy & Management text books, Gate guides, and verified toppers notes.",
    tag: "High Demand",
    color: "#10B981",
  },
  {
    icon: Compass,
    title: "Drafters & Engineering Tools",
    desc: "Mini drafters, sheet holders, drawing boards, and lab coats passed down from seniors.",
    tag: "Save ~70%",
    color: "#F59E0B",
  },
  {
    icon: Laptop,
    title: "Electronics & Calculators",
    desc: "Scientific calculators (FX-991EX), adapters, laptop stands, and headphones.",
    tag: "Verified Working",
    color: "#06B6D4",
  },
  {
    icon: Bed,
    title: "Hostel Living Essentials",
    desc: "Electric kettles, study lamps, shoe racks, extension cords, and room heaters.",
    tag: "Instant Handover",
    color: "#8B5CF6",
  },
];

export function MarketplaceTeaserSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background ambient halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4"
        >
          <Sparkles size={13} />
          <span>Campus Resale Marketplace</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-[family-name:var(--font-plus-jakarta-sans)]"
        >
          Buy & Sell Directly With{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Campus Peers.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-white/70 text-sm sm:text-base leading-relaxed font-[family-name:var(--font-inter)]"
        >
          No shipping charges, no delivery wait times. Meet fellow Marwadi University students at
          the Library, Main Canteen, or Hostel gates and pay directly via UPI or Cash with 0% platform fee.
        </motion.p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative p-5 rounded-2xl bg-[#080E0B]/80 border border-emerald-500/15 hover:border-emerald-500/40 backdrop-blur-xl shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-[family-name:var(--font-inter)]">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>View items</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0A120E]/80 to-emerald-950/60 border border-emerald-500/25 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Verified Peer Transactions</h4>
            <p className="text-xs text-white/60 font-mono mt-0.5">
              Strictly restricted to active @marwadiuniversity.ac.in student accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={ROUTES.MARKETPLACE}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Explore Campus Deals</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>

          <Link
            href={ROUTES.MARKETPLACE_SELL}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all"
          >
            <Tag size={13} className="text-emerald-400" />
            <span>Post Ad Free</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
