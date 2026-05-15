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
      setTimeout(() => setIsVisible(true), 100);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") closeUI();
  };

  const closeUI = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 500);
  };

  if (!showBanner) return null;

  return (
    <div className={`fixed inset-0 z-[10000] flex items-end md:items-center justify-center transition-all duration-500 ${isVisible ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-transparent pointer-events-none'}`}>
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-[450px] bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.1)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-20 opacity-0'}`}>
        
        {/* Top Handle (Mobile Style) */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

        {/* Close Button */}
        <button 
          onClick={closeUI}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="flex flex-col items-center text-center">
          {/* App Icon (Same as Image) */}
          <div className="w-20 h-20 mb-6 relative">
            <div className="absolute inset-0 bg-blue-500 rounded-2xl rotate-3 opacity-10"></div>
            <div className="relative w-full h-full bg-white border-[1.5px] border-gray-100 shadow-xl rounded-2xl flex items-center justify-center overflow-hidden">
               {/* Replace with your actual logo */}
               <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">
                 F
               </div>
            </div>
          </div>

          <h2 className="text-[1.75rem] font-bold text-gray-900 leading-tight">
            Install FondPeace
          </h2>
          <p className="mt-3 text-gray-500 text-sm md:text-[15px] px-4 leading-relaxed font-medium">
            Add to your home screen for quick access and a native app experience. Free, no app store needed!
          </p>

          {/* Feature Badges (As per image) */}
          <div className="flex items-center gap-6 mt-8 mb-10 text-gray-500 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              <span>One-tap access</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <span>Full screen mode</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-4">
            <button
              onClick={handleInstall}
              className="w-full py-4 bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Install App
            </button>
            <button
              onClick={closeUI}
              className="w-full py-2 text-gray-500 font-bold text-sm hover:text-gray-800 transition-colors uppercase tracking-widest"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}









// "use client";
// import { useEffect, useState } from "react";

// export default function InstallPWA() {
//   const [deferredPrompt, setDeferredPrompt] = useState(null);
//   const [showBanner, setShowBanner] = useState(false);
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const handler = (e) => {
//       e.preventDefault();
//       setDeferredPrompt(e);
//       setShowBanner(true);
//       setTimeout(() => setIsVisible(true), 100);
//     };
//     window.addEventListener("beforeinstallprompt", handler);
//     return () => window.removeEventListener("beforeinstallprompt", handler);
//   }, []);

//   const handleInstall = async () => {
//     if (!deferredPrompt) return;
//     deferredPrompt.prompt();
//     const choice = await deferredPrompt.userChoice;
//     if (choice.outcome === "accepted") closeUI();
//   };

//   const closeUI = () => {
//     setIsVisible(false);
//     setTimeout(() => setShowBanner(false), 500);
//   };

//   if (!showBanner) return null;

//   return (
//     // Overlay for PC dominance
//     <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-700 ${isVisible ? 'bg-slate-950/40 backdrop-blur-md' : 'bg-transparent backdrop-blur-0 pointer-events-none'}`}>
      
//       <div className={`relative w-full max-w-xl bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        
//         {/* Top Accent Line */}
//         <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

//         <div className="p-8 md:p-12">
//           <div className="flex flex-col md:flex-row items-center gap-8">
            
//             {/* App Branding Section */}
//             <div className="relative shrink-0">
//               <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(37,99,235,0.3)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
//                 <span className="text-4xl md:text-5xl font-black text-white italic">FP</span>
//               </div>
//               <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-[#0a0a0c] flex items-center justify-center">
//                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
//               </div>
//             </div>

//             {/* Text Content */}
//             <div className="text-center md:text-left space-y-3">
//               <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">
//                 GET THE <span className="text-blue-500">NATIVE</span> APP
//               </h2>
//               <p className="text-slate-400 text-sm md:text-base font-medium max-w-sm">
//                 Install <span className="text-white font-bold">FondPeace</span> for lightning-fast speeds, offline access, and an immersive full-screen experience.
//               </p>
              
//               <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
//                 <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">0% Ads</span>
//                 <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">Fast Load</span>
//                 <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">Secure</span>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="mt-10 flex flex-col sm:flex-row gap-4">
//             <button
//               onClick={handleInstall}
//               className="flex-1 bg-white text-black font-black py-5 rounded-2xl text-sm tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-300 active:scale-95 shadow-xl"
//             >
//               ADD TO HOME SCREEN
//             </button>
//             <button
//               onClick={closeUI}
//               className="px-8 py-5 text-slate-500 hover:text-white font-bold text-sm transition-colors border border-white/5 hover:border-white/20 rounded-2xl"
//             >
//               DISMISS
//             </button>
//           </div>
//         </div>

//         {/* Subtle Background Glow */}
//         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
//       </div>
//     </div>
//   );
// }
