// app/page.jsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

// 📂 Path to posts folder
const POSTS_DIR = path.join(process.cwd(), "src", "app", "posts");
const SITE_URL = "https://fondpeace.com/blog";
const SITE = "https://fondpeace.com";

// ✅ SEO & Social Metadata
export const metadata = {
  title: "FondPeace Blog",
  description:
    "Welcome to my FondPeace Blog platform, Stay updated with daily written updates, spoilers, and upcoming twists from popular Indian TV serials including Yeh Rishta Kya Kehlata Hai, Anupamaa, Saas Bhi Kabhi Bahu Thi 2, Nagin 7, Mr and Mrs Parshuram, Mannat, Sehar hone ko hai, Pati bramhachari, Mangal Lakshmi, Tu Juliet Jatt Di, Mahadev And Sons, Dr. Aarambhi, Shehzaadi Hai Tu Dil Ki, Advocate Anjali Awasthi, Udne Ki Aasha, BhagyaLakshmi, Ghum Hai Kisikey Pyaar Mein, Written Update,Yeh Rishta Kya Kehlata Hai, Tum Se Tumm Tak, Vashudha, Saru, Kumkum Bhagya, Kundali Bhagya, Today Written Update, FondPeace and more.",
  keywords:
    "Indian TV serials, written updates, daily episode updates, spoilers, twists, Yeh Rishta Kya Kehlata Hai, Anupamaa, BhagyaLakshmi, Ghum Hai Kisikey Pyaar Mein, TV news, TV gossip, Anupama written update, Yeh Rishta Kya Kehlata Hai Dailymotion, Dailymotion, today full episode, Tum se Tum Tak, Vashudha, Saru, Mangal Lakshmi, Bhagya Lakshmi Today Written Update, Written Update, Tellyexpres, Telly updates, Telly update, FondPeace, IWMbuzz, Disney Jiohotstar",
  authors: [{ name: "FondPeace Blog" }],
  robots: "index, follow",
  openGraph: {
    title: "FondPeace Blog",
    description:
      "Daily written updates, episode summaries, spoilers, Anupama , Yeh Rishta Kya Kehlata Hai, Ghum Hai Kiskey Pyar Mein, Tum Se Tumm Tak, Vashudha, Saru, Kundali Bhagya, Kumkum Bhagya, Fondpeace, Udne Ki Aasha, Dr. Aarambhi, Mahadev And Sons, Bhagya Lakshmi,and twists from your favorite Indian TV serials.",
    url: SITE_URL,
    siteName: "FondPeace Blog",
    type: "website",
    images: [
      {
        url: "https://fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Blog - Indian TV Serials and More",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FondPeace Blog",
    description:
      "Get daily written updates, spoilers, anupama, Yeh Rishta Kya Kehlata Hai, Mahadev And Sons, Udne Ki Aasha, Advocate Anjali Awasthi, Shehzaadi Hai Tu Dil Ki, Tu Juliet Jatt Di, Tum Se Tumm Tak, Vashudha, Saru, Fondpeace, and twists from top Indian TV serials.",
    images: [`${SITE}/FondPeace-1200x630.jpg`],
  },
};

export default function Home() {
  // 📌 Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "FondPeace Blog",
    url: SITE_URL,
    description:
      "Get daily written updates, spoilers, anupama, Yeh Rishta Kya Kehlata Hai, Tu Juliet Jatt Di, Udne Ki Aasha, Advocate Anjali Awasthi, Dr. Aarambhi, Mahadev And Sons, Saas Bhi Kabhi Bahu Thi 2, Nagin 7, Tum Se Tumm Tak, Vashudha, Saru, FondPeace, FondPeace blog, and twists from top Indian TV serials.",
    publisher: {
      "@type": "Organization",
      name: "FondPeace Blog",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/FondPeace-1200x630.jpg`,
      },
    },
    author: {
      "@type": "Person",
      name: "FondPeace Blog",
    },
  };

  // ✅ Get latest posts
  let posts = [];
  if (fs.existsSync(POSTS_DIR)) {
    posts = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
        const { data } = matter(raw);
        const stats = fs.statSync(path.join(POSTS_DIR, f));
        const publishDate =
          data.publishDate && !Number.isNaN(new Date(data.publishDate).getTime())
            ? new Date(data.publishDate)
            : stats.ctime;

        const ogImage =
          data.ogImage && String(data.ogImage).startsWith("http")
            ? data.ogImage
            : data.ogImage
            ? `${SITE}${data.ogImage.startsWith("/") ? "" : "/"}${data.ogImage}`
            : `${SITE}/FondPeace-1200x630.jpg`;

        return {
          slug: f.replace(/\.md$/, ""),
          title: data.title || f.replace(/\.md$/, ""),
          description: data.description || "",
          publishDate,
          ogImage,
        };
      })
      .sort((a, b) => b.publishDate - a.publishDate) // latest first
      .slice(0, 10); // only latest 10
  }

  return (
    <main className="max-w-7xl mx-auto p-4">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      

      {/* Latest Posts */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Latest Posts</h2>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={post.ogImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold">{post.title}</h3>
                  <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                    {post.description}
                  </p>
                  <p className="text-gray-400 text-xs mt-3">
                    {post.publishDate.toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      
    </main>
  );
}
