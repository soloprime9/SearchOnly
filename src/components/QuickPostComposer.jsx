"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { toast } from "@/utils/toast";
import { playPop, playChime } from "@/utils/soundEffects";
import {
  PenLine,
  BarChart2,
  Link as LinkIcon,
  X,
  Plus,
  Trash2,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Layers,
  Video,
} from "lucide-react";

const CATEGORIES = [
  "Entertainment",
  "Technology",
  "Trending News",
  "Cricket",
  "Shorts",
  "TV Shows",
];

const QUICK_TAGS = ["#FondPeace", "#Trending", "#Tech", "#Shorts", "#Cricket", "#Buzz"];

export default function QuickPostComposer({ onPostCreated, currentUserId }) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState("text"); // 'text' | 'poll' | 'link'
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [submitting, setSubmitting] = useState(false);

  // Poll state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDurationHours, setPollDurationHours] = useState(24);

  // Link state
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPreviewData, setLinkPreviewData] = useState(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);

  // Add poll option
  const handleAddOption = () => {
    if (pollOptions.length < 4) {
      playPop();
      setPollOptions([...pollOptions, ""]);
    }
  };

  // Remove poll option
  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      playPop();
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Update option text
  const handleOptionChange = (text, index) => {
    const updated = [...pollOptions];
    updated[index] = text;
    setPollOptions(updated);
  };

  // Auto fetch link preview (Industry standard OpenGraph scraper)
  const handleFetchLinkPreview = async (url) => {
    if (!url || !url.startsWith("http")) return;
    setFetchingPreview(true);
    try {
      const apiBase = getApiBase();
      const res = await axios.get(`${apiBase}/post/preview/link?url=${encodeURIComponent(url)}`);
      if (res.data?.success && res.data?.preview) {
        const preview = res.data.preview;
        setLinkPreviewData(preview);
        // Automatically prefill post title with scraped article/video title if empty
        setTitle((prev) => (!prev.trim() && preview.title ? preview.title : prev));
      }
    } catch {
      // ignore
    } finally {
      setFetchingPreview(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollDurationHours(24);
    setLinkUrl("");
    setLinkPreviewData(null);
    setExpanded(false);
    setMode("text");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const headers = getAuthHeaders();
    if (!headers["x-auth-token"] && !headers["Authorization"]) {
      toast.error("Please log in to create a post");
      return;
    }

    // Validation
    if (mode === "text" && !title.trim()) {
      toast.error("Please write something to post");
      return;
    }

    if (mode === "poll") {
      if (!pollQuestion.trim()) {
        toast.error("Please enter a poll question");
        return;
      }
      const validOptions = pollOptions.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        toast.error("Poll must have at least 2 non-empty options");
        return;
      }
    }

    if (mode === "link" && !linkUrl.trim()) {
      toast.error("Please provide a valid URL");
      return;
    }

    setSubmitting(true);
    playPop();

    try {
      const apiBase = getApiBase();

      let postPayload = {
        title: mode === "text" ? title.trim() : (title.trim() || pollQuestion.trim() || linkUrl.trim()),
        category,
      };

      if (mode === "poll") {
        postPayload.title = pollQuestion.trim() + (title.trim() ? `\n\n${title.trim()}` : "");
        postPayload.poll = {
          question: pollQuestion.trim(),
          options: pollOptions.filter((o) => o.trim().length > 0).map((opt) => ({ optionText: opt.trim() })),
          durationHours: pollDurationHours,
        };
      }

      if (mode === "link") {
        const customTitle = title.trim();
        // Big platform standard: Never force raw URL as post title if a preview title exists
        const resolvedTitle = customTitle || linkPreviewData?.title || linkUrl.trim();
        postPayload.title = resolvedTitle;
        postPayload.mediaType = "link";
        postPayload.mtype = "link";

        if (linkPreviewData) {
          postPayload.linkPreview = linkPreviewData;
          if (linkPreviewData.image) {
            postPayload.thumbnail = linkPreviewData.image;
          }
        } else {
          postPayload.linkPreview = {
            url: linkUrl.trim(),
            title: resolvedTitle,
            domain: (() => {
              try {
                return new URL(linkUrl).hostname.replace(/^www\./, "");
              } catch {
                return "external";
              }
            })(),
          };
        }
      }

      const res = await axios.post(`${apiBase}/post/create`, postPayload, { headers });

      if (res.status === 201 || res.status === 200) {
        playChime();
        toast.success("Post published to FondPeace! 🎉");
        if (onPostCreated && res.data) {
          onPostCreated(res.data);
        }
        handleReset();
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      toast.error(err.response?.data?.message || "Failed to publish post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full mb-5">
      {/* Main Composer Box */}
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-[0_4px_24px_rgba(0,0,0,0.4)] p-3.5 sm:p-4 transition-all duration-300 hover:border-blue-500/40">
        {!expanded ? (
          /* Collapsed View */
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/25 shrink-0">
              <Sparkles size={16} />
            </div>

            <button
              type="button"
              onClick={() => {
                playPop();
                setExpanded(true);
              }}
              className="flex-1 text-left bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] transition-colors cursor-pointer"
            >
              What&apos;s on your mind? Share a thought, poll, or link...
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setMode("poll");
                  setExpanded(true);
                }}
                className="p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer"
                title="Create a Poll"
              >
                <BarChart2 size={17} />
              </button>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setMode("link");
                  setExpanded(true);
                }}
                className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                title="Share a Link"
              >
                <LinkIcon size={17} />
              </button>
              <Link
                href="/upload"
                onClick={() => playPop()}
                className="p-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                title="Upload Video or Photo"
              >
                <Video size={17} />
              </Link>
            </div>
          </div>
        ) : (
          /* Expanded Studio View */
          <form onSubmit={handleSubmit} className="space-y-3.5 animate-in fade-in duration-200">
            {/* Header: Mode Selector & Close */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setMode("text");
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === "text"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <PenLine size={13} />
                  Thought
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setMode("poll");
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === "poll"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <BarChart2 size={13} />
                  Live Poll
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setMode("link");
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === "link"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <LinkIcon size={13} />
                  Link Card
                </button>

                <Link
                  href="/upload"
                  onClick={() => playPop()}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] transition-all cursor-pointer"
                  title="Go to full Upload Studio for Videos & Photos"
                >
                  <Video size={13} className="text-blue-400" />
                  Upload Reel / Photo
                </Link>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                title="Close composer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Poll Mode Inputs */}
            {mode === "poll" && (
              <div className="space-y-2.5 p-3.5 bg-purple-950/20 dark:bg-purple-950/30 rounded-xl border border-purple-500/25">
                <input
                  type="text"
                  placeholder="Ask a question for your audience..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-purple-500/40 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  maxLength={150}
                />

                <div className="space-y-1.5">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-purple-400 w-4">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(e.target.value, idx)}
                        className="flex-1 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                        maxLength={60}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  {pollOptions.length < 4 ? (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex items-center gap-1 font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                    >
                      <Plus size={13} /> Add Option
                    </button>
                  ) : (
                    <span className="text-[var(--text-muted)] text-[10px]">Max 4 options</span>
                  )}

                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Clock size={12} />
                    <span>Duration:</span>
                    <select
                      value={pollDurationHours}
                      onChange={(e) => setPollDurationHours(Number(e.target.value))}
                      className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded px-2 py-0.5 text-[11px] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                    >
                      <option value={24} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">24 Hours</option>
                      <option value={72} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">3 Days</option>
                      <option value={168} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">7 Days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Link Mode Input */}
            {mode === "link" && (
              <div className="space-y-2 p-3.5 bg-emerald-950/20 dark:bg-emerald-950/30 rounded-xl border border-emerald-500/25">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/article-or-video"
                    value={linkUrl}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      handleFetchLinkPreview(e.target.value);
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData?.getData("text") || "";
                      if (pasted && (pasted.startsWith("http://") || pasted.startsWith("https://"))) {
                        setLinkUrl(pasted.trim());
                        handleFetchLinkPreview(pasted.trim());
                      }
                    }}
                    className="flex-1 bg-[var(--bg-subtle)] border border-emerald-500/40 rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  {fetchingPreview && (
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {linkPreviewData && (
                  <div className="flex items-center gap-3 p-2.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)]">
                    {linkPreviewData.image && (
                      <img
                        src={linkPreviewData.image}
                        alt="Preview"
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {linkPreviewData.title}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        {linkPreviewData.description || linkPreviewData.domain}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Text / Caption Area */}
            <div className="relative">
              <textarea
                rows={mode === "text" ? 3 : 2}
                placeholder={
                  mode === "poll"
                    ? "Add some context for this poll (optional)..."
                    : mode === "link"
                    ? "What are your thoughts on this link?..."
                    : "What's happening? Share stories, thoughts, hot takes..."
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={500}
                className="w-full bg-transparent text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none leading-relaxed selection:bg-blue-600 selection:text-white"
              />
              <span className="absolute bottom-1 right-1 text-[10px] text-[var(--text-muted)]">
                {title.length}/500
              </span>
            </div>

            {/* Quick Hashtag Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    playPop();
                    setTitle((prev) => (prev.includes(tag) ? prev : `${prev} ${tag}`));
                  }}
                  className="text-[10px] font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/30 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Bottom Actions Row: Category Selector & Submit */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-subtle)]">
              {/* Category selector */}
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Layers size={13} className="text-[var(--text-secondary)]" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Publish Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-full hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md hover:shadow-lg disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Post Now</span>
                      <Send size={12} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
