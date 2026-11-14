"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/LeftSidebar";
import { STORE_PRODUCTS } from "@/data/storeProducts";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
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
  CheckCircle2,
  Lock,
  Layers,
  Flame,
  Share2
} from "lucide-react";
import { toast } from "@/utils/toast";

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return STORE_PRODUCTS.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tech.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCheckout = (product) => {
    const url = product.topmateUrl || "https://topmate.io/fondpeace";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Store link copied to clipboard!");
    }
  };

  const faqs = [
    {
      q: "How does payment work for International and Indian buyers?",
      a: "100% automated via Topmate smart checkout! International buyers pay directly in US Dollars ($ USD) via Visa, Mastercard, American Express, Apple Pay, and Google Pay with Stripe security. Indian buyers automatically see the price converted to INR and can pay instantly via UPI (PhonePe, GPay, Paytm) or Net Banking."
    },
    {
      q: "How are the digital files delivered after purchase?",
      a: "Instant and automated! Right after your checkout completes on Topmate, an instant download button appears on your screen, and an automated backup email with your secure lifetime download link is delivered to your inbox within 10 seconds."
    },
    {
      q: "Do I get commercial rights to use and monetize these tools?",
      a: "Yes, 100%! All software kits, prompt vaults, and creator tools include an unlimited commercial white-label license. You can use them for personal projects, client deliverables, or paid SaaS launches without paying any royalties."
    },
    {
      q: "Will I get future updates as new AI models come out?",
      a: "Yes! Your purchase grants lifetime access to all future updates, updated .cursorrules, and new prompt frameworks as Claude, Gemini, and OpenAI release new model iterations."
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
          <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FondPeace Official Digital Store & AI Tools</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                  Production <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">AI Systems</span> & Turnkey Dev Stacks
                </h1>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Real tools that solve painful problems and save weeks of work. Battle-tested .cursorrules prompt engines, 24-hour SaaS kits, and automated viral video frameworks with instant digital download delivery.
                </p>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[var(--text-secondary)] font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Instant Digital Delivery</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Commercial White-Label License</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>Universal Checkout (USD & UPI)</span>
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
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
                { id: "all", label: "All Products", count: STORE_PRODUCTS.length },
                { id: "prompts", label: "AI Prompts & Rules", count: 2 },
                { id: "saas", label: "SaaS & Dev Kits", count: 1 },
                { id: "video", label: "Viral Video Systems", count: 1 }
              ].map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-amber-500 text-black font-black shadow-md shadow-amber-500/20"
                        : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-black/20 text-black" : "bg-[var(--bg-canvas)] text-[var(--text-muted)]"
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
                placeholder="Search tools, prompts..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-amber-400/40 focus:border-amber-400 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition"
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              PRODUCTS GRID
          ═══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProducts.map((prod) => {
              const discountPercent = Math.round(
                ((prod.originalPriceUSD - prod.priceUSD) / prod.originalPriceUSD) * 100
              );

              return (
                <div
                  key={prod.id}
                  className="group rounded-3xl p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-amber-400/50 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Badge & Rating Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
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
                      <Link href={`/store/${prod.id}`}>
                        <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] group-hover:text-amber-400 transition-colors leading-snug">
                          {prod.title}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                        {prod.subtitle}
                      </p>
                    </div>

                    {/* Tech / Framework Tags */}
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

                    {/* The Problem & Solution Box (REAL FAYADA) */}
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2 text-xs">
                      <div>
                        <span className="text-[10.5px] font-bold text-rose-400 uppercase tracking-wider block">
                          Problem Solved:
                        </span>
                        <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                          {prod.problemSolved}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider block">
                          What You Get (Key Deliverables):
                        </span>
                        <div className="space-y-1 mt-1 text-[11.5px] text-[var(--text-secondary)]">
                          {prod.deliverables.slice(0, 3).map((d, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Universal USD Price & Action */}
                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                          ${prod.priceUSD}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] line-through">
                          ${prod.originalPriceUSD}
                        </span>
                        <span className="text-[10px] font-black text-emerald-500 ml-1">
                          SAVE {discountPercent}%
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium block">
                        Instant digital download access
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/store/${prod.id}`}
                        className="px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => handleCheckout(prod)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Get Access (${prod.priceUSD})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════════
              UNIVERSAL PAYMENT & BANKING TRUST BANNER
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  Universal Global Checkout & Instant Payouts
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                  Powered by Topmate smart geo-routing. International buyers pay in USD via Stripe; Indian buyers can pay via UPI with instant automated currency conversion.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>Stripe Global USD</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Indian UPI Auto-Converted</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>135+ Countries Supported</span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11.5px]">
                  Instant checkout via Visa, Mastercard, American Express, Apple Pay, and Google Pay.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Direct Bank Payouts</span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11.5px]">
                  Earnings settle directly into your verified bank account via standard weekly IMPS/NEFT transfers.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Instant Delivery & Updates</span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11.5px]">
                  Files are delivered on your screen immediately and sent to your email with lifetime access.
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              FREQUENTLY ASKED QUESTIONS
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
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
