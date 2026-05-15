"use client";
import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // stop auto prompt
      setDeferredPrompt(e);
      setShowBanner(true); // show your custom popup
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // show browser install UI

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("User accepted install");
    } else {
      console.log("User dismissed install");
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
      <div className="bg-white shadow-xl border rounded-2xl px-4 py-3 w-[92%] max-w-md flex items-center justify-between">
        
        <div>
          <p className="font-semibold text-sm">Install FondPeace</p>
          <p className="text-xs text-gray-500">
            Get faster access like an app
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowBanner(false)}
            className="text-xs px-3 py-1 rounded-lg bg-gray-100"
          >
            Later
          </button>

          <button
            onClick={handleInstall}
            className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
