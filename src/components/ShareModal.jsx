"use client";

import React, { useState } from "react";
import { FaWhatsapp, FaTwitter, FaTelegram, FaTimes } from "react-icons/fa";
import { Copy, Check, Share2, Sparkles, ExternalLink } from "lucide-react";
import { playPop, playTap } from "@/utils/soundEffects";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";
import { toast } from "@/utils/toast";

export default function ShareModal({
  isOpen,
  onClose,
  post,
  customUrl,
  customTitle,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const postId = post._id || post.id;
  const isVideoOrShort =
    post.mediaType === "video" ||
    post.isVideo ||
    Boolean(post.videoUrl) ||
    Boolean(post.shortId);

  const fallbackOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://www.fondpeace.com";

  // Build canonical share URL: if short -> /shorts/{id}, else -> /post/{id}
  const shareUrl =
    customUrl ||
    (isVideoOrShort
      ? `${fallbackOrigin}/shorts/${postId}`
      : `${fallbackOrigin}/post/${postId}`);

  const titleText = customTitle || post.title || "Check out this post on FondPeace";
  const authorName = post.userId?.username || post.userId?.name || "Creator";

  // WhatsApp Preformatted message
  const whatsappText = `🔥 *${titleText}*\n\nWatch/Read on FondPeace by @${authorName}:\n${shareUrl}`;

  // Twitter/X Preformatted message
  const twitterText = `Check out this trending ${isVideoOrShort ? "short" : "discussion"} on @FondPeace:`;

  // 1-Click Copy Handler
  const handleCopy = async () => {
    playPop();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard! 📋");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (_) {
      toast.error("Failed to copy link");
    }
  };

  // 1-Click Native Share for Mobile (Instagram, Snapchat, Facebook, etc.)
  const handleNativeShare = async () => {
    playTap();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: titleText,
          text: `${titleText} — on FondPeace`,
          url: shareUrl,
        });
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[#0c0f18] text-white rounded-t-3xl sm:rounded-3xl border border-white/15 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab bar for mobile swipe feel */}
        <div className="w-12 h-1 bg-white/25 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white tracking-tight">
                Share with Friends
              </h3>
              <p className="text-[11px] text-zinc-400">FondPeace Viral Share</p>
            </div>
          </div>
          <button
            onClick={() => {
              playTap();
              onClose();
            }}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Post Preview Mini Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-5">
          <div className="w-14 h-16 rounded-xl overflow-hidden bg-black shrink-0 relative border border-white/10 shadow-sm">
            <img
              src={resolvePostThumbnail(post)}
              alt={titleText}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/Fondpeace.jpg";
              }}
            />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug">
              {titleText}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 truncate">
              @{authorName} • {isVideoOrShort ? "Short Video" : "Community Post"}
            </p>
          </div>
        </div>

        {/* 1-Click Instant Share Channels Grid */}
        <div className="grid grid-cols-4 gap-2.5 mb-5">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTap()}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-all hover:scale-105 active:scale-95 text-[11px] font-bold group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaWhatsapp size={22} className="text-emerald-400" />
            </div>
            <span>WhatsApp</span>
          </a>

          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTap()}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 transition-all hover:scale-105 active:scale-95 text-[11px] font-bold group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaTwitter size={20} className="text-sky-400" />
            </div>
            <span>Twitter / X</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(titleText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTap()}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 transition-all hover:scale-105 active:scale-95 text-[11px] font-bold group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaTelegram size={20} className="text-cyan-400" />
            </div>
            <span>Telegram</span>
          </a>

          {/* Native System Share / More */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 transition-all hover:scale-105 active:scale-95 text-[11px] font-bold group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ExternalLink size={19} className="text-indigo-400" />
            </div>
            <span>More Apps</span>
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="p-2 pl-3.5 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-between text-xs text-zinc-300 gap-2">
          <span className="truncate text-zinc-400 font-mono select-all text-[11.5px]">
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
