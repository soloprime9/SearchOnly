"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import {
  X,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  BarChart2,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function CreatorAnalyticsModal({ postId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !postId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchAnalytics = async () => {
      try {
        const apiBase = getApiBase();
        const res = await axios.get(`${apiBase}/post/analytics/${postId}`, {
          headers: getAuthHeaders(),
        });
        if (isMounted) {
          if (res.data?.success && res.data?.analytics) {
            setData(res.data.analytics);
          } else {
            setError("Unable to load metrics");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load analytics");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [isOpen, postId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-950 border border-black/[0.08] dark:border-white/[0.12] shadow-2xl p-6 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                Post Performance
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Live engagement insights & metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <p className="text-xs text-gray-500">Calculating engagement metrics...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-red-500">{error}</div>
          ) : data ? (
            <>
              {/* Engagement Rate Hero Pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Engagement Rate
                    </span>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                      {data.engagementRate}%
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Healthy
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Views</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.views?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Likes</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.likes?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Comments</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.comments?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Reposts</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.reposts?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                    <span>Bookmarks</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.bookmarks?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <BarChart2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>Poll Votes</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.pollVotes?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              {data.createdAt && (
                <div className="pt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Published on {new Date(data.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
