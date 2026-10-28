"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import jwt from "jsonwebtoken";
import toast from "react-hot-toast";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaEye,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { ShieldCheck, Sparkles } from "lucide-react";
import LinkPreviewCard from "@/components/LinkPreviewCard";
import { getApiBase } from "@/utils/apiConfig";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const PostSkeleton = () => (
  <div className="w-full mb-4 sm:mb-6 bg-[var(--bg-surface)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] animate-pulse">
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
      <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-28" />
        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full w-16" />
      </div>
    </div>
    <div className="w-full aspect-[4/5] bg-zinc-100 dark:bg-zinc-900" />
    <div className="px-4 pt-3 pb-4 space-y-2">
      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-3/4" />
      <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded-full w-1/2" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RelatedPosts({
  currentPostId = null,
  category = null,
  tags = [],
  initialRelated = [],
}) {
  const [posts, setPosts] = useState(() => {
    if (Array.isArray(initialRelated) && initialRelated.length > 0) {
      return initialRelated.filter((p) => String(p._id) !== String(currentPostId));
    }
    return [];
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(() => {
    return !Array.isArray(initialRelated) || initialRelated.length === 0;
  });

  const observerRef = useRef(null);
  const viewObserver = useRef(null);
  const videoRefs = useRef({});
  const viewedPosts = useRef(new Set());

  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [userId, setUserId] = useState(null);
  const [mutedMap, setMutedMap] = useState({});
  const [copiedPostId, setCopiedPostId] = useState(null);

  const API_BASE = getApiBase();

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const decoded = jwt.decode(token);
      if (decoded?.exp * 1000 > Date.now()) setUserId(decoded.UserId || decoded.id || decoded.userId);
    } catch {
      /* noop */
    }
  }, []);

  // ── Fetch page 1 ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialLoad) return;
    setLoading(true);
    setInitialLoad(false);

    const params = new URLSearchParams({
      page: "1",
      limit: "15",
      ...(currentPostId ? { currentPostId: String(currentPostId) } : {}),
      ...(category && category !== "All" && category !== "Community" ? { category } : {}),
    });

    axios
      .get(`${API_BASE}/post/related/mango/getall?${params.toString()}`)
      .then((res) => {
        const data = res.data;
        if (!Array.isArray(data) || !data.length) {
          setHasMore(false);
          setPosts([]);
        } else {
          const filtered = currentPostId
            ? data.filter((p) => String(p._id) !== String(currentPostId))
            : data;
          setPosts(filtered);
          setHasMore(filtered.length >= 10);
          setPage(1);
        }
      })
      .catch(() => {
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [API_BASE, currentPostId, category, initialLoad]);

  // ── Fetch subsequent pages ────────────────────────────────────────────────
  useEffect(() => {
    if (page === 1 || !hasMore || loading) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: "15",
      ...(currentPostId ? { currentPostId: String(currentPostId) } : {}),
      ...(category && category !== "All" && category !== "Community" ? { category } : {}),
    });

    axios
      .get(`${API_BASE}/post/related/mango/getall?${params.toString()}`)
      .then((res) => {
        const data = res.data;
        if (!Array.isArray(data) || !data.length) {
          setHasMore(false);
        } else {
          const filtered = currentPostId
            ? data.filter((p) => String(p._id) !== String(currentPostId))
            : data;
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => String(p._id)));
            const newPosts = filtered.filter((p) => !existingIds.has(String(p._id)));
            return [...prev, ...newPosts];
          });
        }
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }, [page, API_BASE, currentPostId, category, hasMore, loading]);

  // ── View tracking ─────────────────────────────────────────────────────────
  const increaseView = useCallback(
    (postId) => {
      if (viewedPosts.current.has(postId)) return;
      viewedPosts.current.add(postId);
      axios.post(`${API_BASE}/analytics/view`, { postId }).catch(() => {});
    },
    [API_BASE]
  );

  useEffect(() => {
    viewObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.dataset.postid;
          if (!postId) return;
          const video = videoRefs.current[postId];
          if (entry.isIntersecting) {
            increaseView(postId);
            if (video) video.play().catch(() => {});
          } else {
            if (video) video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );
    return () => viewObserver.current?.disconnect();
  }, [increaseView, posts]);

  useEffect(() => {
    const els = document.querySelectorAll(".fp-post-item");
    els.forEach((el) => viewObserver.current?.observe(el));
    return () => els.forEach((el) => viewObserver.current?.unobserve(el));
  }, [posts]);

  // ── Infinite scroll ───────────────────────────────────────────────────────
  const lastPostRef = useCallback(
    (node) => {
      if (!hasMore || loading) return;
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setPage((p) => p + 1);
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loading]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const hasLiked = useCallback(
    (post) =>
      !!userId &&
      Array.isArray(post.likes) &&
      post.likes.some((id) => String(id?._id || id) === String(userId)),
    [userId]
  );

  const handleLike = async (postId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Log in to like posts");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${postId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p
        )
      );
    } catch {
      toast.error("Could not like post");
    }
  };

  const handleComment = async (postId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const text = commentTextMap[postId]?.trim();
    if (!token || !text) return;
    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/${postId}`,
        { CommentText: text, userId },
        { headers: { "x-auth-token": token } }
      );
      setCommentTextMap((p) => ({ ...p, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: res.data.comments } : p
        )
      );
      toast.success("Comment posted");
    } catch {
      toast.error("Could not post comment");
    }
  };

  const toggleMute = (postId) => {
    const v = videoRefs.current[postId];
    if (!v) return;
    v.muted = !v.muted;
    setMutedMap((p) => ({ ...p, [postId]: v.muted }));
  };

  const handleShare = (post) => {
    const isVid =
      post.mediaType?.startsWith("video") ||
      post.media?.match(/\.(mp4|mov|webm|mkv)$/i);
    const url = `${window.location.origin}/${isVid ? "short" : "post"}/${post._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedPostId(post._id);
      toast.success("Link copied!");
      setTimeout(() => setCopiedPostId(null), 2500);
    });
  };

  // ── Render post ───────────────────────────────────────────────────────────
  const renderPost = useCallback(
    (post) => {
      const expanded = expandedPosts[post._id];
      const isYouTube =
        Boolean(post.isYouTubeShort) ||
        (typeof post.media === "string" && (post.media.includes("youtube.com") || post.media.includes("youtu.be"))) ||
        (typeof post.linkPreview?.url === "string" && (post.linkPreview.url.includes("youtube.com") || post.linkPreview.url.includes("youtu.be"))) ||
        (typeof post.linkPreview?.siteName === "string" && post.linkPreview.siteName.toLowerCase().includes("youtube"));

      const isVid =
        isYouTube ||
        post.mediaType?.startsWith("video") ||
        (typeof post.media === "string" && post.media.match(/\.(mp4|mov|webm|mkv|m4v)$/i));

      const hasDirectNativeMedia = post.media && !isYouTube;
      const title = post.title || "";
      const displayTitle =
        expanded ? title : title.slice(0, 100) + (title.length > 100 ? "…" : "");
      const liked = hasLiked(post);

      const rawAuthorPic = post.userId?.profilePicture || post.userId?.profilePic || post.userId?.avatar;
      const hasAuthorPic = rawAuthorPic && rawAuthorPic !== "/Fondpeace.jpg" && rawAuthorPic.trim() !== "";
      const authorInitial = (post.userId?.username?.[0] || post.userId?.name?.[0] || "U").toUpperCase();

      return (
        <article
          key={post._id}
          data-postid={post._id}
          className="fp-post-item bg-[var(--bg-surface)] w-full mb-4 sm:mb-5 rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-md transition-all text-[var(--text-primary)]"
        >
          {/* ── Header: Avatar ring, username, date (clicks to open post) ── */}
          <div className="flex items-center justify-between px-3.5 sm:px-4 h-[54px] border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href={`/profile/${post.userId?.username}`}
                className="relative group shrink-0"
              >
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600">
                  <div className="bg-[var(--bg-surface)] p-[1.5px] rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                    {hasAuthorPic ? (
                      <img
                        src={rawAuthorPic}
                        alt={post.userId?.username || "creator"}
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(post.userId?.username || "creator")}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs select-none">
                        {authorInitial}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/profile/${post.userId?.username}`}
                    className="text-[13px] font-bold text-[var(--text-primary)] hover:underline truncate leading-tight"
                  >
                    {post.userId?.username || "Creator"}
                  </Link>
                  {post.userId?.isVerified && (
                    <ShieldCheck size={13} className="text-blue-500 fill-blue-500/20 shrink-0" />
                  )}
                </div>
                <Link
                  href={isVid ? `/shorts/${post._id}` : `/post/${post._id}`}
                  className="text-[10.5px] text-[var(--text-secondary)] hover:text-blue-500 transition-colors font-medium"
                >
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Link>
              </div>
            </div>

            <Link
              href={isVid ? `/shorts/${post._id}` : `/post/${post._id}`}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              View Thread →
            </Link>
          </div>

          {/* ── Media / Embedded content ── */}
          {hasDirectNativeMedia ? (
            <div className="relative w-full max-h-[520px] bg-black rounded-xl overflow-hidden flex items-center justify-center my-1 group">
              <Link
                href={isVid ? `/shorts/${post._id}` : `/post/${post._id}`}
                className="w-full h-auto flex items-center justify-center bg-black cursor-pointer group/media"
              >
                {isVid ? (
                  <video
                    ref={(r) => (videoRefs.current[post._id] = r)}
                    src={post.media}
                    loop
                    playsInline
                    muted={mutedMap[post._id] !== false}
                    preload="metadata"
                    className="w-full max-h-[520px] object-contain block mx-auto"
                  />
                ) : (
                  <img
                    src={post.media}
                    alt={title}
                    className="w-full max-h-[520px] object-contain block mx-auto"
                    loading="lazy"
                  />
                )}
              </Link>

              {isVid && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMute(post._id);
                  }}
                  className="absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80 active:scale-90 transition-all border border-white/10 cursor-pointer"
                  title="Toggle Mute"
                >
                  {mutedMap[post._id] !== false ? (
                    <FaVolumeMute size={11} />
                  ) : (
                    <FaVolumeUp size={11} />
                  )}
                </button>
              )}
            </div>
          ) : (post.linkPreview || isYouTube || (typeof post.thumbnail === "string" && (post.thumbnail.includes("youtube.com") || post.thumbnail.includes("ytimg.com")))) ? (
            <div className="px-3 sm:px-4 my-1">
              <LinkPreviewCard
                preview={{
                  ...(post.linkPreview || {}),
                  url: post.linkPreview?.url || (typeof post.media === "string" ? post.media : "") || "",
                  image: post.linkPreview?.image || post.thumbnail || "",
                  media: post.media || "",
                  title: post.title || post.linkPreview?.title || ""
                }}
                postId={post._id}
                inFeed={true}
              />
            </div>
          ) : (
            <Link
              href={`/post/${post._id}`}
              className="block relative mx-3 my-1 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg overflow-hidden border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={12} className="text-blue-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
                  Community Discussion
                </span>
              </div>
              <div className="text-sm sm:text-base font-medium leading-relaxed text-slate-100 whitespace-pre-wrap">
                {title}
              </div>
            </Link>
          )}

          {/* ── Actions Bar ── */}
          <div className="px-3.5 sm:px-4 pt-3 pb-3.5">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Like */}
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-1.5 group cursor-pointer"
                  title="Like"
                >
                  {liked ? (
                    <FaHeart className="text-[20px] text-rose-500 scale-100 active:scale-125 transition-transform" />
                  ) : (
                    <FaRegHeart className="text-[20px] text-[var(--text-secondary)] group-hover:text-rose-500 transition-colors" />
                  )}
                  <span className={`text-[12px] font-semibold tabular-nums ${liked ? "text-rose-500 font-bold" : "text-[var(--text-secondary)]"}`}>
                    {post.likes?.length ?? 0}
                  </span>
                </button>

                {/* Comment */}
                <button
                  onClick={() =>
                    setCommentBoxOpen((p) => ({
                      ...p,
                      [post._id]: !commentBoxOpen[post._id],
                    }))
                  }
                  className="flex items-center gap-1.5 group cursor-pointer"
                  title="Comments"
                >
                  <FaCommentDots className="text-[19px] text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors" />
                  <span className="text-[12px] font-semibold text-[var(--text-secondary)] tabular-nums">
                    {post.comments?.length ?? 0}
                  </span>
                </button>

                {/* Share */}
                <div className="relative">
                  <button
                    onClick={() => handleShare(post)}
                    className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-emerald-500 transition-colors cursor-pointer"
                    title="Share Post"
                  >
                    <FaShareAlt className="text-[17px]" />
                  </button>
                  {copiedPostId === post._id && (
                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap z-20">
                      Copied!
                    </span>
                  )}
                </div>
              </div>

              {/* Views */}
              <div className="flex items-center gap-1 text-[var(--text-secondary)] text-[11px] font-medium">
                <FaEye size={12} className="opacity-70" />
                <span className="tabular-nums">{(post.views ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Caption */}
            {title && (
              <div className="text-[13.5px] text-[var(--text-primary)] leading-relaxed">
                <Link
                  href={`/profile/${post.userId?.username}`}
                  className="font-bold text-[var(--text-primary)] mr-1.5 hover:underline"
                >
                  {post.userId?.username}
                </Link>
                <span className="whitespace-pre-wrap">{displayTitle}</span>
                {title.length > 100 && (
                  <button
                    onClick={() =>
                      setExpandedPosts((p) => ({
                        ...p,
                        [post._id]: !expanded,
                      }))
                    }
                    className="text-blue-500 font-semibold text-[12px] ml-1.5 hover:underline cursor-pointer"
                  >
                    {expanded ? " show less" : "...more"}
                  </button>
                )}
              </div>
            )}

            {/* Comment Drawer */}
            {commentBoxOpen[post._id] && (
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                {post.comments?.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
                    {post.comments.slice(-5).map((c, i) => (
                      <div key={i} className="flex gap-2 text-[12px]">
                        <span className="font-bold text-[var(--text-primary)] shrink-0">
                          {c?.userId?.username || "User"}
                        </span>
                        <span className="text-[var(--text-secondary)] leading-snug">
                          {c?.CommentText}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 focus-within:border-blue-500 transition-all">
                  <input
                    type="text"
                    placeholder="Add a comment…"
                    value={commentTextMap[post._id] || ""}
                    onChange={(e) =>
                      setCommentTextMap((p) => ({
                        ...p,
                        [post._id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleComment(post._id);
                    }}
                    className="flex-1 text-[12.5px] bg-transparent outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    disabled={!commentTextMap[post._id]?.trim()}
                    className="text-blue-500 text-[12px] font-bold disabled:opacity-30 hover:text-blue-600 transition shrink-0 cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>
      );
    },
    [
      commentTextMap,
      commentBoxOpen,
      expandedPosts,
      mutedMap,
      copiedPostId,
      hasLiked,
    ]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header divider */}
      <div className="flex items-center justify-between mb-4 pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            More from the Community
          </span>
        </div>
      </div>

      {/* Initial skeletons */}
      {initialLoad && loading && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {/* Feed */}
      {!initialLoad && posts.length > 0 && (
        <>
          {posts.map((post, idx) => (
            <div
              key={post._id}
              ref={idx === posts.length - 1 ? lastPostRef : undefined}
            >
              {renderPost(post)}
            </div>
          ))}

          {/* Pagination skeleton */}
          {loading && <PostSkeleton />}

          {/* End of feed */}
          {!hasMore && (
            <div className="text-center py-8 px-4 border-t border-[var(--border-subtle)] mt-4">
              <p className="text-[14px] font-bold text-[var(--text-primary)]">
                You&apos;re all caught up ✨
              </p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                Check back soon for new discussions
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!initialLoad && !loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface)]">
          <p className="text-[13px] text-[var(--text-secondary)] font-medium mb-2">
            No related posts found right now
          </p>
          <Link
            href="/"
            className="text-[12px] bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-xl hover:bg-blue-700 transition"
          >
            Explore Discovery Feed
          </Link>
        </div>
      )}
    </div>
  );
}
