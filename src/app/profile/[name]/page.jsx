// app/profile/[name]/page.jsx
import Profile from "@/components/Profile";
import LeftSidebar from "@/components/LeftSidebar";
import SuggestedCreatorsWidget from "@/components/SuggestedCreatorsWidget";
import { getApiBase } from "@/utils/apiConfig";

const SITE_ROOT = "https://www.fondpeace.com";
const API_BASE = getApiBase();

/**
 * Resilient multi-tier profile resolver:
 * Tier 1: Try public endpoint /user/profile-public/:username
 * Tier 2: Resilient mango directory lookup if Tier 1 404s (handles MongoDB case-sensitivity issues like 'Tonyreduce')
 */
async function resolveUserProfile(username) {
  if (!username) return null;
  const cleanName = decodeURIComponent(username).trim();

  // Tier 1: Public endpoint
  try {
    const res = await fetch(
      `${API_BASE}/user/profile-public/${encodeURIComponent(cleanName)}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.Profile?.user) {
        return data.Profile;
      }
    }
  } catch (_) {}

  // Tier 2: Mango Directory + Posts fallback
  try {
    const [usersRes, postsRes] = await Promise.all([
      fetch(`${API_BASE}/user/mango/getall`, { cache: "no-store" }),
      fetch(`${API_BASE}/post/mango/getall`, { cache: "no-store" }).catch(() => ({ ok: false }))
    ]);

    if (usersRes.ok) {
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
          posts: userPosts,
        };
      }
    }
  } catch (_) {}

  return null;
}

// ---------- METADATA (SEO HEAD) ----------
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.name;
  if (!username) return { title: "Profile | FondPeace" };

  try {
    const profileData = await resolveUserProfile(username);
    const user = profileData?.user;

    if (!user) {
      return {
        title: `@${username} | FondPeace`,
        description: `Explore creator profile on FondPeace.`,
      };
    }

    const displayName = user.name || user.username;

    return {
      title: `${displayName} (@${user.username}) on FondPeace`,
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
    return { title: "Profile | FondPeace" };
  }
}

// ---------- PAGE (STRUCTURED DATA + UI) ----------
export default async function Page({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.name;
  const profileData = username ? await resolveUserProfile(username) : null;
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
                  "@id": `${SITE_ROOT}/profile/${encodeURIComponent(username)}`,
                  url: `${SITE_ROOT}/profile/${encodeURIComponent(username)}`,
                  mainEntity: {
                    "@type": "Person",
                    "@id": `${SITE_ROOT}/profile/${encodeURIComponent(username)}#person`,
                  },
                },
                {
                  "@type": "Person",
                  "@id": `${SITE_ROOT}/profile/${encodeURIComponent(username)}#person`,
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

