"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import { STORE_PRODUCTS } from "@/data/storeProducts";
import {
  ArrowLeft,
  Star,
  Check,
  ShieldCheck,
  Lock,
  Download,
  Share2,
  ExternalLink,
  CreditCard,
  Globe,
  Sparkles,
  CheckCircle2,
  Code2,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Zap,
  Flame,
  Copy
} from "lucide-react";
import { playTap, playChime, playPop } from "@/utils/soundEffects";
import { triggerConfetti } from "@/utils/confetti";
import { toast } from "@/utils/toast";

export default function ProductDetailPage({ params }) {
  // Unwrap params using React.use() for Next.js 15 App Router compatibility
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = resolvedParams?.id;

  const [currency, setCurrency] = useState("INR"); // 'INR' or 'USD'
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'preview', 'reviews'
  const [openFaq, setOpenFaq] = useState(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  // Find product
  const product = STORE_PRODUCTS.find(
    (p) => p.id === productId || p.slug === productId
  ) || STORE_PRODUCTS[0];

  const currentPrice = currency === "INR" ? `₹${product.priceINR}` : `$${product.priceUSD}`;
  const originalPrice = currency === "INR" ? `₹${product.originalPriceINR}` : `$${product.originalPriceUSD}`;
  const discountPercent = Math.round(
    ((currency === "INR"
      ? product.originalPriceINR - product.priceINR
      : product.originalPriceUSD - product.priceUSD) /
      (currency === "INR" ? product.originalPriceINR : product.originalPriceUSD)) *
      100
  );

  const handleCheckout = () => {
    playChime();
    triggerConfetti();
    const url = product.topmateUrl || "https://topmate.io/fondpeace";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = () => {
    playPop();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard! 🚀");
    }
  };

  const handleCopySample = (code, index) => {
    playPop();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      toast.success("Sample code copied to clipboard!");
      setTimeout(() => setCopiedCodeIndex(null), 2500);
    }
  };

  const faqs = [
    {
      q: "How does payment & payouts work with UP Gramin Bank / Indian Banks?",
      a: "100% seamlessly! Topmate is built in India for global digital sellers. Domestic buyers pay via Indian UPI (PhonePe, Google Pay, Paytm, BHIM) or Net Banking. Topmate deposits 100% of the sale price into your UP Gramin Bank or any Indian bank account via direct IMPS/NEFT without currency conversion or PayPal blocks."
    },
    {
      q: "Who pays the Topmate platform fee and taxes?",
      a: "By choosing 'Pass fee to buyer' in Topmate settings, Topmate handles platform convenience fees directly from the customer at checkout. This guarantees zero deductions from your pocket, ensuring you keep 100% of your earnings."
    },
    {
      q: "Can international customers buy in USD ($)?",
      a: "Yes! International developers pay in USD ($) or EUR (€) via Stripe using Visa, Mastercard, American Express, Apple Pay, or Google Pay."
    },
    {
      q: "How are files delivered after checkout?",
      a: "Instant automated delivery! Once payment completes on Topmate, an instant download link appears on your screen and is simultaneously emailed to your inbox with lifetime access."
    },
    {
      q: "Can I use and modify these rules for commercial client work?",
      a: "Yes! All prompt vaults and software stacks include a 100% commercial white-label license. You can use them for personal projects, enterprise work, or freelance client deliverables without paying any royalties."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <div
        className="
          grid 
          grid-cols-1 
          lg:grid-cols-[76px_minmax(0,1fr)] 
          xl:grid-cols-[220px_minmax(0,1fr)] 
          max-w-[1440px] 
          mx-auto
          gap-4 lg:gap-6
          px-2 sm:px-4
          py-3
        "
      >
        {/* Left Sidebar (Sticky on Desktop, Bottom bar on Mobile) */}
        <aside className="shrink-0">
          <LeftSidebar sticky={true} />
        </aside>

        {/* Product Details Main Container */}
        <main className="w-full min-w-0 max-w-5xl mx-auto py-3 sm:py-6 pb-24 lg:pb-12 space-y-6">
          
          {/* Breadcrumb Navigation & Top Actions */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <Link
              href="/store"
              onClick={() => playTap()}
              className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-blue-500 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Digital Store</span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Currency Toggle */}
              <div className="p-0.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center text-xs font-bold shadow-inner">
                <button
                  onClick={() => {
                    playTap();
                    setCurrency("INR");
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currency === "INR"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  🇮🇳 ₹ INR
                </button>
                <button
                  onClick={() => {
                    playTap();
                    setCurrency("USD");
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currency === "USD"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  🌐 $ USD
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition active:scale-95"
                title="Share Product"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              PRODUCT HERO & PRICING SPLIT
          ═══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Product Header & Tech Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
                  {product.badge}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {product.fileSize || "Instant Download"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                {product.title}
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-medium">
                {product.subtitle}
              </p>

              {/* Ratings & Social Proof */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating}</span>
                  <span className="text-[var(--text-muted)] font-normal">
                    ({product.reviewsCount} verified reviews)
                  </span>
                </div>
                <span className="text-[var(--text-muted)]">•</span>
                <div className="flex items-center gap-1 font-mono text-[var(--text-secondary)]">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>{product.starsGithub} GitHub stars equivalence</span>
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tech.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Full Description */}
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-2">
                {product.description}
              </p>

              {/* What You Get Checklist */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
                <h3 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <span>📦 Full Commercial Bundle Inclusions:</span>
                  <span className="text-emerald-500 font-black text-xs">Save {discountPercent}% Today</span>
                </h3>
                <div className="space-y-2">
                  {product.includes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Sticky Pricing & Zero-Cut Topmate Box */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-6 p-6 rounded-3xl bg-[var(--bg-surface)] border border-blue-500/30 shadow-2xl shadow-blue-500/5 space-y-5">
                
                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                      {currentPrice}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] line-through">
                      {originalPrice}
                    </span>
                    <span className="ml-auto px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      SAVE {discountPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                    One-time payment • Lifetime free updates included
                  </p>
                </div>

                {/* Instant Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Get Instant Access Now</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>

                {/* Topmate Direct Payout & Fee Protection Guarantee */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2 text-xs">
                  <div className="font-bold text-[var(--text-primary)] text-[11.5px] flex items-center gap-1.5 text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Topmate Zero-Pocket-Cut Guaranteed</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Customer platform fees and taxes are processed transparently at checkout. 100% of the net sale value transfers directly to your verified <strong>UP Gramin Bank</strong> or Indian bank account weekly via IMPS/NEFT.
                  </p>
                  <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10.5px] text-[var(--text-muted)] font-mono">
                    <span>UPI: PhonePe / GPay / Paytm</span>
                    <span>Global: Stripe / Cards</span>
                  </div>
                </div>

                {/* Trust Inclusions */}
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <span>Instant on-screen & email download link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <span>Commercial resale & client rights included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <span>Format: {product.deliverables}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              SNEAK-PEEK & LOCKED VAULT TEASER
              (Showing real samples while keeping the vault locked)
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 mb-1">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Vault Preview & Sneak-Peek</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                  Inspect What&apos;s Inside (Sample Snippets vs Full Vault)
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  See the exact production quality before purchasing. Below are 2 full free preview rules; the remaining 48+ are unlocked immediately after checkout.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
                2 Free Samples • 48+ Locked
              </span>
            </div>

            {/* Free Samples Cards */}
            <div className="space-y-4">
              {product.sampleSnippets && product.sampleSnippets.map((sample, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden"
                >
                  <div className="p-3.5 px-4 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                        {sample.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-500">
                        FREE SAMPLE
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopySample(sample.code, idx)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1 active:scale-95"
                    >
                      {copiedCodeIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Sample</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 text-xs font-mono text-[var(--text-secondary)] overflow-x-auto leading-relaxed bg-[var(--bg-canvas)]">
                    <code>{sample.code}</code>
                  </pre>
                </div>
              ))}
            </div>

            {/* ═══════════════════════════════════════════════════
                LOCKED VAULT TEASER LIST (FROSTED GLASS EFFECT)
            ═══════════════════════════════════════════════════ */}
            <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-5 overflow-hidden">
              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Remaining Items in Vault (Included with Instant Access):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                  {product.lockedSnippets && product.lockedSnippets.map((locked, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate font-medium">{locked.title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase shrink-0">
                        Locked
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glassmorphic Locked CTA Overlay at Bottom */}
              <div className="p-6 rounded-2xl bg-gradient-to-t from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-transparent border border-blue-500/20 text-center space-y-3 mt-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-500 flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                    Unlock All 50+ Production Rules & Turnkey Stacks
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mt-1">
                    Get instant lifetime access to the complete unredacted codebase, raw .cursorrules files, and all future 2026 updates for only {currentPrice}.
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-500/25 transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Unlock Full Vault for {currentPrice}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              CUSTOMER TESTIMONIALS & REVIEWS
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <span>Verified Developer Reviews ({product.reviewsCount})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {product.testimonials && product.testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2.5 flex flex-col justify-between"
                >
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[var(--text-primary)] block">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {t.role}
                      </span>
                    </div>
                    <div className="flex text-amber-400 text-xs">
                      {"★".repeat(t.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              FAQ ACCORDION
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span>Frequently Asked Questions & Banking Policy</span>
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => {
                        playTap();
                        setOpenFaq(isOpen ? null : i);
                      }}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center justify-between gap-3 hover:text-blue-500 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/50 pt-3">
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
    </div>
  );
}
