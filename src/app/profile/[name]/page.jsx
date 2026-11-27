// app/profile/[name]/page.jsx
import { cache } from "react";
import { notFound } from "next/navigation";
import Profile from "@/components/Profile";
import LeftSidebar from "@/components/LeftSidebar";
import SuggestedCreatorsWidget from "@/components/SuggestedCreatorsWidget";
import { fetchApiRead } from "@/utils/apiConfig";

const SITE_ROOT = "https://www.fondpeace.com";

export const revalidate = 600;

function slimProfilePosts(rawPosts, limit = 24) {
  if (!Array.isArray(rawPosts)) return [];
  return rawPosts.slice(0, limit).map((p) => ({
    _id: p._id,
    title: p.title,
    media: p.media,
    mediaUrl: p.mediaUrl,
    thumbnail: p.thumbnail,
    mediaType: p.mediaType,
    mtype: p.mtype,
    category: p.category,
    tags: Array.isArray(p.tags) ? p.tags.slice(0, 8) : [],
    views: p.views || 0,
    likes: Array.isArray(p.likes) ? p.likes.slice(0, 1) : [],
    likesCount: Array.isArray(p.likes) ? p.likes.length : Number(p.likes || 0),
    comments: Array.isArray(p.comments) ? p.comments.slice(0, 2) : [],
    commentCount: Array.isArray(p.comments) ? p.comments.length : Number(p.commentCount || 0),
    linkPreview: p.linkPreview,
    createdAt: p.createdAt,
    userId: p.userId
      ? {
          _id: p.userId._id,
          username: p.userId.username,
          name: p.userId.name,
          profilePicture: p.userId.profilePicture,
          isVerified: p.userId.isVerified,
        }
      : undefined,
  }));
}

/**
 * Deduplicated multi-tier profile resolver (shared between generateMetadata & Page)
 */
const resolveUserProfile = cache(async (username) => {
  if (!username) return { notFound: true, user: null };
  const cleanName = decodeURIComponent(username).trim();
  let authoritativeNotFound = false;

  // Tier 1: Public endpoint
  try {
    const res = await fetchApiRead(
      `/user/profile-public/${encodeURIComponent(cleanName)}`,
      { fetchOptions: { next: { revalidate: 600 } }, timeoutMs: 18000 }
    );
    if (res?.status === 404 || res?.status === 400) {
      authoritativeNotFound = true;
    } else if (res?.ok) {
      const data = await res.json();
      if (data?.Profile?.user) {
        const rawPosts = Array.isArray(data.Profile.posts) ? data.Profile.posts : [];
        rawPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // Keep SSR payload well under Googlebot's 2MB HTML limit (prevents 3.8MB bloated profiles!)
        return {
          ...data.Profile,
          totalPostsCount: rawPosts.length,
          posts: slimProfilePosts(rawPosts, 24),
          likedPosts: [],
          discussionPosts: [],
        };
      }
      authoritativeNotFound = true;
    }
  } catch (_) {}

  // Tier 2: Mango Directory + Posts fallback
  try {
    const [usersRes, postsRes] = await Promise.all([
      fetchApiRead(`/user/mango/getall`, { fetchOptions: { next: { revalidate: 600 } }, timeoutMs: 18000 }),
      fetchApiRead(`/post/mango/getall`, { fetchOptions: { next: { revalidate: 600 } }, timeoutMs: 18000 }).catch(() => null)
    ]);

    if (usersRes?.ok) {
      const users = await usersRes.json();
      const targetUser = Array.isArray(users)
        ? users.find((u) => {
            const uName = u.username ? u.username.trim().toLowerCase() : "";
            const query = cleanName.toLowerCase();
            return uName === query || u._id === cleanName;
          })
        : null;

      if (targetUser) {
        let userPosts = [];
        if (postsRes && postsRes.ok) {
          try {
            const allPosts = await postsRes.json();
            if (Array.isArray(allPosts)) {
              userPosts = allPosts.filter((p) => {
                const pUid = typeof p.userId === "object" ? p.userId?._id : p.userId;
                const pUname = typeof p.userId === "object" ? p.userId?.username : null;
                return (
                  (pUid && String(pUid) === String(targetUser._id)) ||
                  (pUname && pUname.trim().toLowerCase() === targetUser.username?.trim().toLowerCase())
                );
              });
              userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
          } catch (_) {}
        }

        return {
          user: targetUser,
          totalPostsCount: userPosts.length,
          posts: slimProfilePosts(userPosts, 24),
          likedPosts: [],
          discussionPosts: [],
        };
      }
      authoritativeNotFound = true;
    }
  } catch (_) {}

  return authoritativeNotFound ? { notFound: true, user: null } : null;
});

// ---------- METADATA (SEO HEAD) ----------
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.name;
  if (!username) return { title: "Creator Profile" };

  try {
    const profileData = await resolveUserProfile(username);
    const user = profileData?.user;

    if (!user) {
      return {
        title: `@${decodeURIComponent(username)}`,
        description: `Explore creator profile on FondPeace.`,
        robots: { index: false, follow: true },
      };
    }

    const displayName = user.name || user.username;

    return {
      title: `${displayName} (@${user.username})`,
      description:
        user.bio || `View ${displayName}'s profile on FondPeace. Watch videos, posts, and updates.`,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
        },
      },
      alternates: {
        canonical: `${SITE_ROOT}/profile/${encodeURIComponent(user.username)}`,
      },
      openGraph: {
        title: `${displayName} (@${user.username}) on FondPeace`,
        description:
          user.bio || `Explore posts and videos shared by ${displayName} on FondPeace.`,
        url: `${SITE_ROOT}/profile/${encodeURIComponent(user.username)}`,
        images: [
          {
            url: user.profilePicture || `${SITE_ROOT}/Fondpeace.jpg`,
            width: 800,
            height: 800,
          },
        ],
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `${displayName} (@${user.username}) on FondPeace`,
        description: user.bio || `Explore posts and videos shared by ${displayName} on FondPeace.`,
        images: [user.profilePicture || `${SITE_ROOT}/Fondpeace.jpg`],
      },
    };
  } catch {
    return { title: "Creator Profile" };
  }
}

