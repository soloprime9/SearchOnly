"use client";

import React, { useState } from "react";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { toast } from "@/utils/toast";
import { playPop, playChime } from "@/utils/soundEffects";
import { Flag, X, AlertTriangle, ShieldCheck } from "lucide-react";

const REASONS = [
  { id: "spam", label: "Spam or automated bots" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "hate_speech", label: "Hate speech or discrimination" },
  { id: "misinformation", label: "Misinformation or fake news" },
  { id: "violence", label: "Violence or dangerous content" },
  { id: "copyright", label: "Copyright infringement" },
  { id: "other", label: "Other issue" },
];

export default function ReportModal({ postId, isOpen, onClose }) {
  const [selectedReason, setSelectedReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please log in to report content");
      return;
    }

    setSubmitting(true);
    playPop();

    try {
      const apiBase = getApiBase();
      const res = await axios.post(
        `${apiBase}/post/report/${postId}`,
        { reason: selectedReason, details },
        { headers: getAuthHeaders() }
      );

      if (res.data?.success) {
        playChime();
        toast.success("Thank you. Report received for safety review.");
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to submit report");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-950 border border-black/[0.08] dark:border-white/[0.12] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Report Post
              </h3>
              <p className="text-xs text-gray-500">Help keep FondPeace safe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Why are you reporting this post?
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === r.id
                      ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-medium"
                      : "border-black/[0.06] dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:bg-black/[0.02]"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-rose-600"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Additional context (optional)
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any details that will help our safety team..."
              className="w-full text-xs p-3 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-black/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
