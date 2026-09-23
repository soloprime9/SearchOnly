"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { playPop, playChime } from "@/utils/soundEffects";
import { triggerConfetti } from "@/utils/confetti";
import { toast } from "@/utils/toast";
import { CheckCircle2, Clock, BarChart3, AlertCircle } from "lucide-react";

export default function PollCard({ postId, pollData, currentUserId, onVoteSuccess }) {
  const [poll, setPoll] = useState(pollData || null);
  const [votingIndex, setVotingIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (pollData) {
      setPoll(pollData);
    }
  }, [pollData]);

  if (!poll || !poll.options || poll.options.length === 0) return null;

  const totalVotes = poll.totalVotes || poll.options.reduce((sum, opt) => sum + (opt.voteCount || opt.votes?.length || 0), 0);

  // Check if current user has voted
  const hasUserVoted = () => {
    if (poll.userVoted !== undefined) return poll.userVoted;
    if (!currentUserId) return false;
    return poll.options.some((opt) =>
      Array.isArray(opt.votes) && opt.votes.some((v) => String(v) === String(currentUserId) || String(v?._id) === String(currentUserId))
    );
  };

  const getUserVotedIndex = () => {
    if (poll.userVotedIndex !== undefined && poll.userVotedIndex >= 0) return poll.userVotedIndex;
    if (!currentUserId) return -1;
    return poll.options.findIndex((opt) =>
      Array.isArray(opt.votes) && opt.votes.some((v) => String(v) === String(currentUserId) || String(v?._id) === String(currentUserId))
    );
  };

  const isExpired = () => {
    if (poll.isExpired) return true;
    if (poll.expiresAt) return new Date(poll.expiresAt) < new Date();
    return false;
  };

  const userVoted = hasUserVoted();
  const votedIdx = getUserVotedIndex();
  const expired = isExpired();
  const showResults = userVoted || expired;

  const getTimeRemaining = () => {
    if (!poll.expiresAt) return "Active";
    const diff = new Date(poll.expiresAt) - new Date();
    if (diff <= 0) return "Final results";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    const mins = Math.floor(diff / (1000 * 60));
    return `${Math.max(1, mins)}m left`;
  };

  const handleVote = async (index) => {
    if (showResults) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please log in to vote in this poll");
      return;
    }

    setVotingIndex(index);
    playPop();

    try {
      const apiBase = getApiBase();
      const res = await axios.post(
        `${apiBase}/post/poll/vote/${postId}`,
        { optionIndex: index },
        { headers: getAuthHeaders() }
      );

      if (res.data?.success && res.data?.poll) {
        setPoll(res.data.poll);
        setSelectedOption(index);
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
        playChime();
        toast.success("Vote recorded!");
        if (onVoteSuccess) onVoteSuccess(res.data.poll);
      } else {
        toast.error(res.data?.message || "Failed to vote");
      }
    } catch (err) {
      console.error("Poll vote error:", err);
      toast.error(err.response?.data?.message || "Error submitting vote");
    } finally {
      setVotingIndex(null);
    }
  };

  return (
    <div className="my-4 p-4 rounded-2xl bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-sm transition-all duration-300">
      {/* Poll Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Live Poll
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{getTimeRemaining()}</span>
        </div>
      </div>

      {/* Poll Question (if distinct from post title) */}
      {poll.question && (
        <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-3 leading-snug">
          {poll.question}
        </h4>
      )}

      {/* Options List */}
      <div className="space-y-2.5">
        {poll.options.map((option, idx) => {
          const optVotes = option.voteCount !== undefined ? option.voteCount : (option.votes?.length || 0);
          const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
          const isUserChoice = votedIdx === idx || selectedOption === idx;
          const isHighest = totalVotes > 0 && optVotes === Math.max(...poll.options.map(o => o.voteCount !== undefined ? o.voteCount : (o.votes?.length || 0)));

          return (
            <div key={idx} className="relative overflow-hidden rounded-xl">
              {showResults ? (
                /* Results View with Animated Progress Bar */
                <div
                  className={`relative p-3.5 rounded-xl border transition-all duration-300 ${
                    isUserChoice
                      ? "border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/30"
                      : "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03]"
                  }`}
                >
                  {/* Background Progress Fill */}
                  <div
                    className={`absolute inset-0 top-0 bottom-0 left-0 transition-all duration-700 ease-out rounded-xl opacity-20 ${
                      isHighest
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                        : "bg-gray-400 dark:bg-gray-600"
                    }`}
                    style={{ width: `${percent}%` }}
                  />

                  <div className="relative flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 pr-2">
                      {isUserChoice && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isUserChoice
                            ? "text-blue-900 dark:text-blue-200 font-semibold"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {option.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {optVotes} {optVotes === 1 ? "vote" : "votes"}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isHighest
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Voting Button View */
                <button
                  onClick={() => handleVote(idx)}
                  disabled={votingIndex !== null}
                  className="w-full text-left p-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] hover:bg-blue-50/70 hover:border-blue-400/60 dark:bg-white/[0.04] dark:hover:bg-blue-900/30 dark:hover:border-blue-500/50 transition-all duration-200 group flex items-center justify-between active:scale-[0.99]"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {option.text}
                  </span>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                    {votingIndex === idx && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div className="mt-3 pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {totalVotes} {totalVotes === 1 ? "total vote" : "total votes"}
        </span>
        {userVoted && (
          <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> You voted
          </span>
        )}
      </div>
    </div>
  );
}
