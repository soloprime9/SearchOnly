import Link from 'next/link';
import StatusBar from '@/components/StatusBar';
import LatestVideo from '@/components/LatestVideo';

export const dynamic = 'force-dynamic';

const API_URL = 'https://backendk-z915.onrender.com/post/shorts';
const SECOND_API_URL = 'https://backendk-z915.onrender.com/post';

export async function generateMetadata({ params }) {
  const { videoid: id } = params;

  const siteUrl = `https://www.fondpeace.com/short/${id}`;
  const siteName = 'Fondpeace';

  try {
    const response = await fetch(`${API_URL}?page=1&limit=5`, {
      next: { revalidate: 60 },
    });
    const shortsData = await response.json();

    let post = shortsData?.find?.(item => item._id === id);

    if (!post || !post._id) {
      const res = await fetch(`${SECOND_API_URL}/single/${id}`);
      post = await res.json();
    }

    const TagsList = ["fondpeace, video, short, entertainment,Anupamaa written update, Anupamaa full episode, Ghum Hai Kisikey Pyaar Meiin update, Ghum Hai Kisikey Pyaar Meiin full episode, Yeh Rishta Kya Kehlata Hai update, Yeh Rishta Kya Kehlata Hai full episode, Mangal Lakshmi update, Mangal Lakshmi full episode, Ram Bhavan update, Ram Bhavan full episode, Veer Hanuman update, Veer Hanuman full episode, Mannat Har Khushi Paane Ki update, Mannat Har Khushi Paane Ki full episode, Shiv Shakti Tap Tyaag Tandav update, Shiv Shakti Tap Tyaag Tandav full episode, Pavithram update, Pavithram full episode, Ilakkiya update, Ilakkiya full episode, Heart Beat season 2 update, Heart Beat season 2 full episode, Devika and Danny update, Devika and Danny full episode, Sivarapalli update, Sivarapalli full episode, Sammelanam update, Sammelanam full episode, Taarak Mehta Ka Ooltah Chashmah update, Taarak Mehta Ka Ooltah Chashmah full episode, Wagle Ki Duniya update, Wagle Ki Duniya full episode, Jagriti update, Jagriti full episode, Bheema Andhkaar Se Adhikaar Tak update, Bheema Andhkaar Se Adhikaar Tak full episode, Kaise Mujhe Tum Mil Gaye update, Kaise Mujhe Tum Mil Gaye full episode, Parineeti update, Parineeti full episode, Jamai No.1 update, Jamai No.1 full episode, Megha Barsenge update, Megha Barsenge full episode, Jaadu Teri Nazar update, Jaadu Teri Nazar full episode, Zyada Mat Udd update, Zyada Mat Udd full episode, Meri Bhavya Life update, Meri Bhavya Life full episode, Udne Ki Aasha update, Udne Ki Aasha full episode, Advocate Anjali Awasthi update, Advocate Anjali Awasthi full episode, Bhagya Lakshmi update, Bhagya Lakshmi full episode, Kumkum Bhagya update, Kumkum Bhagya full episode, Pushpa Impossible update, Pushpa Impossible full episode, Shirdi Wale Sai Baba update, Shirdi Wale Sai Baba full episode, Shrimad Ramayan update, Shrimad Ramayan full episode, Tenali Rama update, Tenali Rama full episode, Vasudha update, Vasudha full episode, Indian TV serials 2025, Hindi serials 2025, latest TV serials India, TV serial written updates, watch full episodes online, Desi TV serials, Indian drama series, TV serial gossip, serial news 2025, trending TV shows India, top Indian serials 2025, daily soap updates, serial episode recap, watch serial online, streaming Indian serials, TV serial highlights, serial episode summary, Indian television updates, Star Plus serials, Zee TV serials, Colors TV serials, Sony TV serials, JioCinema serials, Hotstar serials, Netflix India series, Amazon Prime Video India series, Disney+ Hotstar India series, ETV Win series, Asianet serials, Tamil serials 2025, Telugu serials 2025, Malayalam serials 2025, Kannada serials 2025, Bengali serials 2025, Marathi serials 2025, Gujarati serials 2025, Punjabi serials 2025, Odia serials 2025, Assamese serials 2025, best Indian TV shows 2025, top TRP shows India 2025, new Indian serials May 2025, upcoming Indian TV shows 2025, Indian TV serial schedules 2025, Indian TV serial timings 2025, Indian TV serial cast 2025, Indian TV serial storylines 2025, Indian TV serial spoilers 2025, Indian TV serial reviews 2025, Indian TV serial ratings 2025, Indian TV serial episodes 2025, Indian TV serial trailers 2025, Indian TV serial promos 2025, Indian TV serial behind the scenes 2025, Indian TV serial interviews 2025, Indian TV serial news 2025, Indian TV serial updates 2025, Indian TV serial fan theories 2025, Indian TV serial discussions 2025, Indian TV serial forums 2025, Indian TV serial blogs 2025, Indian TV serial recaps 2025, Indian TV serial summaries 2025, Indian TV serial analyses 2025, Indian TV serial critiques 2025, Indian TV serial commentaries 2025, Indian TV serial insights 2025, Indian TV serial breakdowns 2025, Indian TV serial explanations 2025, Indian TV serial interpretations 2025, Indian TV serial perspectives 2025, Indian TV serial opinions 2025, Indian TV serial thoughts 2025, Indian TV serial reactions 2025, Indian TV serial impressions 2025, Indian TV serial feedback 2025, Indian TV serial responses 2025, Indian TV serial observations 2025, Indian TV serial notes 2025, Indian TV serial annotations 2025, Indian TV serial remarks 2025, Indian TV serial statements 2025, Indian TV serial declarations 2025, Indian TV serial announcements 2025, Indian TV serial proclamations 2025, Indian TV serial communications 2025, Indian TV serial messages 2025, Indian TV serial bulletins 2025, Indian TV serial reports 2025, Indian TV serial articles 2025, Indian TV serial features 2025, Indian TV serial stories 2025, Indian TV serial narratives 2025, Indian TV serial accounts 2025, Indian TV serial chronicles 2025, Indian TV serial tales 2025, Indian TV serial yarns 2025, Indian TV serial sagas 2025, Indian TV serial epics 2025, Indian TV serial legends 2025, Indian TV serial myths 2025, Indian TV serial fables 2025, Indian TV serial parables 2025, Indian TV serial allegories 2025, Indian TV serial anecdotes 2025, Indian TV serial memoirs 2025, Indian TV serial biographies 2025, Indian TV serial autobiographies 2025, Indian TV serial diaries 2025, Indian TV serial journals 2025, Indian TV serial logs 2025, Indian TV serial records 2025, Indian TV serial archives 2025, Indian TV serial documents 2025, Indian TV serial files 2025, Indian TV serial data 2025, Indian TV serial information 2025, Indian TV serial intelligence 2025, Indian TV serial knowledge 2025, Indian TV serial wisdom 2025, Indian TV serial understanding 2025, Indian TV serial comprehension 2025, Indian TV serial awareness 2025, Indian TV serial perception 2025, Indian TV serial insight 2025, Indian TV serial acumen 2025, Indian TV serial discernment 2025, Indian TV serial sagacity 2025, Indian TV serial prudence 2025, Indian TV serial foresight 2025, Indian TV serial prescience 2025, Indian TV serial clairvoyance 2025, Indian TV serial intuition 2025, Indian TV serial instinct 2025, Indian TV serial hunch 2025, Indian TV serial gut feeling 2025, Indian TV serial sixth sense 2025, Indian TV serial extrasensory perception 2025, Indian TV serial telepathy 2025, Indian TV serial mind reading 2025, Indian TV serial thought transference 2025, Indian TV serial mentalism 2025, Indian TV serial psychism 2025, Indian TV serial spiritualism 2025, Indian TV serial mysticism 2025, Indian TV serial occultism 2025, Indian TV serial esotericism 2025, Indian TV serial arcane knowledge 2025, Indian TV serial hidden wisdom 2025, Indian TV serial secret teachings 2025, Indian TV serial ancient knowledge 2025, Indian TV serial sacred texts 2025, Indian TV serial scriptures 2025, Indian TV serial holy books 2025, Indian TV serial religious writings 2025, Indian TV serial spiritual literature 2025, Indian TV serial devotional texts 2025, Indian TV serial theological works 2025, Indian TV serial doctrinal treatises 2025, Indian TV serial catechisms 2025, Indian TV serial creeds 2025, Indian TV serial confessions of faith 2025, Indian TV serial religious doctrines 2025, Indian TV serial belief systems 2025, Indian TV serial faith traditions 2025, Indian TV serial religious practices 2025, Indian TV serial rituals 2025, Indian TV serial ceremonies 2025, Indian TV serial worship services 2025, Indian TV serial liturgies 2025, Indian TV serial sacraments 2025, Indian TV serial religious observances 2025, Indian TV serial holy days 2025, Indian TV serial festivals 2025, Indian TV serial religious holidays 2025, Indian TV serial sacred times 2025, Indian TV serial spiritual seasons 2025, Indian TV serial liturgical calendars 2025, Indian TV serial ecclesiastical years 2025, Indian TV serial church calendars 2025, Indian TV serial religious schedules 2025, Indian TV serial devotional routines 2025, Indian TV serial prayer times 2025, Indian TV serial meditation sessions 2025, Indian TV serial spiritual exercises 2025, Indian TV serial religious disciplines 2025, Indian TV serial ascetic practices 2025, Indian TV serial monastic rules 2025, Indian TV serial religious vows 2025, Indian TV serial sacred commitments 2025, Indian TV serial spiritual pledges 2025, Indian TV serial holy oaths 2025, Indian TV serial religious promises 2025, Indian TV serial faith-based resolutions 2025, Indian TV serial spiritual determinations 2025, Indian TV serial religious intentions 2025, Indian TV serial devotional aspirations 2025, Indian TV serial sacred goals 2025, Indian TV serial spiritual objectives 2025, Indian TV serial religious missions 2025, Indian TV serial faith-driven purposes 2025, Indian TV serial divine callings 2025, Indian TV serial holy vocations 2025, Indian TV serial spiritual careers 2025, Indian TV serial religious professions 2025, Indian TV serial ministerial roles 2025, Indian TV serial clerical positions,tellyupdates, telly updates, written update, bhagya lakshmi, yrkkh, ghkkpm, brazzer, xhamster, blacked.com, brazzer.com, jav.guru, trump, mia khalifa, alyx star, angela white, SexVid, XNXX, XVideos, xHamster, YouPorn, Porn, Porn 300, MegaTube, PornHub,PicHunter, HotPornPhotos, Vjav, Zenra, HentaiHaven, Hentaigasm, Fakku, Porcore, CartoonPorno, GayMaleTube, ManPorn, YouPornGay, GayFuror, JustUsBoys, MyPornGay, XXXFollow, TikPorn, Onlyfans, OnlyFans, Lesbian8, GirlsWay, MilfPorn, Nutaku, PornGamesHub, 69Games, GamCore, SexEmulator, Brazzers, Reality Kings, Digital Playground, FapHouse, BangBros, NewSensations, ElegantAngel, Jav HD, NaughtyAmerica, AdultTime, Mofos, Twistys, TeamSkeet, Private, VideoZ, TeenMegaWorld, All Japanese Pass, 18Videoz, DorcelClub, ClubTug, BestPayPornSites, BangStars, RichMen, SexMessenger, AdultFriendFinder, FindAFuckBuddy, Bellesa, Cheex, AVN, Maxim, MensHealth, NakedNews, Forum.AdultDVDTalk, OneNight Friend, Motherless, Fansteek, Porntube, OnlyFaps, Eporner, Omegle, Flingster, Javhd, PrincessCum, BigTitCreampie, Cum4K, CreampieHer, FarEastPornhub, Cat3Korean, Korea1818, Koreaporn.Net, Sexbj, KoreanInHD, Reddit Nsfw, Reddit Gonewild, Reddit Porn, Reddit Hentai, Reddit Ass, Reddit Pussy, Reddit Blowjobs, Reddit Cumsluts, Desipapa, Sunnyleone, Indiangfvideos, Indianbabeshanaya, Indianhiddencams, Fuckmyindiangf, Delhisexchat, Theiindianporn, Jabcomix, Crazyxx3dworld, Welcomix, Orgymania, Savitabhabhi, Tastyblacks, Nudeafrica, Ghettotube, Shegotass, Hoodamateurs, NudoStar, ThotHub, PornTN, DirtyShip, TheLeaksBay, SexyEgirls, BitchesGirls, OnlyFansLeaks.TV, Roundandbrown, Blackvalleygirls, Blackpatrol,Brownbunnies, Blackgfs, Javhihi, Javmost, Javfinder, Javfor, Vjav, Javseen, Javguru, Javout, Javqd, Popjav, Javwhoes, Whatchjavaonline, Kissjav, Xkorean, Javjack, Sextop, Javfun, Javleak, Javbraze, Javfhd, Javdeal, Tushy, Assparade, Holed, Asstraffic, Analized, Teensloveanal, Letstryanal, pornhub, xvideos, xhamster, rutube.ru, yandex, xnxx.tv, Patreon.com, Cityheaven.net, AllBlackX, Hulu, Punishworld.com, xhamster.desi, Dark porn, PornBoss, PornHat, gotporn, Redtube"];
    const content = post?.title?.trim() || 'Watch this short video on Fondpeace';
    const title = content;
    const description = content.slice(0, 160);
    const tagsArray = Array.isArray(post?.tags) ? post.tags : [];
    const keywords = tagsArray.join(', ') + TagsList.join(', ') || TagsList.join(', ');

    const mediaUrl = post?.media || post?.medias?.url;

    if (!mediaUrl) throw new Error('No media URL found');

    const createdAt = post?.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString();
    const updatedAt = post?.updatedAt ? new Date(post.updatedAt).toISOString() : createdAt;

    const username = post?.userId?.username || 'Fondpeace';
    const thumbnailUrl = post?.thumbnail || post?.image || mediaUrl.replace(/\.(mp4|mov|webm)$/, '.jpg') || mediaUrl || "https://www.fondpeace.com/og-image.jpg";


    return {
      title,
      description,
      keywords,
      authors: [{ name: username }],
      alternates: {
        canonical: siteUrl,
      },
      metadataBase: new URL('https://www.fondpeace.com'),
      openGraph: {
        title,
        description,
        url: siteUrl,
        siteName,
        type: 'video.other',
        locale: 'en_US',
        images: [
          {
            url: thumbnailUrl, // ✅ Using thumbnail URL as thumbnail
            width: 1280,
            height: 720,
            alt: content,
          },
        ],
        videos: [
          {
            url: mediaUrl,
            secureUrl: mediaUrl,
            width: 1280,
            height: 720,
            type: 'video/mp4',
          },
        ],
        article: {
          authors: [username],
          publishedTime: createdAt,
          modifiedTime: updatedAt,
          tags: tagsArray,
        },
      },
      twitter: {
        card: 'player',
        title,
        description,
        site: '@fondpeace',
        creator: '@fondpeace',
        images: [thumbnailUrl], // ✅ Again, using thumbnail as image
        player: mediaUrl,
        playerWidth: 1280,
        playerHeight: 720,
      },
      other: {
        'og:video': mediaUrl,
        'og:video:type': 'video/mp4',
        'og:video:width': '1280',
        'og:video:height': '720',
        'og:video:secure_url': mediaUrl,
        'twitter:player': mediaUrl,
        'twitter:player:width': '1280',
        'twitter:player:height': '720',
        'video:type': 'video/mp4',
        'video:release_date': createdAt,
        'video:modified_date': updatedAt,
        'author': username,
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);

    return {
      title: 'Fondpeace',
      description: 'Watch trending short videos and entertainment on Fondpeace.',
      keywords: 'fondpeace, video, short, entertainment',
      alternates: {
        canonical: siteUrl,
      },
      metadataBase: new URL('https://www.fondpeace.com'),
      openGraph: {
        title: 'Fondpeace',
        description: 'Discover trending short videos and entertainment.',
        type: 'website',
        url: siteUrl,
        siteName,
        images: [],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Fondpeace',
        description: 'Discover trending short videos and entertainment.',
        images: [],
      },
    };
  }
}

export default function Page() {
  // return <LatestVideo />;
}








// // app/short/[id]/page.jsx
// import { FaHeart, FaCommentDots, FaEye, FaShareAlt } from "react-icons/fa";
 
// const API_BASE = "https://backend-k.vercel.app";
// const SITE_ROOT = "https://fondpeace.com";
// const CANONICAL_ROOT = `${SITE_ROOT}/post`; // canonical social page

// /* --------------------------- Helpers --------------------------- */
// function toAbsolute(url) {
//   if (!url) return null;
//   if (url.startsWith("http")) return url;
//   if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
//   return `${SITE_ROOT}/${url}`;
// }

// function secToISO(sec) {
//   if (sec == null) return undefined;
//   const s = Number(sec);
//   if (!s || isNaN(s)) return undefined;
//   const h = Math.floor(s / 3600);
//   const m = Math.floor((s % 3600) / 60);
//   const sLeft = s % 60;
//   let iso = "PT";
//   if (h) iso += `${h}H`;
//   if (m) iso += `${m}M`;
//   if (sLeft || (!h && !m)) iso += `${sLeft}S`;
//   return iso;
// }

// function likesCount(post) {
//   return Array.isArray(post?.likes) ? post.likes.length : 0;
// }
// function commentsCount(post) {
//   return Array.isArray(post?.comments) ? post.comments.length : 0;
// }
// function viewsCount(post) {
//   return typeof post?.views === "number" ? post.views : 0;
// }

// function buildInteractionSchema(post) {
//   return [
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "LikeAction" },
//       userInteractionCount: likesCount(post),
//     },
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "CommentAction" },
//       userInteractionCount: commentsCount(post),
//     },
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "WatchAction" },
//       userInteractionCount: viewsCount(post),
//     },
//   ];
// }

