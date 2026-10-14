"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, ArrowDown } from "lucide-react";
import { convertObjectsToCSV, triggerFileDownload, getExportFilename } from "@/lib/utils/export";

interface ExportReportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  className?: string;
}

type ButtonStatus = "idle" | "downloading" | "completed";

export function ExportReportButton({ data, filename, className = "" }: ExportReportButtonProps) {
  const [status, setStatus] = useState<ButtonStatus>("idle");
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleExport = () => {
    if (status !== "idle") return;

    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    setStatus("downloading");
    setProgress(0);

    const startTime = Date.now();
    const duration = 1250; // 1.25s smooth progress animation

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);

        // Execute CSV generation & download trigger
        try {
          const csvContent = convertObjectsToCSV(data);
          const outputFilename = getExportFilename(filename, "csv");
          triggerFileDownload(csvContent, outputFilename, "text/csv");
        } catch (err) {
          console.error("Export failed", err);
          alert("Failed to export data");
          setStatus("idle");
          setProgress(0);
          return;
        }

        // Morph to success checkmark state
        setStatus("completed");

        // Graceful reset to idle state
        resetTimerRef.current = setTimeout(() => {
          setStatus("idle");
          setProgress(0);
        }, 2400);
      }
    }, 20);
  };

  const isInteractive = status === "idle" && data.length > 0;
  const isDisabled = status !== "idle" || !data.length;

  return (
    <>
      <motion.button
        type="button"
        onClick={handleExport}
        disabled={isDisabled}
        whileHover={isInteractive ? { scale: 1.02 } : {}}
        whileTap={isInteractive ? { scale: 0.98 } : {}}
        aria-busy={status === "downloading"}
        aria-label={
          status === "downloading"
            ? `Exporting ${filename} as CSV, ${progress}%`
            : status === "completed"
            ? `${filename} exported successfully`
            : `Export ${filename} as CSV`
        }
        className={`group relative overflow-hidden flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium select-none transition-all duration-300 ${
          status === "completed"
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-default"
            : status === "downloading"
            ? "bg-white/[0.08] border border-white/20 text-white/90 cursor-wait shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md"
            : !data.length
            ? "bg-white/[0.04] border border-white/10 text-white/40 cursor-not-allowed opacity-50 backdrop-blur-md"
            : "bg-white/[0.08] hover:bg-white/[0.13] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-white/15 hover:border-white/25 text-white/90 hover:text-white cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md"
        } ${className}`}
        style={{ minWidth: "116px", minHeight: "34px" }}
      >
        {/* ── Top Subtle Glass Highlight Rim (PixelFlow Signature) ── */}
        <div 
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" 
        />

        {/* ── Animated Progress Bar Fill ── */}
        {status === "downloading" && (
          <motion.div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Export progress for ${filename}`}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/20 via-teal-400/35 to-emerald-400/30"
            style={{ width: `${progress}%` }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.05 }}
          >
            {/* Glowing particle head at the front edge */}
            <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-emerald-300 shadow-[0_0_12px_#34d399,0_0_6px_#10b981]" />
          </motion.div>
        )}

        {/* ── Content (Icon + Label) with Smooth State Morph ── */}
        <div className="relative z-10 flex items-center justify-center gap-1.5">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle-icon"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center"
              >
                <Download className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-transform group-hover:translate-y-0.5 duration-200" />
              </motion.div>
            )}

            {status === "downloading" && (
              <motion.div
                key="downloading-icon"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex items-center"
              >
                <motion.div
                  animate={{ y: [0, 2.5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut" }}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                </motion.div>
              </motion.div>
            )}

            {status === "completed" && (
              <motion.div
                key="completed-icon"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                className="flex items-center"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.span
                key="idle-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium text-white/90 group-hover:text-white"
              >
                Export CSV
              </motion.span>
            )}

            {status === "downloading" && (
              <motion.span
                key="downloading-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="tabular-nums font-mono text-[11px] font-semibold text-emerald-300"
              >
                {progress}%
              </motion.span>
            )}

            {status === "completed" && (
              <motion.span
                key="completed-text"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="font-semibold text-emerald-400"
              >
                Exported!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* ── Screen Reader Live Announcements ── */}
      <span className="sr-only" role="status" aria-live="polite">
        {status === "downloading" && `Exporting ${filename} as CSV, ${progress}%`}
        {status === "completed" && `${filename} exported successfully as CSV`}
      </span>
    </>
  );
}


