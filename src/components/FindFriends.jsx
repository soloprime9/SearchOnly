'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Users, UserPlus, Sparkles, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { playTap, playPop, playChime } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";

export default function FindFriends() {
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function handleFindFriends() {
    playTap();
    setLoading(true);
    setError(null);
    setStatus("checking");

    try {
      if (typeof navigator === "undefined" || !navigator.contacts || !navigator.contacts.select) {
        throw new Error("Contact sync is supported on mobile browsers (Chrome on Android).");
      }

      setStatus("selecting");
      const contacts = await navigator.contacts.select(["name", "tel"], { multiple: true });

      if (!contacts || contacts.length === 0) {
        setLoading(false);
        setStatus("idle");
        return;
      }

      const normalizedContacts = contacts.map((c) => ({
        name: c.name?.[0] || "Friend",
        phone: (c.tel?.[0] || "").replace(/\s/g, ""),
      }));

      setStatus("syncing");
      const res = await fetch("https://backendk-z915.onrender.com/post/number/sync-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: normalizedContacts }),
      });

      if (!res.ok) {
        throw new Error("Backend contact sync error: " + res.status);
      }

      const data = await res.json();
      setFriends(data.matchedUsers || []);
      setSuggestions(data.suggestions || []);
      setStatus("complete");
      playChime();
      toast.success("Contacts synced successfully!");
    } catch (err) {
      console.warn("Contact sync warning:", err);
      playPop();
      setError(err.message || "Could not sync contacts.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-16 px-3 sm:px-4">
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-zinc-950/60 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
                Find Friends on FondPeace
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Discover contacts from your phonebook who are already sharing posts.
              </p>
            </div>
          </div>

          <button
            onClick={handleFindFriends}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 text-xs sm:text-sm font-bold transition-all disabled:opacity-50 shrink-0 shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{loading ? "Syncing..." : "Sync Contacts"}</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Matched Friends */}
        {friends.length > 0 && (
          <div className="mt-6 pt-6 border-t border-black/[0.05] dark:border-white/[0.06]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Matched Friends ({friends.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]"
                >
                  <img
                    src={u.profilePic || "/logo.jpg"}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10"
                    onError={(e) => { e.currentTarget.src = "/logo.jpg"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{u.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Usernames */}
        {suggestions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-black/[0.05] dark:border-white/[0.06]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Suggested Creators
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <Link
                  key={i}
                  href={`/profile/${s}`}
                  className="px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-blue-500 hover:text-white text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  @{s}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
