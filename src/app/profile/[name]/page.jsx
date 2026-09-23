// app/profile/[username]/page.jsx
import Profile from "@/components/Profile";
import { getApiBase } from "@/utils/apiConfig";
  
const SITE_ROOT = "https://www.fondpeace.com";
const API_BASE = getApiBase();
 
// ---------- METADATA (SEO HEAD) ----------
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.name;
  if (!username) return { title: "Profile | FondPeace" };

  try {
    const res = await fetch(
      `${API_BASE}/user/profile-public/${username}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return { title: "Profile not found | FondPeace" };
    }

    const data = await res.json();
    const user = data?.Profile?.user;

    if (!user) return { title: "Profile | FondPeace" };

    return {
      title: `${user.username} (@${user.username}) on FondPeace`,
      description:
        `View ${user.username}'s profile on FondPeace. Watch videos, posts, and updates.`,
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
        canonical: `${SITE_ROOT}/profile/${user.username}`,
      },
      openGraph: {
        title: `${user.username} on FondPeace`,
        description:
          `Explore posts and videos shared by ${user.username} on FondPeace.`,
        url: `${SITE_ROOT}/profile/${user.username}`,
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
        title: `${user.username} on FondPeace`,
        description: `Explore posts and videos shared by ${user.username} on FondPeace.`,
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
  let user = null;
  

  try {
    const res = await fetch(
      `${API_BASE}/user/profile-public/${username}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const data = await res.json();
      user = data.Profile.user;
    }
  } catch (_) {}

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
                  "@id": `${SITE_ROOT}/profile/${username}`,
                  "url": `${SITE_ROOT}/profile/${username}`,
                  "mainEntity": {
                    "@type": "Person",
                    "@id": `${SITE_ROOT}/profile/${username}#person`,
                  },
                },
                {
                  "@type": "Person",
                  "@id": `${SITE_ROOT}/profile/${username}#person`,
                  "name": user.username,
                  "alternateName": `@${user.username}`,
                  "description": `Explore posts and videos shared by ${user.username} on FondPeace.`,
                  "image":
                    user.profilePicture ||
                    `${SITE_ROOT}/Fondpeace.jpg`,
                  "url": `${SITE_ROOT}/profile/${user.username}`,
                  "interactionStatistic": {
                    "@type": "InteractionCounter",
                    "interactionType":
                      "https://schema.org/FollowAction",
                    "userInteractionCount":
                      user.Followers?.length || 0,
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "FondPeace",
                      "item": SITE_ROOT,
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": user.username,
                      "item": `${SITE_ROOT}/profile/${user.username}`,
                    },
                  ],
                },
              ],
            }),
          }}
        />
      )}

      {/* Client Component (UNCHANGED) */}
      <Profile />
    </>
  );
}








// 'use client';
// // import SearchBar from '@/Components/SearchBar';
// import Profile from '@/components/Profile';
// import React from 'react';



// const Single = () => {
//   return (
//     <div className='md:m-1'>
//         <Profile />
        
//     </div>
//   )
// }

// export default Single;