// function buildDescription(post) {
//   const title = post?.title || "";
//   const author = post?.userId?.username;
//   if (title && author) return `${title} uploaded by ${author}. Watch, like, and comment on FondPeace.`;
//   if (title) return title;
//   return "Discover trending posts and videos on FondPeace.";
// }

// /* ------------------------- Next metadata ------------------------ */
// export async function generateMetadata({ params }) {
//   const id = params?.id;
//   try {
//     const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//     const data = await res.json();
//     const post = data?.post ?? null;
//     if (!post) return { title: "Video Not Found | FondPeace" };

//     const mediaUrl = toAbsolute(post.media);
//     const thumb = toAbsolute(post.thumbnail || post.media || "");
//     const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

//     const titleTag = post.title ? `${post.title} (Watch) | FondPeace` : "Video Watch Page | FondPeace";
//     const desc = buildDescription(post);
//     const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

//     return {
//       title: titleTag,
//       description: desc,
//       alternates: { canonical: canonicalUrl },
//       openGraph: {
//   title: titleTag,
//   description: desc,
//   url: `${SITE_ROOT}/post/${id}`,
//   type: isVideo ? "video.other" : "article",
//   images: [
//     {
//       url: thumb,
//       secureUrl: thumb,
//       type: "image/jpeg",
//       width: 1280,
//       height: 720,
//     }
//   ],
//   ...(isVideo && {
//     videos: [
//       {
//         url: mediaUrl,
//         secureUrl: mediaUrl,
//         type: "video/mp4",
//         width: 1280,
//         height: 720,
//       }
//     ]
//   })
// },

