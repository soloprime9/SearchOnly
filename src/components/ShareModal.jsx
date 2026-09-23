"use client";

import { useState } from "react";
import { X, Copy, Check, QrCode, Share2 } from "react-icons/fa";
import { playChime, playTap } from "@/utils/soundEffects";

export default function ShareModal({ isOpen, onClose, url, title = "Check out this on FondPeace" }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "https://www.fondpeace.com");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      playChime();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
        playChime();
        onClose();
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  const sharePlatforms = [
    {
      name: "WhatsApp",
      color: "bg-[#25D366] text-white hover:bg-[#20bd5a]",
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Twitter / X",
      color: "bg-black text-white hover:bg-gray-800",
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "Telegram",
      color: "bg-[#0088cc] text-white hover:bg-[#0077b5]",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      color: "bg-[#0A66C2] text-white hover:bg-[#095196]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Reddit",
      color: "bg-[#FF4500] text-white hover:bg-[#e03d00]",
      url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Share with Friends</h3>
              <p className="text-xs text-gray-400">FondPeace One-Tap Share</p>
            </div>
          </div>
          <button
            onClick={() => {
              playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* QR Code Toggle Section */}
        {showQR ? (
          <div className="py-6 flex flex-col items-center text-center animate-fadeIn">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-200 mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedUrl}`}
                alt="QR Code"
                className="w-44 h-44 rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 font-medium mb-3">
              Scan with your phone camera to open on mobile
            </p>
            <button
              onClick={() => {
                playTap();
                setShowQR(false);
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              ← Back to Social Share
            </button>
          </div>
        ) : (
          <div className="py-5 space-y-4">
            {/* Quick Share Platforms */}
            <div className="grid grid-cols-3 gap-2.5">
              {sharePlatforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playChime()}
                  className={`flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold shadow-sm transition-transform active:scale-95 ${platform.color}`}
                >
                  {platform.name}
                </a>
              ))}
              <button
                onClick={() => {
                  playTap();
                  setShowQR(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" /> QR Code
              </button>
            </div>

            {/* Native Mobile Share Button */}
            <button
              onClick={handleNativeShare}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" /> Share via Mobile Sheet / Apps
            </button>

            {/* Copy Link Input Bar */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-transparent focus:outline-none truncate font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
