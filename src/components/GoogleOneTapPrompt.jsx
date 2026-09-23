"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { getApiBase } from "@/utils/apiConfig";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { triggerConfetti } from "@/utils/confetti";
import { toast } from "@/utils/toast";
import { X, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function GoogleOneTapPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(true); // Default true to avoid SSR flicker

  useEffect(() => {
    // 1. Check if user is already logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setHasToken(true);
      return;
    }
    setHasToken(false);

    // 2. Anti-annoyance check: Check if user dismissed prompt recently (24h cooldown)
    const dismissedUntil = localStorage.getItem("fondpeace_onetap_dismissed_until");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 3. Polite entrance delay (2.5 seconds after page loads)
    const timer = setTimeout(() => {
      setVisible(true);
      playTap();
    }, 2500);

    // 4. Initialize Google Identity Services if client ID is configured
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          // Show official Google One Tap prompt on desktop
          window.google.accounts.id.prompt();
        }
      };
      document.body.appendChild(script);
    }

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    playPop();
    setVisible(false);
    // Remember dismissal for 24 hours so user is never annoyed
    localStorage.setItem(
      "fondpeace_onetap_dismissed_until",
      (Date.now() + 24 * 60 * 60 * 1000).toString()
    );
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setLoading(true);

    try {
      const apiBase = getApiBase();
      const res = await axios.post(`${apiBase}/user/google-auth`, {
        credential: response.credential,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        playChime();
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
        toast.success(`Welcome, ${res.data.user?.name || res.data.user?.username || "Creator"}!`);
        setVisible(false);

        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      console.error("Google Auth error:", err);
      toast.error("Failed to sign in with Google. Please try standard sign in.");
    } finally {
      setLoading(false);
    }
  };

  // Demo / direct Google authorization flow
  const handleDirectGoogleClick = () => {
    playTap();
    // If native Google GIS is initialized, trigger it
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Direct redirect to signup/login where Google/credentials can be used
      window.location.href = "/signup";
    }
  };

  if (hasToken || !visible) return null;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          1. DESKTOP CARD (TOP-RIGHT CORNER)
      ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block fixed top-20 right-5 z-[9999] animate-in fade-in slide-in-from-top-6 duration-300 pointer-events-auto">
        <div className="w-[360px] rounded-3xl bg-[#0c101c]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-5 text-white overflow-hidden relative group">
          {/* Subtle Ambient Glow behind card */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Bar: Branding & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-xs">F</span>
              </div>
              <span className="font-extrabold text-sm tracking-tight">
                Fond<span className="text-blue-500">Peace</span>
              </span>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Card Message */}
          <div className="my-3.5">
            <h3 className="text-base font-bold tracking-tight text-white leading-snug flex items-center gap-1.5">
              <span>Join community in 1 click</span>
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Explore trending discussions, vote in polls, and connect with creators.
            </p>
          </div>

          {/* Google Button */}
          <div className="space-y-2.5">
            <button
              onClick={handleDirectGoogleClick}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs transition-all shadow-md active:scale-[0.98] border border-gray-200"
            >
              {/* Google G Multicolor SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            {/* Quick Email or Username Option */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <Link
                href="/login"
                onClick={() => {
                  playTap();
                  setVisible(false);
                }}
                className="hover:text-blue-400 transition-colors"
              >
                Sign in with Username →
              </Link>
              <button
                onClick={handleDismiss}
                className="hover:text-gray-300 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. MOBILE BOTTOM SHEET (ABOVE BOTTOM NAVIGATION)
      ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-20 left-3 right-3 z-[9999] animate-in fade-in slide-in-from-bottom-6 duration-300 pointer-events-auto">
        <div className="rounded-3xl bg-[#0c101c]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-4 text-white relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-[10px]">F</span>
              </div>
              <span className="font-bold text-xs">Join FondPeace in 1-Click</span>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Close"
              className="p-1 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectGoogleClick}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white text-gray-900 font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <Link
              href="/signup"
              onClick={() => {
                playTap();
                setVisible(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold whitespace-nowrap"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