//       robots: { index: false, follow: true }, // Let search index the post canonical; this page holds VideoObject
//     };
//   } catch (err) {
//     console.error("generateMetadata error", err);
//     return { title: "Video Post | FondPeace" };
//   }
// }

// /* ---------------------------- Watch Page Component ----------------------------- */
// export default async function WatchPage({ params }) {
//   const id = params?.id;
//   const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//   const data = await res.json();
//   const post = data?.post ?? null;

//   if (!post) {
//     return (
//       <main className="w-full min-h-screen flex items-center justify-center">
//         <div className="p-6 text-center">Video not found.</div>
//       </main>
//     );
//   }

//   const mediaUrl = toAbsolute(post.media);
//   const thumbnail = toAbsolute(post.thumbnail || post.media || "");
//   const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));
//   const pageUrl = `${SITE_ROOT}/short/${id}`;
//   const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

//   const publisher = {
//     "@type": "Organization",
//     name: "FondPeace",
//     url: SITE_ROOT,
//   };

//   const jsonLd = isVideo
//     ? {
//         "@context": "https://schema.org",
//         "@type": "VideoObject",
//         url: pageUrl,
//         name: post.title,
//         description: buildDescription(post),
//         thumbnailUrl: [thumbnail],
//         contentUrl: mediaUrl,
//         embedUrl: mediaUrl,
//         uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
//         ...(post.duration ? { duration: secToISO(post.duration) } : {}),
//         publisher,
//         interactionStatistic: buildInteractionSchema(post),
//         // Important: link back to the canonical social page so Google knows the host canonical
//         mainEntityOfPage: {
//           "@type": "WebPage",
//           "@id": canonicalUrl,
//         },
//       }
//     : null;

