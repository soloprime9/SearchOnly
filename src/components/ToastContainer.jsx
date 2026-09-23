"use client";

import { useState, useEffect } from "react";
import { toast } from "@/utils/toast";
import { CheckCircle2, AlertCircle, Info, Heart, X } from "lucide-react";
import { playChime, playPop } from "@/utils/soundEffects";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 visible

      if (newToast.type === "love") {
        playPop();
      } else if (newToast.type === "success") {
        playChime();
      }

      // Auto dismiss after 3.2s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3200);
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-sm">
      {toasts.map((t) => {
        return (
          <div
            key={t.id}
            className="pointer-events-auto w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-slate-800 shadow-xl text-xs font-semibold text-gray-800 dark:text-gray-100 animate-slideDown"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              {t.type === "love" && (
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500 shrink-0 animate-bounce" />
              )}
              {t.type === "info" && (
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
              )}
              <span className="truncate">{t.message}</span>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
