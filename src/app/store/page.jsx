"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/LeftSidebar";
import { STORE_PRODUCTS } from "@/data/storeProducts";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Download,
  Check,
  ArrowRight,
  Zap,
  Star,
  ExternalLink,
  Search,
  Globe,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Lock,
  Layers,
  FileCode,
  Flame,
  X,
  Share2
} from "lucide-react";
import { playTap, playChime, playPop } from "@/utils/soundEffects";
import { triggerConfetti } from "@/utils/confetti";
import { toast } from "@/utils/toast";

// ==========================================
// DIGITAL PRODUCTS CATALOG DATA
// ==========================================
const PRODUCTS = STORE_PRODUCTS;

export default function StorePage() {
  const [currency, setCurrency] = useState("INR"); // 'INR' or 'USD'
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tech.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleCurrency = (newCurr) => {
    playTap();
    setCurrency(newCurr);
  };

  const handleCheckout = (product) => {
    playChime();
    triggerConfetti();
    // Direct Topmate checkout URL
    const url = product.topmateUrl || "https://topmate.io/fondpeace";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    playPop();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Store link copied to clipboard! 🚀");
    }
  };

  const faqs = [
    {
      q: "How does payment work with Indian Banks (UP Gramin Bank, Aryavart Bank, SBI)?",
      a: "100% seamlessly! When you pay or receive earnings through our Topmate store checkout, all payments support Indian UPI (PhonePe, Google Pay, Paytm, BHIM) and net banking. Payouts are routed directly to your Regional Rural Bank (UP Gramin Bank) or any national bank via standard IMPS/NEFT with zero currency conversion hurdles."
    },
    {
      q: "Can international customers buy in USD ($) from outside India?",
      a: "Yes! International customers can pay instantly using Visa, Mastercard, American Express, Apple Pay, and Google Pay in US Dollars ($ USD) or Euros (€ EUR). Stripe handles global transactions automatically."
    },
    {
      q: "How are digital files delivered after purchase?",
      a: "Delivery is instant and automated. As soon as your checkout completes on Topmate, an instant download button appears on your screen, and an automated backup email with your secure download links and license keys is delivered within 10 seconds."
    },
    {
      q: "Do I get commercial rights to use and modify the code and prompts?",
      a: "Yes, 100%! All software stacks and prompt vaults come with an unlimited commercial license. You can use them for personal projects, client work, or deploy them commercially without paying any royalty."
    },
    {
      q: "Are future updates included in the purchase?",
      a: "Yes! You get lifetime access to all future updates, new .cursorrules additions, and updated framework configurations as new AI models are released."
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

        {/* Main Store Content Area */}
        <main className="w-full min-w-0 max-w-6xl mx-auto py-3 sm:py-6 pb-24 lg:pb-12 space-y-6">
          
          {/* ═══════════════════════════════════════════════════
              HERO HEADER SECTION
          ═══════════════════════════════════════════════════ */}
          <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-2xl">
            {/* Subtle Gradient Glow Background */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FondPeace Digital Store & Turnkey AI Vault</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                  Production <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">AI Prompts</span> & Turnkey Dev Stacks
                </h1>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Curated .cursorrules, production AI prompt vaults, and turnkey GitHub stacks. Built for engineers, creators, and builders worldwide with instant download delivery.
                </p>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[var(--text-secondary)] font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Instant Automated Delivery</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Commercial Rights Included</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>UPI & Global Cards Verified</span>
                  </span>
                </div>
              </div>

              {/* Action Side Controls (Currency Switcher & Share) */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
                {/* Currency Switcher Pill */}
                <div className="p-1 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center shadow-inner">
                  <button
                    onClick={() => toggleCurrency("INR")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                      currency === "INR"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span>🇮🇳 ₹ INR (UPI)</span>
                  </button>
                  <button
                    onClick={() => toggleCurrency("USD")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                      currency === "USD"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span>🌐 $ USD (Cards)</span>
                  </button>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5 active:scale-95"
                  title="Share Store Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Store</span>
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              FILTER & SEARCH CONTROL BAR
          ═══════════════════════════════════════════════════ */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs font-bold">
              {[
                { id: "all", label: "All Stacks", count: PRODUCTS.length },
                { id: "prompts", label: "AI Prompt Vaults", count: 1 },
                { id: "video", label: "Video Automation", count: 1 },
                { id: "saas", label: "Turnkey SaaS", count: 3 }
              ].map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playTap();
                      setActiveCategory(tab.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-subtle-hover)]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-[var(--bg-canvas)] text-[var(--text-muted)]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Real-time Search Box */}
            <div className="relative min-w-[220px] sm:w-64">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts, stacks..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/40 focus:border-blue-500 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition"
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              PRODUCTS GRID
          ═══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProducts.map((prod) => {
              const currentPrice = currency === "INR" ? `₹${prod.priceINR}` : `$${prod.priceUSD}`;
              const originalPrice = currency === "INR" ? `₹${prod.originalPriceINR}` : `$${prod.originalPriceUSD}`;
              const discountPercent = Math.round(
                ((currency === "INR"
                  ? prod.originalPriceINR - prod.priceINR
                  : prod.originalPriceUSD - prod.priceUSD) /
                  (currency === "INR" ? prod.originalPriceINR : prod.originalPriceUSD)) *
                  100
              );

              return (
                <div
                  key={prod.id}
                  className="group rounded-3xl p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Badge & Rating Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
                        {prod.badge}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{prod.rating}</span>
                        <span className="text-[var(--text-muted)] font-normal text-[11px]">
                          ({prod.reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Product Title & Subtitle */}
                    <div>
                      <Link href={`/store/${prod.id}`} onClick={() => playTap()}>
                        <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] group-hover:text-blue-500 transition-colors leading-snug">
                          {prod.title}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                        {prod.subtitle}
                      </p>
                    </div>

                    {/* Tech Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {prod.tech.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-medium bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Included Features Bullet Points */}
                    <div className="p-3 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1.5 text-xs text-[var(--text-secondary)]">
                      <div className="font-bold text-[var(--text-primary)] text-[11px] flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
                        <span>📦 What&apos;s Included in Bundle:</span>
                        <span className="text-emerald-500 font-black">Save {discountPercent}%</span>
                      </div>
                      {prod.includes.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11.5px]">
                          <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom / Price & CTA Row */}
                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                          {currentPrice}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] line-through">
                          {originalPrice}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        Instant digital access
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Details Preview Button */}
                      <Link
                        href={`/store/${prod.id}`}
                        onClick={() => playTap()}
                        className="px-3 py-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition active:scale-95 inline-flex items-center"
                      >
                        Details
                      </Link>

                      {/* Buy Now / Checkout Button */}
                      <button
                        onClick={() => handleCheckout(prod)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <span>Get Access</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════════
              TRUST & BANKING VERIFICATION BANNER
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  100% Indian Banking & Worldwide Payment Verified
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                  Payouts settle directly into Indian Regional Rural Banks (UP Gramin Bank) & all national banks with zero international forex hassle.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gramin Bank Ready</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>Stripe Global USD</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Indian UPI & Net Banking</span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11.5px]">
                  Supports PhonePe, Google Pay, Paytm, BHIM, and direct IMPS transfers.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>135+ Countries Supported</span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11.5px]">
                  International buyers can pay in USD, EUR, or GBP via credit/debit card with Stripe security.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Instant Encrypted Delivery</span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11.5px]">
                  Instant download on screen plus a verified email receipt with lifetime re-download links.
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              FREQUENTLY ASKED QUESTIONS (ACCORDION)
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span>Frequently Asked Questions</span>
            </h2>

            <div className="space-y-2.5">
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

      {/* ═══════════════════════════════════════════════════
          PRODUCT DETAIL QUICK-VIEW MODAL
      ═══════════════════════════════════════════════════ */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl p-6 sm:p-8 space-y-5 overflow-hidden animate-scaleIn">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
                {selectedProduct.badge}
              </span>
              <h2 className="text-xl font-black text-[var(--text-primary)] mt-2">
                {selectedProduct.title}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {selectedProduct.subtitle}
              </p>
            </div>

            {/* Full description */}
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* What is included */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2">
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                Everything Included in this Package:
              </span>
              <div className="space-y-1.5">
                {selectedProduct.includes.map((inc, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables details */}
            <div className="text-[11px] text-[var(--text-muted)] space-y-1 font-mono">
              <div>📦 Format: {selectedProduct.deliverables}</div>
              <div>⚖️ License: Commercial Unlimited White-Label Rights</div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <div>
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  {currency === "INR" ? `₹${selectedProduct.priceINR}` : `$${selectedProduct.priceUSD}`}
                </span>
                <span className="text-xs text-[var(--text-muted)] line-through ml-2">
                  {currency === "INR" ? `₹${selectedProduct.originalPriceINR}` : `$${selectedProduct.originalPriceUSD}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedProduct.sampleDownloadUrl && selectedProduct.sampleDownloadUrl !== "#" && (
                  <a
                    href={selectedProduct.sampleDownloadUrl}
                    download
                    onClick={() => playPop()}
                    className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </a>
                )}

                <button
                  onClick={() => handleCheckout(selectedProduct)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>Instant Checkout</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