//   if (!isVideo) {
//     return (
//       <main className="p-6 text-center">
//         This watch URL is for videos only. Go to <a href={canonicalUrl} className="text-blue-600 underline">social post</a>.
//       </main>
//     );
//   }

//   return (
//     <main className="w-full min-h-screen bg-black text-white flex items-stretch">
//       {/* JSON-LD */}
//       {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

//       {/* Mobile-first reel layout: video fills most height; interactions overlay */}
//       <section className="w-full flex flex-col md:flex-row items-stretch justify-center">
//         <div className="w-full md:w-2/3 lg:w-3/4 flex items-center justify-center">
//           <div className="w-full max-w-3xl">
//             {/* Video area - mobile: tall, desktop: standard aspect */}
//             <div className="w-full relative">
//               <video
//                 controls
//                 preload="metadata"
//                 poster={thumbnail || undefined}
//                 className="w-full h-[75vh] md:h-auto md:aspect-video object-cover"
//                 playsInline
//               >
//                 <source src={mediaUrl} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>

//               {/* bottom caption overlay (mobile) */}
//               <div className="absolute left-4 bottom-4 md:static md:mt-4 md:bg-transparent text-white">
//                 <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg md:rounded-none md:p-0">
//                   <div className="font-semibold text-sm md:text-lg">{post.userId?.username || "FondPeace"}</div>
//                   <div className="text-xs md:text-sm text-gray-200 mt-1">{post.title}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right column: interactions (on desktop) or overlay on mobile */}
//         <aside className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-end gap-4 p-4 md:p-6">
//           <div className="flex flex-col items-center gap-6 mt-6 md:mt-0">
//             <button className="flex flex-col items-center gap-1">
//               <FaHeart className="text-red-500 text-2xl md:text-3xl" />
//               <span className="text-sm text-gray-200">{likesCount(post)}</span>
//             </button>

