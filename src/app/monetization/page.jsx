"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/LeftSidebar";
import { 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Gift, 
  Lock, 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Zap, 
  PieChart, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Percent,
  Flame
} from "lucide-react";
import { playTap, playPop, playChime } from "@/utils/soundEffects";
import { triggerConfetti } from "@/utils/confetti";
import { toast } from "@/utils/toast";
import jwt from "jsonwebtoken";
import axios from "axios";
import { getApiBase } from "@/utils/apiConfig";

export default function MonetizationPage() {
  // Calculator state
  const [monthlyViews, setMonthlyViews] = useState(50000);
  const [followers, setFollowers] = useState(2500);
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const [openFaq, setOpenFaq] = useState(null);

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.username) {
        const API = getApiBase();
        axios
          .get(`${API}/user/profile/${decoded.username}`, {
            headers: { "x-auth-token": token },
          })
          .then((res) => {
            if (res.data?.Profile?.user) {
              setCurrentUser(res.data.Profile.user);
            }
          })
          .catch(() => {});
      }
    } catch (_) {}
  }, []);

  // Dynamic Revenue Estimates
  // 1. Ad Share: ~₹160 per 1,000 views (FondPeace 60% creator share)
  const adRevenue = Math.round((monthlyViews / 1000) * 160);
  // 2. Tips & Appreciation: ~1.2% of followers tip avg ₹50/mo
  const tipRevenue = Math.round(followers * 0.012 * 50);
  // 3. Subscriber Content: ~1.5% of followers subscribe at ₹99/mo
  const subscriptionRevenue = Math.round(followers * 0.015 * 99);
  // 4. Brand Bonus: Based on views + posts
  const brandBonus = Math.round((monthlyViews / 10000) * postsPerWeek * 120);

  const totalMonthlyINR = adRevenue + tipRevenue + subscriptionRevenue + brandBonus;
  const totalMonthlyUSD = (totalMonthlyINR / 85).toFixed(0);
  const totalAnnualINR = totalMonthlyINR * 12;

  const handleApply = () => {
    playChime();
    triggerConfetti();
    setHasApplied(true);
    toast.success("Monetization application submitted! Our team will review within 24 hours. ✨");
  };

  const faqs = [
    {
      q: "Can I earn money from pure text discussions, or only from videos?",
      a: "Yes, 100%! FondPeace pays for all engaging content. Text discussions, thoughts, questions, and community polls earn ad-revenue share on impressions, receive community micro-tips, and can be paywalled for subscribers just like videos."
    },
    {
      q: "How and when are creator earnings paid out?",
      a: "Payouts are transferred on the 10th of every calendar month directly to your verified Bank Account via UPI, IMPS/NEFT, or PayPal for international creators. The minimum withdrawal threshold is only ₹500 ($10)."
    },
    {
      q: "What is the revenue share percentage?",
      a: "FondPeace operates with creator-first transparency: 60% of all ad revenue goes directly to the creator. For community tips and subscriptions, creators receive 95% (only 5% payment gateway/processing fee is deducted)."
    },
    {
      q: "What are the eligibility requirements to start earning?",
      a: "You need at least 100 followers, a verified email address, and a minimum of 5 original posts (discussions, photos, or videos) in the last 30 days without copyright or community guideline violations."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070a13] text-gray-900 dark:text-gray-100 transition-colors">
      <LeftSidebar />

      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12 md:pl-64">
        
        {/* ─── Hero Header ─── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FondPeace Creator Monetization Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 dark:text-white leading-[1.15]">
            Turn Your <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">Voice & Creativity</span> Into Sustainable Revenue
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            FondPeace rewards thoughtful discussions, original videos, photography, and viral reels with industry-leading 60% revenue sharing, instant micro-tips, and subscriber communities.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#calculator"
              onClick={() => playTap()}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Calculate Your Earnings</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#eligibility"
              onClick={() => playTap()}
              className="px-6 py-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-bold text-sm border border-black/10 dark:border-white/10 transition-all active:scale-95"
            >
              Check Eligibility
            </a>
          </div>
        </div>

        {/* ─── 4 Core Revenue Pillars ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          
          {/* Pillar 1: Ad Share */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/[0.08] dark:border-white/[0.08] shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mb-2">
              60% Creator Share
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Feed Ad Revenue</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Earn from display and in-feed video ads shown on your posts. Every view on your discussions, photos, and reels directly counts toward your monthly RPM.
            </p>
          </div>

          {/* Pillar 2: Micro-Tipping */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/[0.08] dark:border-white/[0.08] shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 mb-2">
              95% Payout
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Community Tips</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Followers can send 1-click appreciation tips from ₹10 to ₹500 directly via UPI or Cards on any of your posts with custom cheer messages.
            </p>
          </div>

          {/* Pillar 3: Subscriber Exclusives */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/[0.08] dark:border-white/[0.08] shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 mb-2">
              Monthly Recurring
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Paid Subscriptions</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Lock in-depth industry insights, exclusive behind-the-scenes discussions, or unreleased reels for monthly subscribers (set your own price: ₹49 – ₹299/mo).
            </p>
          </div>

          {/* Pillar 4: Brand Sponsorships */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/[0.08] dark:border-white/[0.08] shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 mb-2">
              Brand Deals
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verified Sponsor Tags</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Get matched with trusted advertisers for sponsored hashtag campaigns, product reviews, and official brand collaboration badges.
            </p>
          </div>

        </div>

        {/* ─── Interactive Creator Revenue Calculator ─── */}
        <div id="calculator" className="relative p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-950/80 border border-black/10 dark:border-white/10 shadow-xl mb-16 overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row gap-10 items-center justify-between relative z-10">
            
            {/* Sliders Area */}
            <div className="flex-1 w-full space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Real-Time Estimation</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  Creator Earnings Calculator
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Adjust the sliders to estimate your potential monthly and yearly earnings on FondPeace.
                </p>
              </div>

              {/* Slider 1: Monthly Views */}
              <div>
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Monthly Post Views</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-base">
                    {monthlyViews.toLocaleString()} views
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={5000}
                  value={monthlyViews}
                  onChange={(e) => {
                    playTap();
                    setMonthlyViews(Number(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>5K</span>
                  <span>100K</span>
                  <span>250K</span>
                  <span>500K+</span>
                </div>
              </div>

              {/* Slider 2: Followers */}
              <div>
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Engaged Followers</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">
                    {followers.toLocaleString()} followers
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={50000}
                  step={200}
                  value={followers}
                  onChange={(e) => {
                    playTap();
                    setFollowers(Number(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>100</span>
                  <span>10K</span>
                  <span>25K</span>
                  <span>50K+</span>
                </div>
              </div>

              {/* Slider 3: Posts Per Week */}
              <div>
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Post Frequency</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono text-base">
                    {postsPerWeek} posts / week
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={postsPerWeek}
                  onChange={(e) => {
                    playTap();
                    setPostsPerWeek(Number(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

            </div>

            {/* Total Estimated Revenue Card */}
            <div className="w-full lg:w-96 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white shadow-2xl border border-white/15 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Projected Payout
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Active Formula
                  </span>
                </div>

                <div className="mb-6">
                  <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    ₹{totalMonthlyINR.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-200/80 mt-1 font-mono">
                    ≈ ${totalMonthlyUSD} USD / month
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Feed Ad Share</span>
                    <span className="font-bold text-white">₹{adRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tips & Micro-Cheers</span>
                    <span className="font-bold text-white">₹{tipRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subscriber Exclusives</span>
                    <span className="font-bold text-white">₹{subscriptionRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Brand Collaboration Bonus</span>
                    <span className="font-bold text-white">₹{brandBonus.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                <div className="text-[11px] text-gray-400 mb-1">Annual Potential</div>
                <div className="text-xl font-bold text-emerald-400">
                  ₹{totalAnnualINR.toLocaleString()} / year
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ─── Creator Eligibility Roadmap ─── */}
        <div id="eligibility" className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/10 dark:border-white/10 shadow-sm mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Eligibility & Application
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Start earning once your account meets these simple community milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">100 Followers</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Build an engaged audience who values your discussions and content.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">5 Original Posts</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Publish at least 5 discussions, photos, or video reels in the last 30 days.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Verified Profile</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Complete your profile with a bio, profile picture, and verified email.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="text-center">
            {hasApplied ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
                <span>Application Under Review</span>
              </div>
            ) : (
              <button
                onClick={handleApply}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-lg shadow-emerald-500/25 transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <span>Apply for FondPeace Monetization</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Frequently Asked Questions Accordion ─── */}
        <div className="max-w-3xl mx-auto mb-16">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white text-center mb-6">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-white dark:bg-zinc-950/60 border border-black/[0.08] dark:border-white/[0.08] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => {
                      playTap();
                      setOpenFaq(isOpen ? null : i);
                    }}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 shrink-0 text-gray-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-black/[0.04] dark:border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
