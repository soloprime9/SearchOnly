"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { playTap, playPop } from "@/utils/soundEffects";

/**
 * 🛡️ Root Error Boundary for FondPeace
 * Gracefully catches any unhandled runtime or network exceptions
 * preventing white screen crashes and enabling 1-click recovery.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log exception to console / telemetry
    console.error("[FondPeace Root Error Boundary Caught]:", error);
  }, [error]);

  const handleRetry = () => {
    try {
      playTap();
    } catch (_) {}
    if (typeof reset === "function") {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <div className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Warning Icon with Ambient Glow */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
          <AlertTriangle size={32} className="animate-pulse" />
        </div>

        {/* Informative Header */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            We ran into an unexpected issue rendering this page. Your account and content are completely safe.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-zinc-500 bg-[var(--bg-subtle)] py-1 px-2.5 rounded-lg inline-block">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            onClick={() => {
              try {
                playPop();
              } catch (_) {}
            }}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer"
          >
            <Home size={15} />
            <span>Home Feed</span>
          </Link>
        </div>

        {/* Footer Support Notice */}
        <div className="border-t border-[var(--border-subtle)] pt-4 text-[11px] text-[var(--text-secondary)] flex items-center justify-center gap-4">
          <Link href="/aboutus" className="hover:text-blue-500 transition-colors">
            About FondPeace
          </Link>
          <span>•</span>
          <Link href="/contactus" className="hover:text-blue-500 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