//             <button className="flex flex-col items-center gap-1">
//               <FaCommentDots className="text-white text-2xl md:text-3xl" />
//               <span className="text-sm text-gray-200">{commentsCount(post)}</span>
//             </button>

//             <button className="flex flex-col items-center gap-1">
//               <FaShareAlt className="text-white text-2xl md:text-3xl" />
//               <span className="text-sm text-gray-200">Share</span>
//             </button>

//             <div className="flex flex-col items-center gap-1">
//               <FaEye className="text-white text-2xl md:text-3xl" />
//               <span className="text-sm text-gray-200">{viewsCount(post) || 0}</span>
//             </div>
//           </div>

//           {/* Info / actions */}
//           <div className="w-full md:w-auto mt-4 md:mt-6 text-center md:text-right">
//             <a href={canonicalUrl} className="inline-block text-sm text-blue-400 hover:text-blue-200 underline">
//               View on feed
//             </a>
//             <div className="mt-3 text-sm text-gray-300">{buildDescription(post)}</div>
//             {post.duration && <div className="mt-2 text-xs text-gray-400">Duration: {secToISO(post.duration)}</div>}
//           </div>
//         </aside>
//       </section>
//     </main>
//   );
// }











// // app/short/[id]/page.jsx
// // GOAL: Dedicated Watch Page for Google Video Indexing.
// // This page ensures VideoObject schema is present on the primary content page,
// // resolving the "Video isn't on a watch page" error.

