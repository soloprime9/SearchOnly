"use client";

import React from "react";
import Link from "next/link";
import { X, Sparkles, Heart, ArrowRight } from "lucide-react";
import { playPop, playTap } from "@/utils/soundEffects";

export default function QuickAuthGateModal({ isOpen, onClose, actionName = "interact" }) {
  if (!isOpen) return null;

  const handleGoogleClick = () => {
    playTap();
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0c101c] border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 text-white text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            playPop();
            onClose();
          }}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mx-auto mb-3">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500/50" />
        </div>

        {/* Heading */}
        <h3 className="font-bold text-lg text-white mb-1.5 leading-tight">
          Join the conversation
        </h3>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          Log in or create an account in 5 seconds to {actionName}, bookmark, and connect with creators.
        </p>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
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
            <span>Continue with Google</span>
          </button>

          <Link
            href="/login"
            onClick={() => {
              playTap();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold text-xs transition-colors"
          >
            <span>Sign in with Username</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-gray-500">
          No account?{" "}
          <Link
            href="/signup"
            onClick={() => {
              playTap();
              onClose();
            }}
            className="text-blue-400 hover:underline font-semibold"
          >
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
