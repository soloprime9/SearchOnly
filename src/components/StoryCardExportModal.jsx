"use client";

import React, { useRef, useState } from "react";
import { X, Download, Share2, Sparkles, Check } from "lucide-react";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";

export default function StoryCardExportModal({ isOpen, post, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${post._id}` : `https://fondpeace.com/post/${post._id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(postUrl)}&color=000000&bgcolor=ffffff`;

  const handleDownloadCard = async () => {
    setDownloading(true);
    playPop();

    try {
      // Use native canvas generation for pixel-perfect card download
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;

      // Draw rich OLED gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#070a13");
      grad.addColorStop(0.5, "#0b1329");
      grad.addColorStop(1, "#070a13");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle glow circle
      const glowGrad = ctx.createRadialGradient(540, 600, 50, 540, 600, 600);
      glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.25)");
      glowGrad.addColorStop(1, "rgba(7, 10, 19, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Card Container (White / Dark Glass)
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(80, 200, 920, 1400, 48);
      ctx.fill();
      ctx.stroke();

      // Top Logo: FondPeace
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px sans-serif";
      ctx.fillText("Fond", 140, 320);
      ctx.fillStyle = "#3b82f6";
      ctx.fillText("Peace", 275, 320);

      // Author Info
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      const author = `@${post.userId?.username || "creator"}`;
      ctx.fillText(author, 140, 420);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "32px sans-serif";
      ctx.fillText(new Date(post.createdAt || Date.now()).toLocaleDateString(), 140, 470);

      // Post Title / Text
      ctx.fillStyle = "#f3f4f6";
      ctx.font = "bold 48px sans-serif";
      const words = (post.title || "Check out this post on FondPeace!").split(" ");
      let line = "";
      let y = 570;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 800 && n > 0) {
          ctx.fillText(line, 140, y);
          line = words[n] + " ";
          y += 64;
          if (y > 780) break; // Don't overflow
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 140, y);

      // Bottom Footer with Branding & QR instructions
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("Scan to join discussion on FondPeace", 140, 1460);

      ctx.fillStyle = "#60a5fa";
      ctx.font = "30px sans-serif";
      ctx.fillText(postUrl.replace(/^https?:\/\//, ""), 140, 1510);

      // Convert to downloadable PNG
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `fondpeace-story-${post._id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      playChime();
      toast.success("Story card downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate card image");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    playTap();
    await navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#0c101c] border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden flex flex-col items-center"
      >
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-white font-bold text-sm">Story Card Export</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live 9:16 Card Preview */}
        <div 
          ref={cardRef}
          className="w-full aspect-[9/14] bg-gradient-to-br from-[#0e1629] via-[#070a13] to-[#121b33] rounded-2xl p-4 border border-white/15 shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          {/* Ambient card glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand & Creator */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-black text-xs tracking-tight">
                Fond<span className="text-blue-500">Peace</span>
              </span>
              <span className="text-[10px] text-blue-400/80 uppercase font-mono tracking-wider font-semibold">
                Community Story
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-sm uppercase shrink-0">
                {post.userId?.username?.[0] || "C"}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-xs truncate">@{post.userId?.username || "creator"}</p>
                <p className="text-gray-400 text-[10px]">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Post Content Snippet */}
          <div className="relative z-10 my-3">
            <p className="text-white font-semibold text-sm leading-snug line-clamp-4">
              "{post.title || "Thoughtful conversation on FondPeace"}"
            </p>
          </div>

          {/* Bottom Callout & QR Code */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-[11px] leading-tight">Join the conversation</p>
              <p className="text-blue-400 text-[10px] font-mono">fondpeace.com</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-md shrink-0">
              <img src={qrUrl} alt="Post QR" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-2.5 mt-4">
          <button
            onClick={handleDownloadCard}
            disabled={downloading}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? "Exporting..." : "Save Image"}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