// import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";

// const API_BASE = "https://backend-k.vercel.app"; // set your API
// const SITE_ROOT = "https://fondpeace.com"; // set your site root
// const CANONICAL_ROOT = `${SITE_ROOT}/post`; // The user-facing URL we want Google to rank

// /* --------------------------- Helpers (Shared Logic) --------------------------- */

// function toAbsolute(url) {
//   if (!url) return null;
//   if (url.startsWith("http")) return url;
//   if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
//   return `${SITE_ROOT}/${url}`;
// }

// function secToISO(sec) {
//   if (sec == null) return undefined;
//   const s = Number(sec);
//   if (!s || isNaN(s)) return undefined;
//   const h = Math.floor(s / 3600);
//   const m = Math.floor((s % 3600) / 60);
//   const sLeft = s % 60;
//   let iso = "PT";
//   if (h) iso += `${h}H`;
//   if (m) iso += `${m}M`;
//   if (sLeft || (!h && !m)) iso += `${sLeft}S`;
//   return iso;
// }

// function likesCount(post) {
//   return Array.isArray(post?.likes) ? post.likes.length : 0;
// }
// function commentsCount(post) {
//   return Array.isArray(post?.comments) ? post.comments.length : 0;
// }
// function viewsCount(post) {
//   return typeof post?.views === "number" ? post.views : 0;
// }

