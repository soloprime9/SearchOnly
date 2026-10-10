"use client";

import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Copy, Check, Wand2, Lightbulb, ArrowRight } from "lucide-react";
import { playTap, playChime } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";

export default function Creation() {
  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const getContent = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    playTap();

    try {
      const response = await axios.get(
        `https://backendk-z915.onrender.com/content/search?q=${encodeURIComponent(prompt)}`
      );
      setData(Array.isArray(response.data) ? response.data : []);
      playChime();
    } catch (error) {
      console.error("Content generation error:", error);
      toast.error("Unable to generate ideas right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyContent = (text, index) => {
    playTap();
    const contentString = typeof text === "string" ? text : text?.content || JSON.stringify(text);
    navigator.clipboard.writeText(contentString);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-3 sm:px-4">
      <div className="relative p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-subtle)] shadow-2xl">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 shadow-sm">
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Content Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Generate Post Ideas & Captions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            Type any topic or niche to receive creative post concepts, hooks, and captions.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={getContent} className="relative z-10 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 5 tips for daily productivity, AI trends 2026..."
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm sm:text-base transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <>
                  <span>Generate</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Generated Results Grid */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {data.map((post, index) => {
              const textContent = typeof post === "string" ? post : post?.content || JSON.stringify(post);
              const isCopied = copiedIndex === index;

              return (
                <div
                  key={index}
                  className="group p-5 rounded-2xl bg-[var(--bg-subtle)] backdrop-blur-xl border border-[var(--border-subtle)] hover:border-indigo-500/40 shadow-sm transition-all flex flex-col justify-between"
                >
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium mb-4 whitespace-pre-wrap">
                    {textContent}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>Idea #{index + 1}</span>
                    </span>

                    <button
                      onClick={() => copyContent(textContent, index)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isCopied
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
