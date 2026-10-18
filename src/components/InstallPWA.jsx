"use client";
import { useEffect, useState, useRef, useCallback } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const autoHideTimerRef = useRef(null);
  const triggerEvaluatedRef = useRef(false);

  // Check if app is already running in standalone (installed) mode
  const isAppInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      const storedInstalled = localStorage.getItem("fondpeace_pwa_installed") === "true";
      return isStandalone || storedInstalled;
    } catch {
      return false;
    }
  }, []);

  // Check if user dismissed recently (anti-annoyance frequency capping)
  const isDismissedOnCooldown = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      const dismissedUntil = localStorage.getItem("fondpeace_pwa_dismissed_until");
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return true;
      }
    } catch {
      /* ignore storage issue */
    }
    return false;
  }, []);

  const closeBanner = useCallback((markDismissed = true) => {
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    setIsVisible(false);
    setTimeout(() => {
      setShowBanner(false);
      setShowIOSGuide(false);
    }, 400);

    if (markDismissed) {
      try {
        const rawCount = localStorage.getItem("fondpeace_pwa_dismiss_count") || "0";
        const count = parseInt(rawCount, 10) + 1;
        localStorage.setItem("fondpeace_pwa_dismiss_count", count.toString());

        // 1st dismiss = 7 days cooldown. 2nd+ dismiss = 30 days cooldown.
        const cooldownDays = count === 1 ? 7 : 30;
        const nextAllowed = Date.now() + cooldownDays * 24 * 60 * 60 * 1000;
        localStorage.setItem("fondpeace_pwa_dismissed_until", nextAllowed.toString());
      } catch {}
    }
  }, []);

  // Polite display trigger: only when user is genuinely engaged
  const attemptPoliteDisplay = useCallback(() => {
    if (triggerEvaluatedRef.current || isAppInstalled() || isDismissedOnCooldown()) {
      return;
    }

    // Do not interrupt if user is actively watching a playing video
    const activeVideos = Array.from(document.querySelectorAll("video"));
    const isPlayingVideo = activeVideos.some((v) => !v.paused && v.currentTime > 0);
    if (isPlayingVideo) {
      // Re-check after 10s
      setTimeout(attemptPoliteDisplay, 10000);
      return;
    }

    triggerEvaluatedRef.current = true;
    setShowBanner(true);
    setTimeout(() => setIsVisible(true), 80);

    // Auto-hide after 18s if user doesn't interact (never linger)
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    autoHideTimerRef.current = setTimeout(() => {
      closeBanner(false);
    }, 18000);
  }, [isAppInstalled, isDismissedOnCooldown, closeBanner]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register PWA service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Detect standalone / installed
    if (isAppInstalled() || isDismissedOnCooldown()) {
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // 1. Android/Chrome/Edge native install capture
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 2. Listen for appinstalled event
    const handleAppInstalled = () => {
      try {
        localStorage.setItem("fondpeace_pwa_installed", "true");
      } catch {}
      closeBanner(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // 3. Custom event listener for manual triggers (e.g. from Settings / Menu)
    const handleManualTrigger = () => {
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 80);
    };
    window.addEventListener("open-pwa-install", handleManualTrigger);

    // 4. Polite Engagement Triggers:
    // A: Scroll depth trigger (user scrolled > 350px = actively reading feed)
    const handleScroll = () => {
      if (window.scrollY > 350) {
        attemptPoliteDisplay();
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // B: Time on site trigger (at least 25s elapsed)
    const timer = setTimeout(() => {
      attemptPoliteDisplay();
    }, 25000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleManualTrigger);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [isAppInstalled, isDismissedOnCooldown, attemptPoliteDisplay, closeBanner]);

  const handleInstallClick = async () => {
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);

    if (isIOS) {
      // Show polite 2-step iOS instructions inside the card
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback if browser hasn't fired prompt yet
      closeBanner(true);
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      try {
        localStorage.setItem("fondpeace_pwa_installed", "true");
      } catch {}
    }
    setDeferredPrompt(null);
    closeBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Install FondPeace Application"
      className={`
        fixed z-[80] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        /* Mobile: Placed at bottom-20 (above bottom nav bar) with margin */
        bottom-20 left-3 right-3 max-w-[420px] mx-auto
        /* Desktop: Tucked unobtrusively in bottom-right corner */
        lg:bottom-6 lg:right-6 lg:left-auto lg:mx-0 lg:max-w-[390px]
        ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-95 pointer-events-none"}
      `}
    >
      <div className="relative bg-[#0c1222]/95 backdrop-blur-2xl border border-sky-500/25 rounded-2xl p-3.5 shadow-[0_16px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
        
        {/* Subtle top cyan ambient glow */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent pointer-events-none" />

        {/* Close "✕" Button */}
        <button
          onClick={() => closeBanner(true)}
          aria-label="Dismiss banner"
          className="absolute top-2.5 right-2.5 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!showIOSGuide ? (
          /* Normal Native Install Card */
          <div className="flex items-center gap-3 pr-6">
            {/* App Icon */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-600 p-[1.5px] shrink-0 shadow-md shadow-sky-500/20">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img
                  src="/android-chrome-192x192.png"
                  alt="FondPeace"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-white font-black text-sm absolute">FP</span>
              </div>
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-white truncate leading-tight">
                  Install FondPeace
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  App
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-400 truncate mt-0.5 font-medium">
                ⚡ Fast feed • Fullscreen experience
              </p>
            </div>

            {/* Install Button */}
            <button
              onClick={handleInstallClick}
              className="shrink-0 px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-[12px] rounded-xl transition-all active:scale-95 shadow-md shadow-sky-500/25 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install</span>
            </button>
          </div>
        ) : (
          /* iOS 2-Step Helpful Guide (Non-Annoying) */
          <div className="pr-4 py-0.5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">How to install on iPhone/iPad:</span>
            </div>
            <div className="text-[11.5px] text-zinc-300 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>Tap the Safari <strong>Share</strong> button (<strong>⎋</strong>) at bottom.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>Select <strong>Add to Home Screen (➕)</strong>.</span>
              </div>
            </div>
            <div className="pt-1 flex justify-end">
              <button
                onClick={() => closeBanner(false)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