// function buildInteractionSchema(post) {
//   return [
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "LikeAction" },
//       userInteractionCount: likesCount(post),
//     },
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "CommentAction" },
//       userInteractionCount: commentsCount(post),
//     },
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "WatchAction" },
//       userInteractionCount: viewsCount(post),
//     },
//   ];
// }

// function buildDescription(post) {
//   const title = post?.title || "";
//   const author = post?.userId?.username;
//   if (title && author) return `${title} uploaded by ${author}. Watch, like, and comment on FondPeace.`;
//   if (title) return title;
//   return "Discover trending posts and videos on FondPeace.";
// }

// /* ------------------------- Next metadata ------------------------ */

// export async function generateMetadata({ params }) {
//   const id = params?.id;
//   try {
//     const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//     const data = await res.json();
//     const post = data?.post ?? null;

//     if (!post) return { title: "Video Not Found | FondPeace" };

//     const mediaUrl = toAbsolute(post.media);
//     const thumb = toAbsolute(post.thumbnail || post.media || "");
//     const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

//     const titleTag = post.title ? `${post.title} (Watch) | FondPeace` : "Video Watch Page | FondPeace";
//     const desc = buildDescription(post);
//     const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

//     return {
//       title: titleTag,
//       description: desc,
//       // IMPORTANT: The Canonical URL points back to the user-facing social page (/post/[id])
//       alternates: { canonical: canonicalUrl },
//       openGraph: {
//         title: titleTag,
//         description: desc,
//         url: `${SITE_ROOT}/short/${id}`,
//         type: isVideo ? "video.other" : "article",
//         images: [{ url: thumb }],
//       },
//       // New: We don't want this page indexed in regular search results, only the video.
//       robots: { index: false, follow: true },
//     };
//   } catch (err) {
//     console.error("generateMetadata error", err);
//     return { title: "Video Post | FondPeace" };
//   }
// }

// /* ---------------------------- Watch Page Component ----------------------------- */

// export default async function WatchPage({ params }) {
//   const id = params?.id;
//   const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//   const data = await res.json();
//   const post = data?.post ?? null;

//   if (!post) {
//     return (
//       <main className="w-full min-h-screen flex items-center justify-center">
//         <div className="p-6 text-center">Video not found.</div>
//       </main>
//     );
//   }