// ---------- PAGE (STRUCTURED DATA + UI) ----------
export default async function Page({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.name;
  const profileData = username ? await resolveUserProfile(username) : { notFound: true, user: null };
  if (profileData?.notFound) {
    notFound();
  }
  const user = profileData?.user;

  return (
    <>
      {/* JSON-LD: ProfilePage + Person + Breadcrumb */}
      {user && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "ProfilePage",
                  "@id": `${SITE_ROOT}/profile/${encodeURIComponent(user.username)}`,
                  url: `${SITE_ROOT}/profile/${encodeURIComponent(user.username)}`,
                  mainEntity: {
                    "@type": "Person",
                    "@id": `${SITE_ROOT}/profile/${encodeURIComponent(user.username)}#person`,
                  },
                },
                {
                  "@type": "Person",
                  "@id": `${SITE_ROOT}/profile/${encodeURIComponent(user.username)}#person`,
                  name: user.name || user.username,
                  alternateName: `@${user.username}`,
                  description: user.bio || `Explore posts and videos shared by ${user.username} on FondPeace.`,
                  image: user.profilePicture || `${SITE_ROOT}/Fondpeace.jpg`,
                  url: `${SITE_ROOT}/profile/${encodeURIComponent(user.username)}`,
                  interactionStatistic: {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/FollowAction",
                    userInteractionCount: user.Followers?.length || 0,
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "FondPeace",
                      item: SITE_ROOT,
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: user.name || user.username,
                      item: `${SITE_ROOT}/profile/${encodeURIComponent(user.username)}`,
                    },
                  ],
                },
              ],
            }),
          }}
        />
      )}

      {/* Main Platform Shell with LeftSidebar */}
      <main className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
        <div
          className="
            grid 
            grid-cols-1 
            lg:grid-cols-[76px_minmax(0,1fr)] 
            xl:grid-cols-[220px_minmax(0,1fr)_340px] 
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

          {/* Center Main Profile Column */}
          <section className="w-full min-w-0">
            <Profile username={username} initialProfile={profileData} />
          </section>

          {/* Right Sidebar Widget (Wide Desktops Only) */}
          <aside className="hidden xl:block shrink-0">
            <div className="sticky top-4 space-y-4">
              <SuggestedCreatorsWidget variant="card" excludeUsername={username} />

              {/* Creator Spotlight Info Card */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-[var(--text-primary)] shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white">
                    F
                  </div>
                  <span className="font-black text-sm tracking-tight text-[var(--text-primary)]">FondPeace Creators</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Join verified discussions, watch high-definition shorts, and support creator monetization on FondPeace.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

