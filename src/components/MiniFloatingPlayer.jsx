"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, X, Maximize2, Move } from "lucide-react";
import { playTap, playPop } from "@/utils/soundEffects";

export default function MiniFloatingPlayer({
  post,
  videoSrc,
  currentTime = 0,
  isMuted = true,
  onToggleMute,
  onClose,
  onScrollToPost,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
      videoRef.current.muted = isMuted;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [videoSrc]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = (e) => {
    e.stopPropagation();
    playTap();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  if (!post || !videoSrc) return null;

  const authorName = post?.userId?.username || "Creator";

  return (
    <div className="fixed bottom-5 right-5 z-40 w-64 sm:w-72 bg-zinc-950/95 text-white rounded-2xl shadow-2xl border border-white/15 overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 group">
      {/* Video Box */}
      <div className="relative aspect-[9/16] max-h-56 sm:max-h-64 w-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => {
          playPop();
          if (onScrollToPost) onScrollToPost(post._id);
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/90 truncate max-w-[140px] drop-shadow">
              @{authorName}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTap();
                  if (onScrollToPost) onScrollToPost(post._id);
                }}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Return to post"
              >
                <Maximize2 size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playPop();
                  if (onClose) onClose();
                }}
                className="p-1 rounded-full bg-white/20 hover:bg-red-500/80 text-white transition-colors"
                title="Close floating player"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Center Play/Pause Trigger */}
          <div className="flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-transform active:scale-90"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            </button>
          </div>

          {/* Bottom Audio & Hint */}
          <div className="flex items-center justify-between text-[10px] text-white/80">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playTap();
                if (onToggleMute) onToggleMute();
              }}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1 font-semibold"
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} className="text-emerald-400" />}
              <span>{isMuted ? "Muted" : "Audio"}</span>
            </button>
            <span className="text-[9px] text-white/60 font-medium">Click to return</span>
          </div>
        </div>

        {/* Progress line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
