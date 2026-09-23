import { getApiBase } from "./apiConfig";

/**
 * Fetches real posts across all types (videos, images, discussions)
 * directly from the database without any dummy/mock content.
 */
export async function getUnifiedFeedPosts({
  page = 1,
  limit = 12,
  type = "all",
  category = "All",
} = {}) {
  const API_BASE = getApiBase();

  try {
    // 1. Fetch real video posts
    const videoPromise = fetch(`${API_BASE}/post/mango/getall?page=${page}&limit=${Math.max(limit, 10)}`, {
      next: { revalidate: 30 },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => (Array.isArray(data) ? data : []))
      .catch(() => []);

    // 2. Fetch real image & discussion posts from active creators in the MongoDB database
    const activeCreators = ["Tonyreduce", "Love 😍", "adam", "Viral Video", "Afsana"];
    const creatorPromises = activeCreators.map((creator) =>
      fetch(`${API_BASE}/user/profile-public/${encodeURIComponent(creator)}`, {
        next: { revalidate: 60 },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const profile = data?.Profile;
          const posts = profile?.posts || [];
          const userObj = {
            _id: profile?._id || `user-${profile?.username}`,
            username: profile?.username || creator,
            name: profile?.name || profile?.username || creator,
            profilePic: profile?.profilePic || "/Fondpeace.jpg",
          };
          return posts.map((p) => ({
            ...p,
            userId: p.userId && typeof p.userId === "object" ? p.userId : userObj,
          }));
        })
        .catch(() => [])
    );

    const [rawVideos, ...creatorPostArrays] = await Promise.all([
      videoPromise,
      ...creatorPromises,
    ]);

    const rawNonVideos = creatorPostArrays.flat();

    // Helper: Normalize post object
    const normalizePost = (p) => {
      let isVideo = false;
      const mediaUrl = p.media || p.imageURL || p.videoUrl || null;
      const mediaTypeRaw = (p.mediaType || "").toLowerCase();

      if (mediaTypeRaw.includes("video") || (mediaUrl && (mediaUrl.includes(".mp4") || mediaUrl.includes("/video/upload/")))) {
        isVideo = true;
      }

      const determinedType = isVideo
        ? "video"
        : mediaUrl
        ? "image"
        : "discussion";

      return {
        _id: String(p._id || p.id || Math.random()),
        title: p.title || p.content || "",
        media: mediaUrl,
        mediaType: determinedType,
        userId: p.userId || {
          username: "creator",
          name: "Creator",
          profilePic: "/Fondpeace.jpg",
        },
        likes: Array.isArray(p.likes) ? p.likes : [],
        comments: Array.isArray(p.comments) ? p.comments : [],
        shares: p.shares || 0,
        tags: Array.isArray(p.tags) ? p.tags : [],
        category: p.category || (determinedType === "video" ? "Video" : "Community"),
        poll: p.poll || null,
        createdAt: p.createdAt || p.timestamp || new Date().toISOString(),
      };
    };

    const videos = rawVideos.map(normalizePost);
    const nonVideos = rawNonVideos.map(normalizePost);

    // Filter by category if specified
    const filterCat = (list) => {
      if (!category || category === "All" || category === "My Topics" || category === "Near Me") {
        return list;
      }
      return list.filter(
        (p) =>
          (p.category && p.category.toLowerCase() === category.toLowerCase()) ||
          (p.tags && p.tags.some((t) => t.toLowerCase() === category.toLowerCase()))
      );
    };

    const filteredVideos = filterCat(videos);
    const filteredNonVideos = filterCat(nonVideos);

    // Apply media type filter
    if (type === "video") {
      const startIndex = (page - 1) * limit;
      return filteredVideos.slice(startIndex, startIndex + limit);
    }

    if (type === "image") {
      const imagesOnly = filteredNonVideos.filter((p) => p.mediaType === "image");
      const startIndex = (page - 1) * limit;
      return imagesOnly.slice(startIndex, startIndex + limit);
    }

    if (type === "discussion") {
      const discussionsOnly = filteredNonVideos.filter((p) => p.mediaType === "discussion");
      const startIndex = (page - 1) * limit;
      return discussionsOnly.slice(startIndex, startIndex + limit);
    }

    // Type === "all": Interleave video, image, discussion posts naturally
    // Deduplicate by _id
    const seen = new Set();
    const interleaved = [];
    const maxLen = Math.max(filteredVideos.length, filteredNonVideos.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < filteredNonVideos.length) {
        const p = filteredNonVideos[i];
        if (!seen.has(p._id)) {
          seen.add(p._id);
          interleaved.push(p);
        }
      }
      if (i < filteredVideos.length) {
        const p = filteredVideos[i];
        if (!seen.has(p._id)) {
          seen.add(p._id);
          interleaved.push(p);
        }
      }
    }

    const startIndex = (page - 1) * limit;
    return interleaved.slice(startIndex, startIndex + limit);
  } catch (err) {
    console.error("getUnifiedFeedPosts error:", err);
    return [];
  }
}
