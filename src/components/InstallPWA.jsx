"use client";
import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // For entry animation

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
      // Small delay to trigger the transition after mount
      setTimeout(() => setIsVisible(true), 100);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    
    if (choice.outcome === "accepted") {
      console.log("User accepted install");
    }
    
    setIsVisible(false);
    setTimeout(() => {
      setDeferredPrompt(null);
      setShowBanner(false);
    }, 500); // Wait for exit animation
  };

  const closeBanner = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 500);
  };

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 p-4 md:p-8 flex justify-center z-[9999] transition-all duration-700 ease-out 
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
    >
      <div className="relative group overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20 dark:border-slate-700/50 rounded-[2rem] px-6 py-5 w-full max-w-[440px] flex items-center justify-between gap-4">
        
        {/* Decorative background glow */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-colors" />

        <div className="flex items-center gap-4 relative z-10">
          {/* App Icon Placeholder - Circular & Modern */}
          <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white text-base md:text-lg tracking-tight">
              Install FondPeace
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Native experience, zero lag.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={closeBanner}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-2"
          >
            Later
          </button>

          <button
            onClick={handleInstall}
            className="relative overflow-hidden group/btn px-5 py-3 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white text-xs md:text-sm font-bold shadow-md hover:shadow-blue-500/25 transition-all active:scale-95"
          >
            <span className="relative z-10">GET APP</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

      </div>
    </div>
  );
}
