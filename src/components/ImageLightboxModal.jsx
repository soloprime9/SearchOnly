"use client";

import React, { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut, Download, Share2 } from "lucide-react";
import { playPop, playTap } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";

export default function ImageLightboxModal({ isOpen, imageUrl, altText, onClose }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = (e) => {
    e.stopPropagation();
    playTap();
    setZoom((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    playTap();
    setZoom((prev) => Math.max(prev - 0.3, 0.7));
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    playPop();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fondpeace-photo-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Photo saved!");
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    playTap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "FondPeace Photo",
          url: imageUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(imageUrl);
      toast.success("Image link copied!");
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Top Floating Control Bar */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-50 bg-white/10 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full shadow-2xl"
      >
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
        >
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <span className="text-white/60 text-xs font-mono px-1">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="w-[1px] h-4 bg-white/20 mx-1" />

        <button
          onClick={handleShare}
          title="Share photo"
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={handleDownload}
          title="Download original"
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="w-[1px] h-4 bg-white/20 mx-1" />

        <button
          onClick={onClose}
          title="Close (Esc)"
          className="p-1.5 text-white hover:text-rose-400 hover:bg-rose-500/20 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Viewport */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={altText || "FondPeace Photo"}
          style={{ transform: `scale(${zoom})`, transition: "transform 0.15s ease-out" }}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl cursor-grab active:cursor-grabbing"
          onDoubleClick={() => setZoom((prev) => (prev > 1.2 ? 1 : 1.8))}
        />
      </div>

      {/* Subtle Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-[11px] pointer-events-none">
        Double-tap image to zoom • Click outside or press Esc to close
      </div>
    </div>
  );
}
