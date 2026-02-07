// app/profile/[username]/page.jsx
import Profile from "@/components/Profile";
  
const SITE_ROOT = "https://www.fondpeace.com";
 
// ---------- METADATA (SEO HEAD) ----------
export async function generateMetadata({ params }) {
  const { name } = params;
  const username = name;
  console.log(username);
  try {
    const res = await fetch(
      `https://backend-k.vercel.app/user/profile/${username}`,
      { cache: "no-store" }
    );

    console.log(res);
    if (!res.ok) {
      return { title: "Profile not found | FondPeace" };
    }

    const data = await res.json();
    const user = data.Profile.user;

    return {
      title: `${user.username} (@${user.username}) on FondPeace`,
      description:
        user.bio ||
        `View ${user.username}'s profile on FondPeace. Watch videos, posts, and updates.`,
      alternates: {
        canonical: `${SITE_ROOT}/profile/${user.username}`,
      },
      openGraph: {
        title: `${user.username} on FondPeace`,
        description:
          user.bio ||
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
        description: user.bio || "",
        images: [user.profilePicture || `${SITE_ROOT}/Fondpeace.jpg`],
      },
    };
  } catch {
    return { title: "Profile | FondPeace" };
  }
}

// ---------- PAGE (STRUCTURED DATA + UI) ----------
export default async function Page({ params }) {
  const { name } = params;
  const username = name;
  console.log(username);
  let user = null;

  try {
    const res = await fetch(
      `https://backend-k.vercel.app/user/profile/${username}`,
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
                  "description":
                    user.bio || "Creator on FondPeace",
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
