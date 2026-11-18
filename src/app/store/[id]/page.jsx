"use client";

import React, { useState, useMemo } from "react";
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
  X,
  Video,
  FileText,
  Lightbulb,
  Unlock
} from "lucide-react";
import { toast } from "@/utils/toast";

// ══════════════════════════════════════════════════════════════════════════════
// HIGH-CONTRAST VECTOR ICONS (Matches Image 3 Reference)
// ══════════════════════════════════════════════════════════════════════════════
const WindowsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path fill="#0078D4" d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.749-1.55L24 0v11.551H10.749V1.899zM0 12.55h9.75V22l-9.75-1.35V12.55zm10.749 0H24V24l-13.251-1.899V12.55z" />
  </svg>
);

const AppleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-.99 1.72-.85 2.74 1.01.08 2.05-.53 2.58-1.24z" />
  </svg>
);

const ChromeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" fill="#ffffff" />
    <circle cx="12" cy="12" r="4" fill="#4285F4" />
    <path fill="#EA4335" d="M12 2C6.48 2 2 6.48 2 12c0 .49.04.97.11 1.44L7.5 4.15C8.77 2.82 10.3 2 12 2z" />
    <path fill="#FBBC05" d="M2.11 13.44C2.94 18.35 7.06 22 12 22c2.15 0 4.13-.71 5.73-1.92L12.35 11h-4.85l-5.39 2.44z" />
    <path fill="#34A853" d="M17.73 20.08C20.31 18.15 22 15.28 22 12c0-3.66-1.98-6.86-4.93-8.6L12.35 11l5.38 9.08z" />
  </svg>
);

const AndroidIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#3DDC84">
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.3562 13.8533 8 12 8s-3.5902.3562-5.1367.9507L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867 0 14.8872 0 19.2222h24c0-4.335-2.6889-8.0355-6.1185-9.9008" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// 10 READY-MADE INK EXPLAINER VIRAL STORY PACKS (18M+ Views - Deep Multi-Sentence Paragraphs)
// ══════════════════════════════════════════════════════════════════════════════
const INK_EXPLAINER_STORIES = [
  {
    id: "story-1",
    title: "Why 99% of People Fail in Their 20s",
    views: "15.4M Views",
    channel: "@Inkexplainer96",
    hook: "Stop scrolling right now: 99% of people quit in their 20s right before their biggest breakthrough because comfort feels safe.",
    scenes: [
      {
        beat: "Scene 1 (0-3s): Golden Hook",
        prompt: "A minimalist white stickman standing completely motionless on the center edge of a rain-soaked Shibuya pedestrian bridge at midnight. All around him, thousands of fast-blurred cyberpunk commuters streak by as motion-smeared silhouettes with glowing umbrellas. The camera holds a locked 85mm cinematic portrait shot; dramatic neon magenta and cyan reflections glisten across the wet asphalt. A single crystal raindrop hangs suspended in ultra slow motion inches from the character's face, conveying a psychological state of absolute temporal paralysis. Audio cue: Low sub-bass drop transitioning into a solitary ticking clock."
      },
      {
        beat: "Scene 2 (4-7s): The Mental Trap",
        prompt: "Slow dolly-in camera move towards the stickman slumped on an office stool, trapped inside an invisible digital cage constructed of floating, pulsing neon notification badges—endless red like hearts, blue unread envelopes, and spinning refresh wheels. The character clutches his head in quiet desperation under a harsh, flickering 6000K overhead fluorescent bulb, casting deep ink-wash shadows on the floor. Atmospheric dust motes drift through cold blue volumetric rim lighting. Text on screen: 'Comfort is the quietest killer.'"
      },
      {
        beat: "Scene 3 (8-12s): The Hourglass",
        prompt: "Extreme macro low-angle Dutch tilt shot of a colossal crystalline hourglass suspended in an endless void. Inside, luminescent golden sand grains cascade downwards like glowing liquid ember particles. The stickman character reaches up with both hands in vain, trying to grab the sand, but it dissolves through his fingers like smoke. High-contrast chiaroscuro lighting, deep vignette shadows, dramatic rim lighting highlighting the fragile silhouette. Audio cue: Glass reverberation and wind gust."
      },
      {
        beat: "Scene 4 (13-16s): The Katana Stance",
        prompt: "Sudden whip-pan transition to a windswept mountain cliff edge during an electric thunderstorm. The stickman sheds the slouching modern hoodie, revealing traditional black hakama warrior attire and unsheathing a glowing white ink katana with razor-sharp reflection. Electric lightning strikes illuminate the background in violent split-second flashes. The character drops into a grounded, disciplined martial arts stance, eyes narrowed with resolute focus. Audio cue: Crisp steel unsheathing sound (katana shing)."
      },
      {
        beat: "Scene 5 (17-21s): The Breakthrough Slash",
        prompt: "Dynamic tracking shot following an explosive, full-body forward leap. The stickman executes a blinding horizontal sword slash across the digital notification cage. The invisible prison shatters into millions of glowing geometric glass fragments that explode outward in 120fps super slow motion, scattering across the screen like sparkling stardust. High-energy ink splash calligraphy effects ripple across the impact point. Audio cue: Glass shattering thunderclap."
      },
      {
        beat: "Scene 6 (22-26s): The Mountain Ascent",
        prompt: "Wide sweeping crane shot tracking the stickman sprinting relentlessly up the razor-thin ridge of a towering jagged mountain peak against ferocious gale-force winds and swirling crimson cherry blossom petals. The dark storm clouds begin to part beneath his feet, revealing an ocean of rolling white mist. Camera follows at a heroic 45-degree low angle, conveying unstoppable momentum and inner resilience."
      },
      {
        beat: "Scene 7 (27-30s): Sunrise Victory",
        prompt: "Epic stationary wide shot atop the summit of Mount Fuji at dawn. The stickman stands tall and serene, sword safely sheathed, gazing out at the blazing golden-orange sun rising above a sea of clouds. Warm amber rim lighting bathes the entire character outline in radiant light. Soft lens flare drifts across the upper right frame. On-screen text: 'Win the morning. Master your decade.' Audio cue: Triumphant orchestral swell fading into morning birdsong."
      }
    ]
  },
  {
    id: "story-2",
    title: "How Long Would You Survive in Every Era of Earth?",
    views: "18.2M Views",
    channel: "@Inkexplainer96",
    hook: "If a time machine dropped you onto ancient Earth right now, you wouldn't last 12 minutes without modern shelter.",
    scenes: [
      { beat: "Scene 1: Jurassic Drop", prompt: "A minimalist stickman abruptly materializing from a swirling blue vortex, crashing onto a muddy primeval fern floor. In the misty background, a towering 40-foot Tyrannosaurus rex opens its jaws with dripping crimson saliva, casting an immense predatory shadow. Volumetric sun rays pierce the thick prehistoric canopy." },
      { beat: "Scene 2: Ice Age Shiver", prompt: "Stickman trudging through waist-deep snow during a howling sub-zero blizzard. Clad in rough mammoth pelt with breath freezing instantly into ice particles. Deep sabertooth tiger claw prints encircle the character in a menacing arc. Chilling cyan and slate-gray palette." },
      { beat: "Scene 3: Ancient Egypt Quarry", prompt: "Scorching Sahara midday heat, blinding golden sunlight. The stickman character heaves on thick hemp ropes dragging a massive 5-ton limestone block across wooden rollers. In the distant horizon, the gleaming Great Pyramid stands sharp against a cloudless lapis-lazuli sky." },
      { beat: "Scene 4: Roman Colosseum Duel", prompt: "Low-angle dynamic tracking shot inside a dusty amphitheater arena. The stickman holds a battered wooden gladius and scutum shield as 50,000 roaring Roman spectators cheer from shaded stone arches above. An armored centurion advances with spear raised." },
      { beat: "Scene 5: Medieval Catapult Siege", prompt: "Midnight rain pouring over stone fortress battlements. Flaming pitch boulders launched from distant trebuchets streak across the black night sky, crashing into ramparts with showering sparks. Stickman archer draws longbow with burning arrow aimed at the dark breach." },
      { beat: "Scene 6: Victorian Industrial Smog", prompt: "Thick yellowish soot and steam billowing from brick factory towers in 1880s London. The stickman navigates a narrow cobblestone alleyway packed with roaring iron gear machinery and glowing copper furnaces. Gritty sepia ink aesthetic." },
      { beat: "Scene 7: Modern Sanctuary Gratitude", prompt: "Warm, peaceful interior shot of a modern apartment at dusk. The stickman sits curled in an ergonomic armchair sipping steaming coffee, looking out rain-streaked window at the safe city skyline. Golden ambient lamp glow fills the room with profound comfort and relief." }
    ]
  },
  {
    id: "story-3",
    title: "Your Entire Life as an Ancient Human",
    views: "12.8M Views",
    channel: "@Inkexplainer96",
    hook: "10,000 years ago, your 20th birthday meant you were already an elder in your tribe fighting for daily survival.",
    scenes: [
      { beat: "Scene 1: Cave Birth & Embers", prompt: "Intimate close-up of newborn stickman wrapped in wolf pelt next to a crackling fire pit inside a deep sandstone cavern. The cavern walls are covered in red-ochre handprints and running bison sketches, illuminated by dancing orange flame shadows." },
      { beat: "Scene 2: Flint Spearhead Lesson", prompt: "Starlit African savanna night. A wizened tribal elder stickman guides the young character's hands to strike flint against obsidian, creating sharp spear tips with flying amber sparks. Ancient baobab tree silhouetted against the glowing Milky Way." },
      { beat: "Scene 3: The Great Mammoth Hunt", prompt: "Ultra-wide cinematic tracking shot across sweeping grassland. Ten stickman hunters run in synchronized coordination, stone-tipped spears raised, tracking a colossal woolly mammoth through a narrow rocky canyon." },
      { beat: "Scene 4: Escaping Savanna Wildfire", prompt: "Blazing crimson night horizon as dry brush explodes into a wall of flame following a lightning strike. The entire tribe flees across ridge lines, glowing smoke billowing high into the atmosphere." },
      { beat: "Scene 5: Winter Cave Hearth", prompt: "Sub-zero blizzard outside cave entrance, but inside, tribal members huddle warmly together sharing roasted root vegetables and storytelling with expressive hand gestures. Cozy amber chiaroscuro lighting." },
      { beat: "Scene 6: The Council Fire", prompt: "Full moon overhead. The stickman, now scarred and seasoned with bone necklaces, speaks to the tribe around the sacred council fire, passing down ancient hunting territory folklore." },
      { beat: "Scene 7: Eternal Cave Handprint", prompt: "Solemn, beautiful macro shot of the elder stickman pressing an ochre-stained palm firmly onto the cool limestone wall. Camera pulls back slowly through the cave entrance into the vast starry cosmos, leaving humanity's eternal mark." }
    ]
  },
  {
    id: "story-4",
    title: "Why Did Ancient Humans Evolve in Africa?",
    views: "8.4M Views",
    channel: "@Inkexplainer96",
    hook: "Why did every modern human on Earth originate from the East African Rift Valley instead of Europe or Asia?",
    scenes: [
      { beat: "Scene 1: The Great Rift Valley", prompt: "Colossal aerial drone shot overlooking the tectonic split of the East African Rift Valley under dramatic storm clouds. Red earth, sprawling acacia trees, and dramatic volcanic fissures stretching to the horizon." },
      { beat: "Scene 2: Jungle to Savanna Shift", prompt: "Timelapse visual transition showing lush rainforest trees slowly thinning into open sun-baked grasslands due to shifting planetary weather cycles. Stickman ancestor peering cautiously from tree branch." },
      { beat: "Scene 3: The First Bipedal Stance", prompt: "Ground-level low angle shot. The stickman ancestor lowers its arms from the ground and stands fully upright on two feet for the first time, rising above tall golden savannah grass to gaze into the vast distance." },
      { beat: "Scene 4: The Midday Persistence Hunt", prompt: "Blazing midday sun beating down at 45°C. Stickman jogging at steady endurance pace across cracked earth, outlasting a panting gazelle through human sweating and stamina. Heat mirage shimmering in air." },
      { beat: "Scene 5: Taming the Fire Ember", prompt: "Dramatic close-up of stickman striking two stones together until a glowing spark ignites dried tinder. Eyes widen with wonder as humanity masters its first external source of energy." },
      { beat: "Scene 6: The Out-of-Africa Migration", prompt: "Long line of migrating stickmen crossing the Sinai desert dunes under twilight, silhouettes carrying woven baskets and flint tools into the unknown horizon." },
      { beat: "Scene 7: One Global Ancestry", prompt: "Stickman hands of diverse shading reaching toward the center frame, holding a beautifully glowing blue marble Earth. On-screen text: '8 Billion People. One Single Homeland.'" }
    ]
  },
  {
    id: "story-5",
    title: "Why Human Progress Exploded 10,000 Years Ago",
    views: "9.5M Views",
    channel: "@Inkexplainer96",
    hook: "For 300,000 years humans lived as foragers without building anything. Then suddenly, everything exploded.",
    scenes: [
      { beat: "Scene 1: 300,000 Years of Foraging", prompt: "Stickman carrying wooden digging stick across empty endless tundra landscape. Monochromatic gray ink palette conveying hundreds of millennia of static survival without permanent structures." },
      { beat: "Scene 2: The First Wheat Seed", prompt: "Sunlight breaking through clouds onto fertile silt riverbank. Stickman kneeling gently, pressing wild einkorn wheat seeds into the black soil using a pointed bone dibble." },
      { beat: "Scene 3: First Mud-Brick Settlement", prompt: "Cluster of circular sun-dried mud huts rising along the Euphrates river. Stickmen digging irrigation ditches and building shared clay ovens, community blooming." },
      { beat: "Scene 4: The Grain Surplus", prompt: "Inside a dry clay storehouse, stickman stacking woven baskets of golden grain. For the first time in history, humans have food for next winter, unlocking free time for invention." },
      { beat: "Scene 5: Invention of Writing", prompt: "Macro shot of a reed stylus pressing crisp wedge-shaped cuneiform symbols into a wet clay tablet by oil lamp light. Commercial trade is born." },
      { beat: "Scene 6: Bronze Foundry Sparks", prompt: "Glowing crucible of molten copper and tin poured into carved sandstone axe molds. Brilliant orange sparks shower across dark foundry floor." },
      { beat: "Scene 7: From Ziggurat to Space Rocket", prompt: "Timelapse camera tilting straight up from the top of an ancient Mesopotamian ziggurat through centuries of architecture to a modern Saturn V rocket blasting toward the stars." }
    ]
  },
  {
    id: "story-6",
    title: "What Did Ancient Humans Actually Do All Night?",
    views: "12.4M Views",
    channel: "@Inkexplainer96",
    hook: "With no electricity, no phones, and 12 hours of total pitch darkness, how did ancient humans survive the night?",
    scenes: [
      { beat: "Scene 1: The Twilight Perimeter", prompt: "Sun slipping below the jagged mountain horizon, throwing deep purple shadows across the valley. Stickman hurried to stoke roaring thorn-bush bonfires guarding cave entrance." },
      { beat: "Scene 2: Glowing Eyes in the Dark", prompt: "POV from cave looking outward into absolute pitch black. Fifty yards away in the tall grass, two pairs of luminous predator eyes catch the firelight and watch hungrily." },
      { beat: "Scene 3: Oral Tradition by Flame", prompt: "Twelve stickman tribe members huddled in a tight circle around roaring campfire, elder gesturing dramatically while recounting creation myths and ancestral battles." },
      { beat: "Scene 4: The Milky Way Observatory", prompt: "Stickman lying back on smooth boulder staring straight up into the unpolluted night sky. Millions of sharp stars and the violet cosmic ribbon of the galaxy mapping the seasons." },
      { beat: "Scene 5: The Night Craftsman", prompt: "Quiet ember glow illuminating stickman meticulously binding a razor obsidian blade to polished hardwood spear shaft using sinew and tree resin." },
      { beat: "Scene 6: The Watchman's Shift", prompt: "Solitary sentinel stickman standing guard with burning pine torch while the tribe sleeps peacefully in mammoth fur blankets, smoke drifting into cold night air." },
      { beat: "Scene 7: Golden Dawn Awakening", prompt: "Blazing golden sunrise breaking over the savannah. Birds burst into song, and stickmen emerge from the cave stretching victoriously, greeting another day conquered." }
    ]
  },
  {
    id: "story-7",
    title: "How Ancient Humans Survived the Deadliest Predators",
    views: "22.7M Views",
    channel: "@Inkexplainer96",
    hook: "We have no claws, no fangs, and run slower than a dog. So how did humans hunt giant sabertooths to extinction?",
    scenes: [
      { beat: "Scene 1: Sabertooth Ambush", prompt: "Massive Smilodon with 8-inch curved fangs crouched on high sandstone boulder above solitary stickman forager, tensed shoulder muscles ready to strike." },
      { beat: "Scene 2: Bone Whistle Signal", prompt: "Stickman instantly draws carved vulture-bone whistle and blows high-frequency alert. Acoustic soundwaves visibly ripple through canyon walls." },
      { beat: "Scene 3: The Flaming Wall of Torches", prompt: "Eight stickmen burst from brush in disciplined phalanx, thrusting roaring pine-pitch torches forward. Terrified predator recoils from the blazing heat." },
      { beat: "Scene 4: The Atlatl Physics Advantage", prompt: "Stickman loading a 6-foot dart into an atlatl spear-thrower. Slow motion reveals mechanical lever arm launching dart at 100 mph with lethal armor-piercing kinetic force." },
      { beat: "Scene 5: The Disguised Pit Trap", prompt: "Charging beast crashing through leaf-covered branch grating into deep defensive trench lined with sharpened stakes. Human strategic planning overcoming raw brute force." },
      { beat: "Scene 6: First Wolf Alliance", prompt: "Gentle campfire scene. Stickman kneeling beside injured gray wolf, offering roasted bone. The wolf rests its chin on stickman knee, forging humanity's greatest interspecies partnership." },
      { beat: "Scene 7: Apex of the Planet", prompt: "Epic wide shot. Stickman standing on highest cliff peak with tame wolf at side, watching sunset over primeval valley. Uncontested master of the natural world." }
    ]
  },
  {
    id: "story-8",
    title: "The 3 AM Phone Trap: Dopamine Detox",
    views: "14.1M Views",
    channel: "@Inkexplainer96",
    hook: "It's 3:17 AM. You promised yourself you'd sleep at 11. Why does your thumb keep scrolling like a zombie?",
    scenes: [
      { beat: "Scene 1: Blue Light Zombie", prompt: "Dark bedroom, stickman lying in bed in foetal position with face bathed in harsh, eerie 8000K smartphone blue light. Hollow ink eyes staring blankly into infinite scroll feed." },
      { beat: "Scene 2: The Infinite Dopamine Treadmill", prompt: "Surreal visual: stickman running endlessly on a giant hamster wheel powered by glowing red hearts, retweet icons, and view counters that never stop spinning." },
      { beat: "Scene 3: The Algorithm's Puppet Strings", prompt: "Glowing fiber-optic wires dangling from giant cloud servers overhead, puppeteering the stickman thumb in rapid flicking motions while brain energy drains away." },
      { beat: "Scene 4: The Power-Off Decision", prompt: "Stickman suddenly stops. Hands shake. With immense willpower, fingers press the side button, screen goes black, and stickman drops phone into a wooden desk drawer across the room." },
      { beat: "Scene 5: Deep REM Recovery", prompt: "Serene bedroom bathed in soft moonlight. Stickman sleeping soundly with calm slow breathing, brain surrounded by soothing cool indigo waves of restorative rest." },
      { beat: "Scene 6: 6:00 AM Natural Awakening", prompt: "Morning sun bursting through curtains. Stickman waking energized without alarm, drinking a cold glass of lemon water with focused posture." },
      { beat: "Scene 7: The Unbroken Creation State", prompt: "Clean sunlit wooden desk with coffee, sketchpad, and laptop. Stickman working in complete undisturbed flow state with zero digital distractions." }
    ]
  },
  {
    id: "story-9",
    title: "Samurai Discipline vs Modern Laziness",
    views: "11.9M Views",
    channel: "@Inkexplainer96",
    hook: "A 16th-century samurai woke up at 4 AM to practice sword kata in freezing waterfalls. You hit snooze 4 times.",
    scenes: [
      { beat: "Scene 1: The Freezing Waterfall", prompt: "Winter dawn in Kyoto mountains. Samurai stickman standing completely still under roaring icy mountain waterfall, hands pressed in prayer, breath steaming in crisp morning air." },
      { beat: "Scene 2: Modern Snooze Habit", prompt: "Warm messy modern bedroom at 7:30 AM. Sluggish modern stickman burying face under blanket, lazily slapping smartphone alarm snooze button for the fourth time." },
      { beat: "Scene 3: The 7 Virtues of Bushido", prompt: "Seven massive Japanese calligraphy kanji characters (Gi, Yu, Jin, Rei, Makoto, Meiyo, Chugi) glowing in golden ink floating in a serene zen garden temple courtyard." },
      { beat: "Scene 4: Duel with the Sloth Demon", prompt: "Psychological battle arena. Modern stickman confronts a looming dark ink demon representing procrastination and comfortable excuses." },
      { beat: "Scene 5: The Decisive Bokken Cut", prompt: "Stickman grips wooden practice sword with both hands, stepping forward with thunderous kiai yell, cutting cleanly through the shadow demon with laser focus." },
      { beat: "Scene 6: Daily Iron Routine", prompt: "Split-screen montage: stickman training in morning mist, reading difficult books by desk lamp, and pushing physical limits through daily unwavering repetition." },
      { beat: "Scene 7: The Unshakable Mind", prompt: "Samurai stickman sitting in quiet seiza meditation on polished wooden temple veranda, cherry blossoms gently falling. Complete inner mastery." }
    ]
  },
  {
    id: "story-10",
    title: "The 100-Year Life Perspective",
    views: "16.5M Views",
    channel: "@Inkexplainer96",
    hook: "If you lived to 100, that is roughly 5,200 weeks. Most people have already spent half of them worrying about nothing.",
    scenes: [
      { beat: "Scene 1: The 5,200 Marble Grid", prompt: "Stickman walking through a grand museum hall with a massive wall displaying 5,200 small glass marbles arranged in a grid, each marble representing one week of life." },
      { beat: "Scene 2: Youth in the Sun", prompt: "First 1,000 marbles glow golden-yellow: young stickman running barefoot through sunlit dandelion field chasing paper airplanes with boundless joyful laughter." },
      { beat: "Scene 3: The 20s & 30s Hustle", prompt: "Middle marbles pulsing electric blue: stickman burning late-night oil building dreams, navigating career storms, and celebrating hard-fought victories." },
      { beat: "Scene 4: The Shared Table", prompt: "Warm family kitchen: stickman surrounded by friends and loved ones passing bowls of steaming food, shared stories and heartfelt smiles lighting the room." },
      { beat: "Scene 5: Letting Go of the Heavy Bag", prompt: "High canyon bridge: stickman takes off heavy stone backpack engraved with 'What Others Think of Me' and drops it into the bottomless abyss, smiling freely." },
      { beat: "Scene 6: Planting the Oak Tree", prompt: "Stickman on green rolling hill carefully planting a young oak sapling, watering it knowing he will never sit beneath its full shade. Creating generational legacy." },
      { beat: "Scene 7: Sunset on the Ocean Summit", prompt: "Elderly stickman with wooden staff sitting peacefully on wooden bench overlooking a golden sunset ocean. The final marble glows softly in hand. Total serenity and fulfilled life." }
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
    color: "from-blue-500/15 to-blue-500/5",
    border: "border-blue-500/30"
  },
  {
    time: "00:10 - 00:20",
    duration: "10 Min",
    phase: "Step 2: 5-Stage Storyboard Prompts",
    desc: "Select 1 of 16 Locked Character Style Engines (e.g. Modern Beanie Zeke or Edo Samurai). Generate 7 beat-by-beat scene prompts with frozen visual anatomy.",
    icon: "🎨",
    color: "from-purple-500/15 to-purple-500/5",
    border: "border-purple-500/30"
  },
  {
    time: "00:20 - 00:30",
    duration: "10 Min",
    phase: "Step 3: Neural Voiceover & Subtitles",
    desc: "Select natural voice (Christopher for deep English or Madhur for natural Hindi). Generate crystal-clear audio and export word-by-word synced .srt subtitles.",
    icon: "🎙️",
    color: "from-amber-500/15 to-amber-500/5",
    border: "border-amber-500/30"
  },
  {
    time: "00:30 - 00:40",
    duration: "10 Min",
    phase: "Step 4: CapCut / Web Video Assembly",
    desc: "Drop the 7 generated scene clips and neural voice track into CapCut (or use Web Video Exporter). Apply Hormozi bold captions and speed ramps.",
    icon: "🎬",
    color: "from-emerald-500/15 to-emerald-500/5",
    border: "border-emerald-500/30"
  },
  {
    time: "00:40 - 00:45",
    duration: "5 Min",
    phase: "Step 5: Publish & Algorithm Optimization",
    desc: "Export 9:16 vertical video (1080x1920, 60fps). Post to YouTube Shorts, Instagram Reels, and TikTok using high-CTR stickman tags.",
    icon: "🚀",
    color: "from-rose-500/15 to-rose-500/5",
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

// ══════════════════════════════════════════════════════════════════════════════
// LAUNCHERS CONFIGURATION (Matches Image 3 Reference)
// ══════════════════════════════════════════════════════════════════════════════
const MULTI_PLATFORM_LAUNCHERS = [
  {
    os: "Windows 10 / 11",
    file: "File: Launch_StickMotion_Windows.bat",
    desc: "Double-click to start local engine and open Chrome/Edge instantly at :8080. Includes Silent VBS launcher for background execution.",
    badge: "1-Click .bat",
    IconComponent: WindowsIcon
  },
  {
    os: "macOS (Apple Silicon & Intel)",
    file: "File: Launch_StickMotion_Mac.command",
    desc: "Native double-clickable launcher with automated chmod +x permissions and Safari/Chrome integration.",
    badge: "1-Click .command",
    IconComponent: AppleIcon
  },
  {
    os: "Chrome & Edge Extension",
    file: "File: extension/ (Manifest V3)",
    desc: "Side-panel stickman director extension. Generate prompts, copy story packs, and monitor YouTube radar right inside your browser.",
    badge: "Chrome Web Store Ready",
    IconComponent: ChromeIcon
  },
  {
    os: "Android Mobile PWA",
    file: "File: manifest.json & sw.js",
    desc: "Install directly from browser to Android home screen. Offline caching, responsive touch UI, and mobile script generator.",
    badge: "Install to Home Screen",
    IconComponent: AndroidIcon
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

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
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-amber-500 font-bold transition shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer shadow-sm text-xs font-semibold"
              title="Share Product Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Product</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════
              HERO & PRICING SPLIT GRID
          ═══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left 7 Columns: Core Value & Visual Experience */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  {product.badge}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  ⚡ Instant Universal Download
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  🛡️ 100% Commercial Rights
                </span>
              </div>

              <h1 className="text-2xl sm:text-3.5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* ═══════════════════════════════════════════════════
                  GLOWING MULTI-DEVICE DOWNLOAD BANNER
              ═══════════════════════════════════════════════════ */}
              <div className="relative overflow-hidden p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/40 dark:border-amber-400/40 shadow-lg space-y-2 text-slate-900 dark:text-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 fill-current text-amber-600 dark:text-amber-400" />
                      <span>Instant Universal Download on Any Device</span>
                    </span>
                  </div>
                  <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-600/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40">
                    Zero Install • Runs Completely Offline
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  📥 Download once and run on <strong className="text-amber-800 dark:text-amber-300 font-black">Windows 10/11</strong>, <strong className="text-blue-800 dark:text-blue-300 font-black">macOS</strong>, <strong className="text-emerald-800 dark:text-emerald-300 font-black">Android Phones</strong>, or as a <strong className="text-purple-800 dark:text-purple-300 font-black">Chrome/Edge Extension</strong>. Double-click to launch in any browser — zero complex command line or node setup required!
                </p>
              </div>

              {/* Product Visual Banner */}
              <div className="relative w-full h-56 sm:h-80 rounded-3xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-md group">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {product.subtitle}
              </p>

              {/* Verified Product Quality Rating */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <span>★★★★★</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">5.0</span>
                  <span className="text-[var(--text-muted)] font-medium">
                    (Verified Creator Rated)
                  </span>
                </div>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
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
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
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
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${activeGalleryTab === "all" ? "bg-amber-500 text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                      >
                        All (16)
                      </button>
                      <button
                        onClick={() => setActiveGalleryTab("gifs")}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${activeGalleryTab === "gifs" ? "bg-amber-500 text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                      >
                        🎬 9 GIFs
                      </button>
                      <button
                        onClick={() => setActiveGalleryTab("scenes")}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${activeGalleryTab === "scenes" ? "bg-amber-500 text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover/card:text-amber-500 block text-center truncate px-1 py-0.5">
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
                  <h3 className="font-bold text-xs uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <span>The Problem It Solves:</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-1 font-medium">
                    {product.problemSolved}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
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
              <div className="sticky top-6 p-6 rounded-3xl bg-[var(--bg-surface)] border-2 border-amber-400/40 shadow-2xl space-y-5">

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                      ${product.priceUSD}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] line-through">
                      ${product.originalPriceUSD}
                    </span>
                    <span className="ml-auto px-2 py-0.5 rounded-md text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
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
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Get Instant Access (${product.priceUSD})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {/* Universal Payment Guarantee */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1.5 text-xs">
                  <div className="font-bold text-[var(--text-primary)] text-[11.5px] flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Universal Smart Checkout (USD & UPI)</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    International buyers pay via Stripe (Credit Card, Apple Pay). Indian buyers can pay via UPI with instant automatic currency conversion on Topmate.
                  </p>
                </div>

                {/* Trust Inclusions */}
                <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                    <span>Instant on-screen & email digital download link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                    <span>Commercial white-label license included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {isAutoPilot
                        ? "31-Page Master Guide (PDF) + 20 Claude Prompts"
                        : isStickMotion
                          ? "Complete Production Kit (.zip) + Master Manual"
                          : "Instant Production Files + Full Assets"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              STICKMOTION: 30-DAY DAILY UPLOAD ROUTINE & ROADMAP
          ═══════════════════════════════════════════════════ */}
          {isStickMotion && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-amber-400/30 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 inline-block mb-1">
                    Clockwork Daily System
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    30-Day Daily Upload Routine & Beginner Roadmap
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                    A strictly engineered 45-minute daily production routine. From zero followers to YouTube monetization.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-4 h-4" />
                  <span>45 Minutes / Day Total</span>
                </div>
              </div>

              {/* 5-Step Daily Clockwork Routine */}
              <div className="space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
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
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/10 dark:bg-black/40 text-amber-800 dark:text-amber-300 font-mono">
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
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
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
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">{w.week}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
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
              STICKMOTION: 10 READY-MADE VIRAL STORY PACKS WITH LOCK
          ═══════════════════════════════════════════════════ */}
          {isStickMotion && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 inline-block mb-1">
                    YouTube Ranked Series (18M+ Views)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    10 Ready-Made Viral Story Prompt Packs
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                    Curated directly from @Inkexplainer96 viral master hits. Detailed 7-scene narrative formulas with frozen character continuity.
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock All 10 Packs ($19)</span>
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
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer space-y-1 ${isActive
                        ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm"
                        : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold">Story #{idx + 1}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{story.views}</span>
                      </div>
                      <p className="text-[11px] font-bold line-clamp-1 leading-tight">
                        {story.title}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Active Story Details */}
              {INK_EXPLAINER_STORIES[activeStoryIndex] && (
                <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          STORY #{activeStoryIndex + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
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
                      onClick={handleCheckout}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-sm active:scale-95"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock All Prompts</span>
                    </button>
                  </div>

                  {/* Hook Box */}
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block font-bold">
                      🎣 3-Second Golden Hook (Script & Audio):
                    </span>
                    <p className="text-xs sm:text-sm text-[var(--text-primary)] font-semibold italic">
                      "{INK_EXPLAINER_STORIES[activeStoryIndex].hook}"
                    </p>
                  </div>

                  {/* 7 Beat Scene Prompts with Paywall Lock */}
                  <div className="space-y-3 relative">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      🎬 7-Scene Narrative Prompts (Universal Diffusion Formula):
                    </span>

                    {/* Scene 1: Fully Visible Free Sample */}
                    <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-amber-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{INK_EXPLAINER_STORIES[activeStoryIndex].scenes[0].beat} (Free Sample)</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active Sample
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        {INK_EXPLAINER_STORIES[activeStoryIndex].scenes[0].prompt}
                      </p>
                    </div>

                    {/* Scenes 2 to 7: Blurred Behind Lock Paywall */}
                    <div className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 filter blur-[5px] select-none pointer-events-none opacity-40">
                        {INK_EXPLAINER_STORIES[activeStoryIndex].scenes.slice(1).map((sc, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1"
                          >
                            <span className="font-bold text-amber-500 text-[10.5px] block">{sc.beat}</span>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                              {sc.prompt}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Floating Lock Paywall Overlay */}
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-[3px] rounded-2xl space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-white">
                            70 Beat-by-Beat Production Prompts Locked
                          </h4>
                          <p className="text-xs text-white/80 max-w-md mt-1 font-medium">
                            Includes complete scene directions, 85mm camera angles, lighting prompts, and character lock seeds across all 10 viral hit packs.
                          </p>
                        </div>
                        <button
                          onClick={handleCheckout}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs transition shadow-xl shadow-amber-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Unlock All 10 Packs ($19) — Included in Complete Kit</span>
                        </button>
                        <span className="text-[10px] text-white/70 font-mono">
                          Instant Digital Download • Lifetime Updates Included
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              CHOOSE HOW YOU WANT TO LAUNCH (MATCHES IMAGE 3)
          ═══════════════════════════════════════════════════ */}
          {isStickMotion && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 inline-block mb-1">
                    GET STARTED ON YOUR DEVICE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    Choose how you want to launch
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                    Pick the option that matches your device. Each launcher is designed to run the StickMotion Studio locally with minimal setup.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)] self-start sm:self-auto">
                  [4 LAUNCH OPTIONS]
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MULTI_PLATFORM_LAUNCHERS.map((launcher, idx) => {
                  const Icon = launcher.IconComponent;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Icon className="w-7 h-7" />
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                            {launcher.badge}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                          {launcher.os}
                        </h4>
                        <div className="inline-block px-2.5 py-1 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/80 dark:border-amber-500/40">
                          <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 block">
                            {launcher.file}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                          {launcher.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Callout Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[var(--text-primary)]">Quick guide:</strong> Windows and Mac are desktop launchers; Chrome & Edge is a browser extension; Android PWA is the installable mobile app for your phone.
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              AUTOPILOT: 7-STAGE CONNECTED AUTOMATION ARCHITECTURE
          ═══════════════════════════════════════════════════ */}
          {isAutoPilot && (
            <div className="space-y-6">

              {/* 1. 7-Stage Operating Loop */}
              <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-orange-500/30 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30 inline-block mb-1">
                      Connected System Architecture
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                      The 7-Stage AI Business OS Operating Loop
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                      Claude is the brain. Automation tools are the hands. Google Sheet is the memory. You are the heart.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-orange-500/30 text-orange-600 dark:text-orange-400 self-start sm:self-auto">
                    7-Step Feedback Loop
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
                  {AUTOPILOT_FLOW_STAGES.map((st, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">
                          Stage {i + 1}
                        </span>
                        <h4 className="text-xs font-black text-[var(--text-primary)] leading-tight">
                          {st.step.split(". ")[1]}
                        </h4>
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          {st.action}
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] leading-tight pt-1">
                          {st.desc}
                        </p>
                      </div>
                      <div className="text-[9.5px] font-mono text-slate-700 dark:text-slate-400 pt-1.5 border-t border-[var(--border-subtle)]">
                        🛠️ {st.tool}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Complete 16-Part Playbook Curriculum */}
              <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 inline-block mb-1">
                      31-Page Master Handbook
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                      Complete 16-Part Playbook Curriculum
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                      Everything written in simple, actionable English so you can copy, adapt, and run.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)] self-start sm:self-auto">
                    31 Pages • 16 Core Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {AUTOPILOT_MODULES.map((mod) => (
                    <div key={mod.part} className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-orange-500/40 transition space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-700 dark:text-orange-400 font-mono">
                          Part {mod.part}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] font-medium">{mod.pages}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] leading-snug">
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. 20 Claude Production Prompts Library with Lock */}
              <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-orange-500/30 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30 inline-block mb-1">
                      Copy-Paste Prompts
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                      20 Production Claude Prompts Library
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                      Copy these battle-tested prompts directly into your Claude project instructions and chats.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-orange-500/30 text-orange-600 dark:text-orange-400 self-start sm:self-auto">
                    20 Battle-Tested Prompts
                  </span>
                </div>

                {/* Free Samples: Prompts 1 & 2 */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Free Unlocked Sample Prompts (Test in Claude Right Now):</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AUTOPILOT_PROMPTS.slice(0, 2).map((pr) => (
                      <div key={pr.num} className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-emerald-500/30 space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono">
                            FREE SAMPLE • {pr.tag}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pr.preview);
                              toast.success(`${pr.name} copied to clipboard!`);
                            }}
                            className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Prompt</span>
                          </button>
                        </div>
                        <h4 className="text-sm font-black text-[var(--text-primary)]">{pr.name}</h4>
                        <pre className="text-xs font-mono bg-black/40 dark:bg-black/60 p-3 rounded-xl border border-[var(--border-subtle)] whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed max-h-36 overflow-y-auto">
                          {pr.preview}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paywalled Prompts 3 to 20 */}
                <div className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] p-4 bg-[var(--bg-canvas)]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 filter blur-xs select-none opacity-30 pointer-events-none">
                    {AUTOPILOT_PROMPTS.slice(2, 11).map((pr) => (
                      <div key={pr.num} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1">
                        <span className="text-[10px] font-bold text-orange-500">{pr.tag}</span>
                        <h5 className="text-xs font-bold text-[var(--text-primary)]">{pr.name}</h5>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">{pr.preview}</p>
                      </div>
                    ))}
                  </div>

                  {/* Lock Overlay */}
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-500/20">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        🔒 18 Production Claude Prompts Locked
                      </h3>
                      <p className="text-xs text-slate-300 max-w-md mt-1 font-medium">
                        Includes Lead Scoring, 4-Stage Follow-Up Sequence, Reel Scripts Generator, Ad Copy Matrix, Objection Handler, and Friday Report prompts.
                      </p>
                    </div>
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:to-amber-400 text-black font-black text-xs transition shadow-xl shadow-orange-500/30 flex items-center gap-2 cursor-pointer no-underline"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Unlock Complete AI Business OS ($5) — Topmate Instant Delivery</span>
                    </a>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Instant PDF Download • Lifetime Commercial License Included
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Ready-to-Post Viral Instagram Caption & Hashtags */}
              <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30 inline-block mb-1">
                      Plug & Play Viral Social Asset
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                      Official FondPeace Launch Caption & Hashtag Bank
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                      Use this exact high-performing caption for your Instagram Reels, Facebook posts, and carousels.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCaption}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 self-start sm:self-auto"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{captionCopied ? "✓ Copied to Clipboard!" : "Copy Caption & Hashtags"}</span>
                  </button>
                </div>

                <pre className="text-xs font-mono bg-black/40 dark:bg-black/60 p-4 rounded-2xl border border-[var(--border-subtle)] whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed max-h-72 overflow-y-auto">
                  {AUTOPILOT_VIRAL_CAPTION.text}
                </pre>
              </div>

              {/* 5. Product Ladder Pricing Tiers */}
              <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-block mb-1">
                    Value Ladder Architecture
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    Start Small, Scale Big (Product Ladder)
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                    Designed so beginners can start with simple tools and scale to full automated business operations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2">
                    <span className="text-xs font-bold text-slate-500">Tier 1 • Lead Magnet</span>
                    <h4 className="text-base font-black text-[var(--text-primary)]">Free Checklist</h4>
                    <div className="text-2xl font-black text-emerald-500">$0 / ₹0</div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      1-page quick checklist sent via automated DM when users comment "AUTOMATE".
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2">
                    <span className="text-xs font-bold text-slate-500">Tier 2 • Starter</span>
                    <h4 className="text-base font-black text-[var(--text-primary)]">Starter Guide</h4>
                    <div className="text-2xl font-black text-[var(--text-primary)]">$3 / ₹199</div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Complete 31-page AI Business OS PDF guide with all 16 core chapters.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-500/10 border-2 border-orange-500 space-y-2 shadow-lg relative">
                    <span className="absolute -top-2.5 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500 text-black">
                      Included in this Kit
                    </span>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Tier 3 • Full System</span>
                    <h4 className="text-base font-black text-[var(--text-primary)]">Pro Pack ($5)</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-orange-500">$5</span>
                      <span className="text-xs text-slate-400 line-through">$19</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      31-page guide, 20 prompts, 40 reel ideas, 10 scripts, 15 captions, and Google Sheet template.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2">
                    <span className="text-xs font-bold text-slate-500">Tier 4 • Personal Setup</span>
                    <h4 className="text-base font-black text-[var(--text-primary)]">1:1 Setup Call</h4>
                    <div className="text-2xl font-black text-[var(--text-primary)]">$79 - $99</div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      45-minute personal 1:1 screen-share setup call to configure Claude & CRM for your business.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              EVERYTHING INCLUDED IN THIS PACKAGE (MATCHES IMAGE 3)
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 inline-block mb-1">
                  YOUR COMPLETE CREATOR TOOLKIT
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  Everything Included in This Package
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                  You get the complete, unredacted production assets immediately upon ordering.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)] self-start sm:self-auto">
                [{product.deliverables.length} FULL PACKAGE]
              </span>
            </div>

            {/* Deliverables Checklist (2 Columns x 6 Rows) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {product.deliverables.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs sm:text-sm text-[var(--text-secondary)] shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-semibold text-[var(--text-primary)] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            {/* Bottom Callout Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[var(--text-primary)]">What this means:</strong>{" "}
                {isAutoPilot
                  ? "Download the 31-page master guide and production prompts immediately, connect your Claude Business Brain with Google Sheets and Meta CRM, and run your customer acquisition and content on autopilot without hiring staff."
                  : isStickMotion
                    ? "Launch the studio on your preferred device, then use the included production tools, story packs, voice frames, publishing routine, and creator research in one package."
                    : "Instant access to all digital assets, production frameworks, and commercial license right after checkout."}
              </p>
            </div>

            {/* Direct ROI Benefits (Real Fayada) */}
            {product.roiBenefits && (
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400">
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
                className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Get Instant Access (${product.priceUSD})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              AUTO-PLAYING REVIEWS CAROUSEL (SOCIAL PROOF)
          ═══════════════════════════════════════════════════ */}
          <StoreReviewsCarousel
            reviews={
              product.testimonials && product.testimonials.length > 0
                ? product.testimonials.map((t, idx) => ({
                  id: `rev-${product.id}-${idx}`,
                  name: t.name,
                  handle: t.handle,
                  role: t.role,
                  avatarBg: isAutoPilot ? "from-orange-500 to-amber-600" : "from-amber-500 to-orange-600",
                  initials: t.name.split(" ").map((n) => n[0]).join(""),
                  rating: t.rating || 5,
                  productName: product.title,
                  text: t.text,
                  date: "Verified Buyer • Recent"
                }))
                : undefined
            }
          />

          {/* ═══════════════════════════════════════════════════
              FAQ ACCORDION
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
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
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center justify-between gap-3 hover:text-amber-500 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
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
                className="px-3 py-1 rounded-lg bg-[var(--bg-canvas)] text-amber-500 font-bold hover:bg-white/10 transition cursor-pointer"
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