//   const mediaUrl = toAbsolute(post.media);
//   const thumbnail = toAbsolute(post.thumbnail || post.media || "");

//   const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

//   const pageUrl = `${SITE_ROOT}/short/${id}`;
//   const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

//   const publisher = {
//     "@type": "Organization",
//     name: "FondPeace",
//     url: SITE_ROOT,
//   };

//   // The primary VideoObject Schema for Indexing
//   const jsonLd = isVideo
//     ? {
//         "@context": "https://schema.org",
//         "@type": "VideoObject",
//         url: pageUrl, 
//         name: post.title,
//         description: buildDescription(post),
//         thumbnailUrl: [thumbnail],
//         contentUrl: mediaUrl,
//         embedUrl: mediaUrl,
//         uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
//         ...(post.duration ? { duration: secToISO(post.duration) } : {}),
//         publisher: publisher,
//         interactionStatistic: buildInteractionSchema(post),
//         // CRITICAL FIX: Explicitly tells Google the video is the main content of the canonical URL
//         mainEntityOfPage: {
//             "@type": "WebPage",
//             "@id": canonicalUrl
//         }
//       }
//     : null;

//   if (!isVideo) {
//     // If not a video, redirect the user back to the canonical social page.
//     return <main className="p-6 text-center">This watch URL is for videos only. Go to <a href={canonicalUrl} className="text-blue-500 underline">Social Post</a></main>
//   }

//   return (
//     <main className="w-full min-h-screen bg-gray-100 text-gray-900 flex justify-center py-6 md:py-10">
//       {/* JSON-LD for guaranteed Video Indexing */}
//       {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

//       <section className="max-w-3xl w-full mx-auto bg-white shadow-xl rounded-lg overflow-hidden border-t-8 border-blue-600">
//         <article className="p-5 sm:p-6 md:p-8">
          
//           {/* 1. AUTHOR INFO - Minimal text above video */}
//           <div className="flex items-center gap-3 mb-5 border-b pb-4">
//             <img 
//               src={`${SITE_ROOT}/og-image.jpg`} 
//               alt="FondPeace" 
//               className="w-12 h-12 rounded-full object-cover"
//             />
//             <div>
//               <div className="font-semibold text-gray-900">{post.userId?.username || "FondPeace"}</div>
//               <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
//             </div>
//           </div>
          
//           {/* 2. VIDEO PLAYER - PRIMARY FOCUS (High up on the page) */}
//           <div className="mb-6">
//             <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
//               <video 
//                 controls 
//                 preload="metadata" 
//                 poster={thumbnail || undefined} 
//                 className="w-full h-full object-cover"
//                 playsInline
//               >
//                 <source src={mediaUrl} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>
//             </div>
//           </div>

//           {/* 3. TITLE (H1) AND DETAILS - Immediately below the video */}
//           <h1 className="text-xl md:text-2xl font-bold leading-tight mb-4 text-blue-700">
//                 {post.title}
//             </h1>

//             {/* Description / Body */}
//             <p className="text-gray-700 mb-5">
//                 {buildDescription(post)}
//             </p>

//           {/* 4. INTERACTION STATS */}
//           <div className="flex items-center gap-6 text-gray-600 border-t pt-4">
//                 <div className="flex items-center gap-1">
//                     <FaHeart className="text-red-600" />
//                     <span className="text-sm font-medium">{likesCount(post)} Likes</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <FaCommentDots />
//                     <span className="text-sm font-medium">{commentsCount(post)} Comments</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <FaEye />
//                     <span className="text-sm font-medium">{viewsCount(post)} Views</span>
//                 </div>
//                 {post.duration && (
//                     <div className="text-sm text-gray-500 ml-auto">
//                         Duration: {secToISO(post.duration)}
//                     </div>
//                 )}
//           </div>

//             {/* Link back to the Social Page for user experience */}
//             <div className="mt-8 text-center">
//                 <a 
//                     href={canonicalUrl} 
//                     className="text-lg font-semibold text-blue-600 hover:text-blue-800 underline transition"
//                 >
//                     View this post on the social feed →
//                 </a>
//             </div>

//         </article>
//       </section>
//     </main>
//   );
// }
