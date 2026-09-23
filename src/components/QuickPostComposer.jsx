"use client";

import React, { useState } from "react";
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

  // Auto fetch link preview
  const handleFetchLinkPreview = async (url) => {
    if (!url || !url.startsWith("http")) return;
    setFetchingPreview(true);
    try {
      const apiBase = getApiBase();
      const res = await axios.get(`${apiBase}/post/preview/link?url=${encodeURIComponent(url)}`);
      if (res.data?.success && res.data?.preview) {
        setLinkPreviewData(res.data.preview);
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
        postPayload.title = title.trim() ? `${title.trim()}\n${linkUrl.trim()}` : linkUrl.trim();
        if (linkPreviewData) {
          postPayload.linkPreview = linkPreviewData;
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
      <div className="bg-[#0e111d] rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)] p-3.5 sm:p-4 transition-all duration-300 hover:border-blue-500/30">
        {!expanded ? (
          /* Collapsed View */
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles size={16} />
            </div>

            <button
              onClick={() => {
                playPop();
                setExpanded(true);
              }}
              className="flex-1 text-left bg-white/[0.04] hover:bg-white/[0.07] text-gray-400 text-xs sm:text-sm font-medium px-4 py-2 rounded-xl border border-white/[0.06] transition-colors"
            >
              What&apos;s on your mind? Share a thought, poll, or link...
            </button>

            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => {
                  playPop();
                  setMode("poll");
                  setExpanded(true);
                }}
                className="p-2 rounded-xl text-purple-400 hover:bg-purple-500/10 transition-colors"
                title="Create a Poll"
              >
                <BarChart2 size={17} />
              </button>
              <button
                onClick={() => {
                  playPop();
                  setMode("link");
                  setExpanded(true);
                }}
                className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title="Share a Link"
              >
                <LinkIcon size={17} />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Studio View */
          <form onSubmit={handleSubmit} className="space-y-3.5 animate-in fade-in duration-200">
            {/* Header: Mode Selector & Close */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setMode("text");
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    mode === "text"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900"
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
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    mode === "poll"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900"
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
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    mode === "link"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <LinkIcon size={13} />
                  Link Card
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Poll Mode Inputs */}
            {mode === "poll" && (
              <div className="space-y-2.5 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <input
                  type="text"
                  placeholder="Ask a question for your audience..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  maxLength={150}
                />

                <div className="space-y-1.5">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 w-4">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(e.target.value, idx)}
                        className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        maxLength={60}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
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
                      className="flex items-center gap-1 font-bold text-purple-600 hover:text-purple-700"
                    >
                      <Plus size={13} /> Add Option
                    </button>
                  ) : (
                    <span className="text-gray-400 text-[10px]">Max 4 options</span>
                  )}

                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={12} />
                    <span>Duration:</span>
                    <select
                      value={pollDurationHours}
                      onChange={(e) => setPollDurationHours(Number(e.target.value))}
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[11px] text-gray-700 dark:text-gray-300"
                    >
                      <option value={24}>24 Hours</option>
                      <option value={72}>3 Days</option>
                      <option value={168}>7 Days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Link Mode Input */}
            {mode === "link" && (
              <div className="space-y-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/article-or-video"
                    value={linkUrl}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      handleFetchLinkPreview(e.target.value);
                    }}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  {fetchingPreview && (
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {linkPreviewData && (
                  <div className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                    {linkPreviewData.image && (
                      <img
                        src={linkPreviewData.image}
                        alt="Preview"
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {linkPreviewData.title}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
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
                className="w-full bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
              />
              <span className="absolute bottom-1 right-1 text-[10px] text-gray-400">
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
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/50 transition-colors whitespace-nowrap"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Bottom Actions Row: Category Selector & Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
              {/* Category selector */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Layers size={13} className="text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
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
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md hover:shadow-lg disabled:opacity-40 transition-all active:scale-95"
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
