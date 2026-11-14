"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import StoreReviewsCarousel from "@/components/StoreReviewsCarousel";
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
  ChevronDown,
  ChevronUp,
  Zap,
  Flame,
  Clock,
  Layers,
  HelpCircle,
  FileCheck
} from "lucide-react";
import { toast } from "@/utils/toast";

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams?.id;

  const [openFaq, setOpenFaq] = useState(null);

  // Find product
  const product = STORE_PRODUCTS.find(
    (p) => p.id === productId || p.slug === productId
  ) || STORE_PRODUCTS[0];

  const discountPercent = Math.round(
    ((product.originalPriceUSD - product.priceUSD) / product.originalPriceUSD) * 100
  );

  const handleCheckout = () => {
    const url = product.topmateUrl || "https://topmate.io/fondpeace";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const faqs = [
    {
      q: "What exact format will I receive the files in?",
      a: product.fileFormat || "Instant digital download package (.zip, .pdf, and raw markdown template files)."
    },
    {
      q: "Can I use these prompts and tools for my clients or commercial SaaS?",
      a: "Yes, 100%! Every purchase includes a lifetime commercial white-label license. You can use it in your company, for client freelance projects, or build and sell a SaaS product without paying any royalties."
    },
    {
      q: "How does payment work for International vs Indian buyers?",
      a: "Topmate handles this automatically via geo-IP smart checkout. International buyers can checkout in USD ($) using Stripe (Credit Cards, Apple Pay, Google Pay). Indian buyers will automatically see the equivalent in INR and can pay via UPI (PhonePe, GPay, Paytm) or Net Banking."
    },
    {
      q: "What if I need help or have questions after downloading?",
      a: "All purchases come with our direct creator email support. You can reach out directly from your Topmate download receipt for any configuration guidance."
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
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-amber-400 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title="Share Product Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════
              HERO & PRICING SPLIT GRID
          ═══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Core Value & Problem Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {product.badge}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Instant Download
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Product Visual Banner */}
              <div className="relative w-full h-52 sm:h-72 rounded-3xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-md">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-medium">
                {product.subtitle}
              </p>

              {/* Verified Product Quality */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <span>★★★★★</span>
                  <span className="text-xs font-bold text-amber-400">5.0</span>
                  <span className="text-[var(--text-muted)] font-medium">
                    (Verified Buyer Rated)
                  </span>
                </div>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instant Download + Free Updates</span>
                </span>
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

              {/* Target Audience Pill */}
              {product.whoIsThisFor && (
                <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] block mb-1">
                    🎯 Who Is This Built For:
                  </span>
                  <p>{product.whoIsThisFor}</p>
                </div>
              )}

              {/* The Core Problem & Solution (WHY BUY THIS) */}
              <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span>The Problem It Solves:</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
                    {product.problemSolved}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span>The Solution & Direct Value:</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
                    {product.solutionBenefit}
                  </p>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Sticky Pricing & Checkout Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-6 p-6 rounded-3xl bg-[var(--bg-surface)] border border-amber-400/40 shadow-2xl space-y-5">
                
                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                      ${product.priceUSD}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] line-through">
                      ${product.originalPriceUSD}
                    </span>
                    <span className="ml-auto px-2 py-0.5 rounded-md text-xs font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      SAVE {discountPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                    One-time payment • Lifetime access with free future updates
                  </p>
                </div>

                {/* Instant Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Get Instant Access (${product.priceUSD})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {/* Universal Payment Guarantee */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1.5 text-xs">
                  <div className="font-bold text-[var(--text-primary)] text-[11.5px] flex items-center gap-1.5 text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Universal Checkout (USD & UPI)</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    International buyers pay via Stripe (Credit Card, Apple Pay). Indian buyers can pay via UPI with instant automatic currency conversion.
                  </p>
                </div>

                {/* Trust Inclusions */}
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant on-screen & email download link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>Commercial white-label license included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>Format: {product.fileFormat || "Digital Download Package"}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              DELIVERABLES & CONCRETE FAYADA (WHAT YOU GET)
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
            
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                Everything Included in this Package
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                You get the complete, unredacted production assets immediately upon ordering.
              </p>
            </div>

            {/* Deliverables Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.deliverables.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-medium text-[var(--text-primary)]">{item}</span>
                </div>
              ))}
            </div>

            {/* Direct ROI Benefits (Real Fayada) */}
            {product.roiBenefits && (
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                  ⚡ The Return On Investment (Fayada):
                </h3>
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  {product.roiBenefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 font-medium">
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Checkout Action */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  ${product.priceUSD}
                </span>
                <span className="text-xs text-[var(--text-muted)] line-through ml-2">
                  ${product.originalPriceUSD}
                </span>
                <span className="text-xs text-[var(--text-secondary)] block">
                  Lifetime access • Free future updates
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Get Instant Access (${product.priceUSD})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              AUTO-PLAYING REVIEWS CAROUSEL (SOCIAL PROOF)
          ═══════════════════════════════════════════════════ */}
          <StoreReviewsCarousel />

          {/* ═══════════════════════════════════════════════════
              FAQ ACCORDION
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Frequently Asked Questions</span>
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
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center justify-between gap-3 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
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
