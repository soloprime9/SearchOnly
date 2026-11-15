"use client";

import React, { useState, useMemo, use } from "react";
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
  FileCheck,
  Play,
  Eye,
  Copy,
  Calendar,
  Monitor,
  Smartphone,
  X,
  Video,
  FileText
} from "lucide-react";
import { toast } from "@/utils/toast";

// ══════════════════════════════════════════════════════════════════════════════
// 10 READY-MADE INK EXPLAINER VIRAL STORY PACKS (18M+ Views Hit Series)
// ══════════════════════════════════════════════════════════════════════════════
const INK_EXPLAINER_STORIES = [
  {
    id: "story-1",
    title: "Why 99% of People Fail in Their 20s",
    views: "15.4M Views",
    channel: "@Inkexplainer96",
    hook: "Stop scrolling right now: 99% of people quit in their 20s right before their biggest breakthrough because comfort feels safe.",
    scenes: [
      { beat: "Scene 1 (0-3s): Golden Hook", prompt: "A minimalist stickman standing motionless on a bustling Tokyo street bridge as millions of blurred neon silhouettes rush past. High contrast glowing white character against moody cyberpunk ink tones, rain droplets frozen in air." },
      { beat: "Scene 2 (4-7s): The Trap", prompt: "The stickman sitting inside an invisible digital cage constructed of glowing neon smartphone notification icons. Silhouette looking down in quiet exhaustion, dim ambient blue rim light." },
      { beat: "Scene 3 (8-12s): The Hourglass", prompt: "Cinematic close-up of a giant crystal hourglass dripping glowing golden sand grains. The stickman desperately trying to catch time as it slips through their ink hands." },
      { beat: "Scene 4 (13-16s): The Katana Stance", prompt: "The stickman shedding the hoodie to reveal a traditional samurai warrior stance on a dark mountain cliff during an electric thunderstorm. Katana drawn." },
      { beat: "Scene 5 (17-21s): The Slash", prompt: "Explosive dynamic slash of the blade shattering the digital cage into millions of sparkling glass shards in slow motion. Dynamic ink particle splash." },
      { beat: "Scene 6 (22-26s): The Ascent", prompt: "The stickman running up a steep mountain peak against ferocious gale winds and flying cherry blossom petals, eyes locked on the horizon." },
      { beat: "Scene 7 (27-30s): Fuji Sunrise", prompt: "The stickman standing triumphantly atop Mount Fuji at dawn, warm amber morning sun rising over sea of clouds. Golden rim lighting." }
    ]
  },
  {
    id: "story-2",
    title: "How Long Would You Survive in Every Era of Earth?",
    views: "18.2M Views",
    channel: "@Inkexplainer96",
    hook: "If a time machine dropped you onto ancient Earth right now, you wouldn't last 12 minutes without modern shelter.",
    scenes: [
      { beat: "Scene 1: Jurassic Drop", prompt: "Stickman suddenly falling from sky landing on muddy prehistoric jungle floor, massive Tyrannosaurus shadow looming overhead." },
      { beat: "Scene 2: Ice Age Chill", prompt: "Stickman shivering in torrential blizzard, wrapped in mammoth fur, tracking sabertooth tiger footprints in deep snow." },
      { beat: "Scene 3: Ancient Egypt", prompt: "Stickman hauling limestone blocks under scorching Sahara sun, massive Great Pyramid silhouette in background." },
      { beat: "Scene 4: Roman Colosseum", prompt: "Stickman standing in dusty arena holding wooden shield facing roaring audience and armored centurion." },
      { beat: "Scene 5: Medieval Fortress", prompt: "Stickman guarding castle battlement at midnight during blazing catapult attack with burning arrows." },
      { beat: "Scene 6: Industrial Smog", prompt: "Stickman walking through 1880s London steam factory alley surrounded by brick chimneys and iron gears." },
      { beat: "Scene 7: Modern Sanctuary", prompt: "Stickman sitting comfortably in warm modern room holding coffee, looking out window with immense gratitude." }
    ]
  },
  {
    id: "story-3",
    title: "Your Entire Life as an Ancient Human",
    views: "12.8M Views",
    channel: "@Inkexplainer96",
    hook: "10,000 years ago, your 20th birthday meant you were already an elder in your tribe fighting for daily survival.",
    scenes: [
      { beat: "Scene 1: Birth in Cave", prompt: "Newborn stickman wrapped in wolf pelt by warm glowing campfire inside dark cavern wall painted with buffaloes." },
      { beat: "Scene 2: The First Hunt", prompt: "Young stickman learning to carve flint spearhead alongside tribal elder under starlit African savanna." },
      { beat: "Scene 3: Mammoth Chase", prompt: "Stickman sprinting across grassy plain coordinating tribe with stone spears tracking massive woolly mammoth." },
      { beat: "Scene 4: The Wildfire", prompt: "Tribe fleeing across glowing red hills as lightning strike sparks raging savannah brush fire." },
      { beat: "Scene 5: Winter Scarcity", prompt: "Stickman sharing roasted meat with family inside cozy snow cave, firelight dancing on cave ceiling." },
      { beat: "Scene 6: The Council", prompt: "Stickman speaking with tribal elders around sacred council fire under full moon." },
      { beat: "Scene 7: Legacy Rock Art", prompt: "Stickman pressing ochre-covered hand onto smooth cave wall, leaving eternal handprint for eternity." }
    ]
  },
  {
    id: "story-4",
    title: "Why Did Ancient Humans Evolve in Africa?",
    views: "8.4M Views",
    channel: "@Inkexplainer96",
    hook: "Why did every modern human on Earth originate from the East African Rift Valley instead of Europe or Asia?",
    scenes: [
      { beat: "Scene 1: The Great Rift", prompt: "Stickman standing on edge of colossal Great Rift Valley cliff as tectonic plates slowly shift, aerial view." },
      { beat: "Scene 2: Forest to Savanna", prompt: "Lush jungle trees rapidly transforming into open grassy plains due to shifting climate patterns." },
      { beat: "Scene 3: Bipedal Leap", prompt: "Stickman ancestor standing upright on two feet for the first time to peer over tall savannah grass." },
      { beat: "Scene 4: Endurance Hunt", prompt: "Stickman jogging steadily under blazing midday sun, outlasting sprinting gazelle through sweat and stamina." },
      { beat: "Scene 5: Control of Fire", prompt: "Stickman striking flint stones together until glowing spark ignites dry grass, triumph on character face." },
      { beat: "Scene 6: The Out-of-Africa Trek", prompt: "Stickman leading migration line of tribes across Sinai desert crossing into unknown horizon." },
      { beat: "Scene 7: Global Family", prompt: "Stickman hand morphing into diverse modern human hands holding a glowing globe, unity concept." }
    ]
  },
  {
    id: "story-5",
    title: "Why Human Progress Exploded 10,000 Years Ago",
    views: "9.5M Views",
    channel: "@Inkexplainer96",
    hook: "For 300,000 years humans lived as foragers without building anything. Then suddenly, everything exploded.",
    scenes: [
      { beat: "Scene 1: The Nomad Trail", prompt: "Stickman wandering desolate tundra with simple stick pack, endless repeating landscape." },
      { beat: "Scene 2: The First Seed", prompt: "Stickman kneeling in fertile mud riverbank carefully planting wild wheat seeds with bamboo stick." },
      { beat: "Scene 3: River Settlement", prompt: "Cluster of circular mud-brick huts springing up along Nile river with irrigation trenches." },
      { beat: "Scene 4: The Clay Granary", prompt: "Stickman stacking woven baskets of harvested grain, creating first food surplus in human history." },
      { beat: "Scene 5: Writing on Clay", prompt: "Stickman pressing reed stylus into wet clay tablet to invent cuneiform writing and commerce." },
      { beat: "Scene 6: Bronze Metallurgy", prompt: "Stickman pouring molten copper and tin into stone axe mold, bright orange glowing sparks." },
      { beat: "Scene 7: Towering Cities", prompt: "Stickman looking up from ancient ziggurat to modern skyscrapers touching the stars, timelapse transition." }
    ]
  },
  {
    id: "story-6",
    title: "What Did Ancient Humans Actually Do All Night?",
    views: "12.4M Views",
    channel: "@Inkexplainer96",
    hook: "With no electricity, no phones, and 12 hours of total pitch darkness, how did ancient humans survive the night?",
    scenes: [
      { beat: "Scene 1: Twilight Watch", prompt: "Stickman stoking roaring cave entrance fire as sun dips below jungle horizon, shadows stretching long." },
      { beat: "Scene 2: The Night Predator", prompt: "Stickman peering into pitch black night as glowing feline eyes reflect firelight 50 yards away." },
      { beat: "Scene 3: Storytelling Fire", prompt: "Tribal stickmen sitting in warm circle sharing oral history folklore with expressive hand gestures." },
      { beat: "Scene 4: Star Navigation", prompt: "Stickman lying on back staring up at pristine Milky Way galaxy tracing constellation paths." },
      { beat: "Scene 5: Tool Crafting", prompt: "Stickman by ember glow carefully binding obsidian arrowhead to wooden shaft with sinew cord." },
      { beat: "Scene 6: Biphasic Sleep", prompt: "Stickman waking for peaceful midnight contemplation hour before falling back into deep rest." },
      { beat: "Scene 7: Morning Dawn", prompt: "Stickman stepping out into golden morning dew as bird songs fill the valley, victorious dawn." }
    ]
  },
  {
    id: "story-7",
    title: "How Ancient Humans Survived the Deadliest Predators",
    views: "22.7M Views",
    channel: "@Inkexplainer96",
    hook: "We have no claws, no fangs, and run slower than a dog. So how did humans hunt giant sabertooths to extinction?",
    scenes: [
      { beat: "Scene 1: The Ambush", prompt: "Sabertooth cat crouching on rock ledge above unsuspecting stickman, tensed muscles ready to pounce." },
      { beat: "Scene 2: The Signal Whistle", prompt: "Stickman blowing bone whistle, echoing through canyon walls to alert coordinated hunting band." },
      { beat: "Scene 3: Fire Wall", prompt: "Ten stickmen stepping forward in synchronized line brandishing blazing pine torches to terrify beast." },
      { beat: "Scene 4: The Atlatl Dart", prompt: "Stickman loading spear thrower atlatl, generating massive kinetic leverage with scientific precision." },
      { beat: "Scene 5: The Pit Trap", prompt: "Disguised leaf-covered pit trap collapsing beneath charging mammoth, ingenious engineering." },
      { beat: "Scene 6: Wolf Domesticated", prompt: "Stickman kneeling beside tame wolf sharing bone, forging humanity's first multi-species alliance." },
      { beat: "Scene 7: Apex of Earth", prompt: "Stickman standing peacefully atop mountain ridge with wolf companion at side, apex protector." }
    ]
  },
  {
    id: "story-8",
    title: "The 3 AM Phone Trap: Dopamine Detox",
    views: "14.1M Views",
    channel: "@Inkexplainer96",
    hook: "It's 3:17 AM. You promised yourself you'd sleep at 11. Why does your thumb keep scrolling like a zombie?",
    scenes: [
      { beat: "Scene 1: Blue Glow Bed", prompt: "Stickman lying in bed with pitch dark room, face illuminated only by harsh blue phone screen glow." },
      { beat: "Scene 2: Infinite Scroll Wheel", prompt: "Stickman trapped on a giant spinning treadmill powered by red like buttons and follower counts." },
      { beat: "Scene 3: The Dopamine Drip", prompt: "Giant neon IV drip feeding sugar-coated dopamine molecules directly into stickman cartoon brain." },
      { beat: "Scene 4: The Decision", prompt: "Stickman grabbing smartphone and placing it firmly inside another room, closing the door shut." },
      { beat: "Scene 5: Deep Rest", prompt: "Stickman asleep in calm dark room, serene breathing with soft moonlight filtering through curtains." },
      { beat: "Scene 6: 6 AM Awakening", prompt: "Stickman leaping out of bed at sunrise with vibrant energy, drinking tall glass of water." },
      { beat: "Scene 7: Focused Creation", prompt: "Stickman sitting at clean wooden desk typing on laptop with notebook open, 100% flow state." }
    ]
  },
  {
    id: "story-9",
    title: "Samurai Discipline vs Modern Laziness",
    views: "11.9M Views",
    channel: "@Inkexplainer96",
    hook: "A 16th-century samurai woke up at 4 AM to practice sword kata in freezing waterfalls. You hit snooze 4 times.",
    scenes: [
      { beat: "Scene 1: The Frozen Waterfall", prompt: "Samurai stickman in black hakama standing motionless beneath roaring freezing mountain waterfall in winter." },
      { beat: "Scene 2: The Modern Snooze", prompt: "Modern stickman buried under heavy duvet slapping smartphone alarm buzzer with lazy arm." },
      { beat: "Scene 3: The Bushido Code", prompt: "Glowing Japanese calligraphic brush kanji characters for Honor, Courage, and Rectitude floating in air." },
      { beat: "Scene 4: The Duel of Wills", prompt: "Modern stickman facing off against shadow demon representing procrastination and excuses." },
      { beat: "Scene 5: The First Kata", prompt: "Stickman drawing wooden bokken practice sword and executing crisp, decisive vertical downward cut." },
      { beat: "Scene 6: Relentless Habit", prompt: "Stickman training daily through summer heat, autumn rain, and winter snow without skipping a single session." },
      { beat: "Scene 7: The Mastered Self", prompt: "Stickman bowing with serene calmness before tranquil zen gravel garden and cherry blossom tree." }
    ]
  },
  {
    id: "story-10",
    title: "The 100-Year Life Perspective",
    views: "16.5M Views",
    channel: "@Inkexplainer96",
    hook: "If you lived to 100, that is roughly 5,200 weeks. Most people have already spent half of them worrying about nothing.",
    scenes: [
      { beat: "Scene 1: The 5200 Grid", prompt: "Stickman looking at colossal grid of 5,200 small square marble blocks on museum wall representing weeks of life." },
      { beat: "Scene 2: Childhood Innocence", prompt: "Young stickman chasing butterflies in vibrant green meadow under warm summer sun." },
      { beat: "Scene 3: The 20s Hustle", prompt: "Stickman burning midnight oil at desk building dreams with coffee mug and open blueprint." },
      { beat: "Scene 4: The Family Hearth", prompt: "Stickman holding hands with loved ones around warm kitchen table sharing laughter and food." },
      { beat: "Scene 5: What Really Mattered", prompt: "Stickman discarding heavy stone suitcase labeled 'What other people think' into deep canyon." },
      { beat: "Scene 6: Legacy Creation", prompt: "Stickman planting oak tree sapling that will shelter generations they will never meet." },
      { beat: "Scene 7: The Golden Hour", prompt: "Elderly stickman with walking staff sitting on hill overlooking ocean sunset, total inner peace." }
    ]
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// 30-DAY DAILY UPLOAD ROUTINE & BEGINNER ROADMAP DATA
// ══════════════════════════════════════════════════════════════════════════════
const ROADMAP_TIMELINE = [
  {
    time: "00:00 - 00:10",
    duration: "10 Min",
    phase: "Step 1: Viral Topic Discovery",
    desc: "Open the built-in YouTube Viral Radar. Filter by Shorts or Full Videos. Spot a topic with 5M+ views and click '⚡ Remake in Studio' to lock in the psychological hook.",
    icon: "📡",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30"
  },
  {
    time: "00:10 - 00:20",
    duration: "10 Min",
    phase: "Step 2: 5-Stage Storyboard Prompts",
    desc: "Select 1 of 16 Locked Character Style Engines (e.g. Modern Beanie Zeke or Edo Samurai). Generate 7 beat-by-beat scene prompts with frozen visual anatomy.",
    icon: "🎨",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30"
  },
  {
    time: "00:20 - 00:30",
    duration: "10 Min",
    phase: "Step 3: Neural Voiceover & Subtitles",
    desc: "Select natural voice (Christopher for deep English or Madhur for natural Hindi). Generate crystal-clear audio and export word-by-word synced .srt subtitles.",
    icon: "🎙️",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30"
  },
  {
    time: "00:30 - 00:40",
    duration: "10 Min",
    phase: "Step 4: CapCut / Web Video Assembly",
    desc: "Drop the 7 generated scene clips and neural voice track into CapCut (or use Web Video Exporter). Apply Hormozi bold captions and speed ramps.",
    icon: "🎬",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30"
  },
  {
    time: "00:40 - 00:45",
    duration: "5 Min",
    phase: "Step 5: Publish & Algorithm Optimization",
    desc: "Export 9:16 vertical video (1080x1920, 60fps). Post to YouTube Shorts, Instagram Reels, and TikTok using high-CTR stickman tags.",
    icon: "🚀",
    color: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/30"
  }
];

const ROADMAP_WEEKS = [
  {
    week: "Week 1: Days 1–7",
    title: "Algorithm Seeding & Hook Calibration",
    target: "7 Videos Uploaded",
    milestone: "Establish channel authority in the stickman explainer niche. Test 3 different character style engines to see which gets >70% initial view duration."
  },
  {
    week: "Week 2: Days 8–14",
    title: "Retention Pacing & Audio Tuning",
    target: "14 Videos Total",
    milestone: "Optimize the 3-second golden hook. Keep scene cuts under 4 seconds. Target average percentage viewed (APV) above 82% on YouTube Shorts."
  },
  {
    week: "Week 3: Days 15–21",
    title: "Viral Momentum & Multi-Platform Syndication",
    target: "21 Videos Total",
    milestone: "Repurpose every Short to Instagram Reels and TikTok. First video crosses 50k–200k views as recommendation engine picks up consistent daily signals."
  },
  {
    week: "Week 4: Days 22–30",
    title: "Monetization & Faceless Brand Scaling",
    target: "30 Videos Total",
    milestone: "Qualify for YouTube Partner Program (YPP) or digital product affiliate income. Your 45-minute daily production routine is now pure muscle memory."
  }
];

const MULTI_PLATFORM_LAUNCHERS = [
  {
    os: "Windows 10 / 11",
    file: "Launch_StickMotion_Windows.bat",
    desc: "Double-click to start local engine and open Chrome/Edge instantly at :8080. Includes Silent VBS launcher for background execution.",
    badge: "1-Click .bat",
    icon: "🪟"
  },
  {
    os: "macOS (Apple Silicon & Intel)",
    file: "Launch_StickMotion_Mac.command",
    desc: "Native double-clickable launcher with automated chmod +x permissions and Safari/Chrome integration.",
    badge: "1-Click .command",
    icon: "🍎"
  },
  {
    os: "Chrome & Edge Extension",
    file: "extension/ (Manifest V3)",
    desc: "Side-panel stickman director extension. Generate prompts, copy story packs, and monitor YouTube radar right inside your browser.",
    badge: "Chrome Web Store Ready",
    icon: "🧩"
  },
  {
    os: "Android Mobile PWA",
    file: "manifest.json & sw.js",
    desc: "Install directly from browser to Android home screen. Offline caching, responsive touch UI, and mobile script generator.",
    badge: "Install to Home Screen",
    icon: "📱"
  }
];

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams?.id;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState("all");
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Find product
  const product = STORE_PRODUCTS.find(
    (p) => p.id === productId || p.slug === productId
  ) || STORE_PRODUCTS[0];

  const isStickMotion = product.id === "stickmotion-studio";

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

  const handleCopyStoryPrompts = (story) => {
    const fullText = `=== ${story.title} (${story.views}) ===\nHOOK: ${story.hook}\n\nSCENE PROMPTS:\n` +
      story.scenes.map((s) => `[${s.beat}]\n${s.prompt}`).join("\n\n");
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(fullText);
      toast.success(`Copied 7 scene prompts for "${story.title}"!`);
    }
  };

  const filteredGallery = useMemo(() => {
    if (!product.previewImages) return [];
    if (activeGalleryTab === "gifs") {
      return product.previewImages.filter((img) => img.url.endsWith(".gif"));
    }
    if (activeGalleryTab === "scenes") {
      return product.previewImages.filter((img) => img.url.endsWith(".jpg") || img.tag?.includes("Flow AI"));
    }
    return product.previewImages;
  }, [product.previewImages, activeGalleryTab]);

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
          
          {/* Top Bar Navigation (Back to Store) */}
          <div className="flex items-center justify-between gap-3 text-xs py-1">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-amber-400 font-bold transition shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>

            <div className="flex items-center gap-2">
              {product.sampleDownloadUrl && (
                <a
                  href={product.sampleDownloadUrl}
                  download="StickMotion_AI_Master_Creator_Guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-400 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Free PDF Guide</span>
                  <span className="sm:hidden">PDF</span>
                </a>
              )}

              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer shadow-sm text-xs font-semibold"
                title="Share Product Link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              HERO & PRICING SPLIT GRID
          ═══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Core Value & Visual Experience */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {product.badge}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Instant Download (.zip + PDF)
                </span>
                {isStickMotion && (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    477 MB Complete Kit
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3.5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Product Visual Banner */}
              <div className="relative w-full h-56 sm:h-80 rounded-3xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-md group">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                {product.subtitle}
              </p>

              {/* Verified Product Quality Rating */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <span>★★★★★</span>
                  <span className="text-xs font-bold text-amber-400">5.0</span>
                  <span className="text-[var(--text-muted)] font-medium">
                    (Verified Creator Rated)
                  </span>
                </div>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instant Download + Free Lifetime Updates</span>
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

              {/* ═══════════════════════════════════════════════════
                  STICKMOTION: VISUAL STYLE ENGINES & 4K GALLERY
              ═══════════════════════════════════════════════════ */}
              {product.previewImages && product.previewImages.length > 0 && (
                <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Visual Style Engines & 4K Storyboard Gallery</span>
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Click any style or scene to inspect animation quality and character lock
                      </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-subtle)] text-[11px] font-bold">
                      <button
                        onClick={() => setActiveGalleryTab("all")}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          activeGalleryTab === "all" ? "bg-amber-500 text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        All (16)
                      </button>
                      <button
                        onClick={() => setActiveGalleryTab("gifs")}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          activeGalleryTab === "gifs" ? "bg-amber-500 text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        🎬 9 GIFs
                      </button>
                      <button
                        onClick={() => setActiveGalleryTab("scenes")}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          activeGalleryTab === "scenes" ? "bg-amber-500 text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        🌟 7 Scenes
                      </button>
                    </div>
                  </div>

                  {/* Grid Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {filteredGallery.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPreview(img)}
                        className="group/card relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] hover:border-amber-400/60 bg-[var(--bg-canvas)] cursor-pointer transition-all hover:scale-102 hover:shadow-lg space-y-1 p-1"
                      >
                        <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.label}
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-black/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
                            {img.tag}
                          </span>
                          <span className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white/90 group-hover/card:bg-amber-500 group-hover/card:text-black transition">
                            <Eye className="w-3 h-3" />
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover/card:text-amber-400 block text-center truncate px-1 py-0.5">
                          {img.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Audience Pill */}
              {product.whoIsThisFor && (
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] block mb-1">
                    🎯 Who Is This Built For:
                  </span>
                  <p className="leading-relaxed">{product.whoIsThisFor}</p>
                </div>
              )}

              {/* The Core Problem & Solution (WHY BUY THIS) */}
              <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span>The Problem It Solves:</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-1 font-medium">
                    {product.problemSolved}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span>The Solution & Direct Value:</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-1 font-medium">
                    {product.solutionBenefit}
                  </p>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Sticky Pricing & Action Card */}
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

                {/* Free Sample PDF Download Button */}
                {product.sampleDownloadUrl && (
                  <a
                    href={product.sampleDownloadUrl}
                    download="StickMotion_AI_Master_Creator_Guide.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-amber-400/40 hover:border-amber-400 text-amber-400 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>📖 Download Free PDF Manual Preview</span>
                  </a>
                )}

                {/* Universal Payment Guarantee */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1.5 text-xs">
                  <div className="font-bold text-[var(--text-primary)] text-[11.5px] flex items-center gap-1.5 text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Universal Checkout (USD & UPI)</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    International buyers pay via Stripe (Credit Card, Apple Pay). Indian buyers can pay via UPI with instant automatic currency conversion on Topmate.
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

                {/* Quick Spec Highlights */}
                {isStickMotion && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] space-y-1">
                    <span className="font-bold text-amber-400 block">Package Integrity:</span>
                    <p className="text-[var(--text-muted)]">
                      • 500,505,918 Bytes (477.32 MB) Verified ZIP<br/>
                      • Windows .bat, Mac .command, Chrome Ext, PWA<br/>
                      • 10 Story Packs + 16 Style Engines + Radar
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              STICKMOTION ONLY: 30-DAY DAILY UPLOAD ROUTINE & ROADMAP
          ═══════════════════════════════════════════════════ */}
          {isStickMotion && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-amber-400/30 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-block mb-1">
                    Clockwork Daily System
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    30-Day Daily Upload Routine & Beginner Roadmap
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                    A strictly engineered 45-minute daily production routine. From zero followers to YouTube monetization.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-emerald-400">
                  <Clock className="w-4 h-4" />
                  <span>45 Minutes / Day Total</span>
                </div>
              </div>

              {/* 5-Step Daily Clockwork Routine */}
              <div className="space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The 45-Minute Daily Clockwork Timeline:</span>
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {ROADMAP_TIMELINE.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl bg-gradient-to-b ${step.color} border ${step.border} space-y-2 flex flex-col justify-between`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{step.icon}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/40 text-amber-300 font-mono">
                            {step.duration}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                          {step.time}
                        </span>
                        <h4 className="text-xs font-black text-[var(--text-primary)] leading-snug">
                          {step.phase}
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4-Week Milestone Roadmap */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>4-Week Growth Milestones to Monetization:</span>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ROADMAP_WEEKS.map((w, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">{w.week}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {w.target}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {w.title}
                      </h4>
                      <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                        {w.milestone}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              STICKMOTION ONLY: 10 READY-MADE VIRAL STORY PACKS
          ═══════════════════════════════════════════════════ */}
          {isStickMotion && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 inline-block mb-1">
                    YouTube Ranked Content (18M+ Views)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    10 Ready-Made Viral Story Prompt Packs
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                    Curated directly from @Inkexplainer96 viral master hits. Complete 7-scene beat prompts with 1-click copy.
                  </p>
                </div>
                <button
                  onClick={() => handleCopyStoryPrompts(INK_EXPLAINER_STORIES[activeStoryIndex])}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Active 7 Prompts</span>
                </button>
              </div>

              {/* Story Switcher Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {INK_EXPLAINER_STORIES.map((story, idx) => {
                  const isActive = activeStoryIndex === idx;
                  return (
                    <button
                      key={story.id}
                      onClick={() => setActiveStoryIndex(idx)}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer space-y-1 ${
                        isActive
                          ? "bg-amber-500/15 border-amber-400 text-amber-400 shadow-sm"
                          : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold">Story #{idx + 1}</span>
                        <span className="text-emerald-400 font-bold">{story.views}</span>
                      </div>
                      <p className="text-[11px] font-bold line-clamp-1 leading-tight">
                        {story.title}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Active Story Details & Scene Prompts */}
              {INK_EXPLAINER_STORIES[activeStoryIndex] && (
                <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          STORY #{activeStoryIndex + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                          {INK_EXPLAINER_STORIES[activeStoryIndex].views}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {INK_EXPLAINER_STORIES[activeStoryIndex].channel}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1">
                        {INK_EXPLAINER_STORIES[activeStoryIndex].title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleCopyStoryPrompts(INK_EXPLAINER_STORIES[activeStoryIndex])}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-amber-500/20 border border-[var(--border-subtle)] hover:border-amber-400 text-xs font-bold text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copy All Prompts</span>
                    </button>
                  </div>

                  {/* Hook Box */}
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                      🎣 3-Second Golden Hook (Speech & Script):
                    </span>
                    <p className="text-xs sm:text-sm text-white/90 font-semibold italic">
                      "{INK_EXPLAINER_STORIES[activeStoryIndex].hook}"
                    </p>
                  </div>

                  {/* 7 Beat Scene Prompts */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                      🎬 7-Scene Dynamic Beat Prompts (Universal Diffusion Formula):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {INK_EXPLAINER_STORIES[activeStoryIndex].scenes.map((sc, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="font-bold text-amber-400">{sc.beat}</span>
                            <button
                              onClick={() => {
                                if (typeof window !== "undefined") {
                                  navigator.clipboard.writeText(sc.prompt);
                                  toast.success(`Copied ${sc.beat}!`);
                                }
                              }}
                              className="text-[10px] text-[var(--text-muted)] hover:text-amber-400 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                            {sc.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              STICKMOTION ONLY: MULTI-PLATFORM LAUNCHERS
          ═══════════════════════════════════════════════════ */}
          {isStickMotion && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 inline-block mb-1">
                  100% Turnkey Deployment
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  Multi-Platform Launchers & Zero-Setup Apps
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                  Run the studio locally on any device without configuring Node, Python virtualenvs, or complex terminal commands.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {MULTI_PLATFORM_LAUNCHERS.map((launcher, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{launcher.icon}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {launcher.badge}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                        {launcher.os}
                      </h4>
                      <span className="text-[10px] font-mono text-amber-400/90 block">
                        File: {launcher.file}
                      </span>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {launcher.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

              <div className="flex flex-wrap items-center gap-2">
                {product.sampleDownloadUrl && (
                  <a
                    href={product.sampleDownloadUrl}
                    download="StickMotion_AI_Master_Creator_Guide.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-2xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-amber-400/40 text-amber-400 font-bold text-xs transition inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Free PDF Guide</span>
                  </a>
                )}

                <button
                  onClick={handleCheckout}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Get Instant Access (${product.priceUSD})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
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

      {/* ═══════════════════════════════════════════════════
          LIGHTBOX MODAL FOR PREVIEWS
      ═══════════════════════════════════════════════════ */}
      {selectedPreview && (
        <div
          onClick={() => setSelectedPreview(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full rounded-3xl bg-[var(--bg-surface)] border border-amber-400/40 p-4 sm:p-6 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-amber-500 text-black">
                  {selectedPreview.tag}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                  {selectedPreview.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1.5 rounded-full bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full max-h-[65vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[var(--border-subtle)]">
              <img
                src={selectedPreview.url}
                alt={selectedPreview.label}
                className="max-h-[65vh] w-auto object-contain mx-auto"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
              <span>Included in StickMotion AI™ Complete Creator Kit</span>
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-3 py-1 rounded-lg bg-[var(--bg-canvas)] text-amber-400 font-bold hover:bg-white/10 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
