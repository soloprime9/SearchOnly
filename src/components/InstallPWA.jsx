"use client";
import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 150);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") console.log("Installed");
    closeUI();
  };

  const closeUI = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 600);
  };

  if (!showBanner) return null;

  return (
    <div className={`fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-90'}`}>
      
      {/* The Main Container: Holographic Glass */}
      <div className="relative group max-w-[500px] w-full">
        
        {/* Animated Border Gradient (The "Glow" effect) */}
        <div className="absolute -inset-[1.5px] bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-400 rounded-[2.5rem] blur-[2px] opacity-40 group-hover:opacity-100 group-hover:blur-[4px] transition-all duration-700 animate-pulse"></div>

        <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 pr-4 flex items-center justify-between overflow-hidden shadow-2xl">
          
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -left-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] animate-blob"></div>
            <div className="absolute -bottom-[50%] -right-[10%] w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {/* 3D-Like App Icon */}
            <div className="relative w-16 h-16 m-1">
              <div className="absolute inset-0 bg-blue-600 rounded-[1.8rem] rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-md border border-white/30 rounded-[1.8rem] flex items-center justify-center shadow-inner">
                 <span className="text-2xl font-black text-white italic drop-shadow-md">FP</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase mb-0.5">Experience Ultra</span>
              <h2 className="text-white font-bold text-lg leading-tight tracking-tight">FondPeace AI</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-none">Next-Gen Interface</p>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2 relative z-10">
            <button 
              onClick={closeUI}
              className="px-4 py-2 text-slate-500 hover:text-white text-xs font-bold transition-colors"
            >
              SKIP
            </button>
            
            <button
              onClick={handleInstall}
              className="relative group/btn bg-white px-6 py-3 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-90"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 text-slate-950 group-hover/btn:text-white font-black text-xs tracking-tighter">
                INSTALL NOW
              </span>
            </button>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
