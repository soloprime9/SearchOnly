'use client'; 
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import jwt from "jsonwebtoken";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import PostActionsMenu from "./PostActionsMenu";
import PollCard from "./PollCard";
import LinkPreviewCard from "./LinkPreviewCard";
import QuickAuthGateModal from "./QuickAuthGateModal";
import ImageLightboxModal from "./ImageLightboxModal";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import NewPostsPill from "./NewPostsPill";
import StoryCardExportModal from "./StoryCardExportModal";
import CommentsSheetModal from "./CommentsSheetModal";
import QuickPostComposer from "./QuickPostComposer";
import MiniFloatingPlayer from "./MiniFloatingPlayer";
import CreatorAppreciationModal from "./CreatorAppreciationModal";
import PostQuickSummary from "./PostQuickSummary";
import RepostModal from "./RepostModal";
import CreatorAnalyticsModal from "./CreatorAnalyticsModal";
import PostTranslator from "./PostTranslator";
import UserProfileHoverCard from "./UserProfileHoverCard";
import PostReactionsBar from "./PostReactionsBar";
import HashtagDrawer from "./HashtagDrawer";
import EmailVerificationModal from "./EmailVerificationModal";
import SuggestedCreatorsWidget from "./SuggestedCreatorsWidget";
import PersonalizeFeedModal from "./PersonalizeFeedModal";
import StoriesBar from "./StoriesBar";
import { UserPlus, Check, Users, Sparkles, Maximize2, Repeat2, Bookmark, BarChart2, Pin, LayoutList, LayoutGrid, Quote, Compass, ArrowUp, ShieldCheck, X, Film, Image as ImageIcon, MessageSquare, MapPin, Smartphone, RotateCw, SlidersHorizontal } from "lucide-react";
import { triggerHeartBurst } from "@/utils/confetti";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { getApiBase, API_BASE } from "@/utils/apiConfig";

// Reading time helper
function getReadingTime(text) {
  if (!text) return null;
  const words = text.trim().split(/\s+/).length;
  if (words < 20) return null;
  const min = Math.ceil(words / 180);
  return min <= 1 ? "1 min read" : `${min} min read`;
}

// Inline hashtag, mention, and link parser
function renderFormattedCaption(text, onHashtagClick) {
  if (!text) return null;
  const tokenRegex = /(https?:\/\/[^\s]+|#[\w\u0590-\u05ff]+|@\w+)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("#")) {
      return (
        <button
          key={i}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onHashtagClick) onHashtagClick(part);
          }}
          className="text-blue-400 font-bold hover:underline inline"
        >
          {part}
        </button>
      );
    }
    if (part.startsWith("@")) {
      const handle = part.slice(1);
      return (
        <Link
          key={i}
          href={`/profile/${handle}`}
          onClick={(e) => e.stopPropagation()}
          className="text-indigo-400 font-bold hover:underline inline"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("http://") || part.startsWith("https://")) {
      let displayUrl = part;
      try {
        const u = new URL(part);
        displayUrl = u.hostname.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname.slice(0, 18) + "…" : "");
      } catch (_) {}

      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-sky-400 font-bold hover:underline break-all inline-flex items-center gap-0.5 mx-0.5"
          title={part}
        >
          <span>{displayUrl}</span>
          <span className="text-[10px] opacity-70">↗</span>
        </a>
      );
    }
    return <span key={i} className="text-zinc-100">{part}</span>;
  });
}


export default function Village({ initialPosts = [] }) {
  const [posts, setPosts] = useState(Array.isArray(initialPosts) ? initialPosts : []);
  const [activeTab, setActiveTab] = useState("foryou"); // "foryou" | "following"
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState("stream"); // "stream" | "grid"
  const [isZenMode, setIsZenMode] = useState(false);
  const [followingMap, setFollowingMap] = useState({});
  const [followingLoading, setFollowingLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [userId, setUserId] = useState(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("interact");
  const [doubleTapHeart, setDoubleTapHeart] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [speedBadge, setSpeedBadge] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [storyModalPost, setStoryModalPost] = useState(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [floatingVideo, setFloatingVideo] = useState(null);
  const [appreciationPost, setAppreciationPost] = useState(null);
  const [repostModalPost, setRepostModalPost] = useState(null);
  const [analyticsModalPostId, setAnalyticsModalPostId] = useState(null);
  const [reactionPickerPostId, setReactionPickerPostId] = useState(null);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [dismissedVerifyBanner, setDismissedVerifyBanner] = useState(false);
  const speedTimeoutRef = useRef(null);
  const videoRefs = useRef([]);
  const router = useRouter();
  const API_BASE = getApiBase();
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all"); // "all" | "video" | "image" | "discussion"
  const [filterLoading, setFilterLoading] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [preferredTopics, setPreferredTopics] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const viewObserver = useRef(null);

  // Initialize global mute and personalization state from user preferences
  useEffect(() => {
    try {
      const storedMute = localStorage.getItem("fondpeace_global_muted");
      if (storedMute !== null) {
        setIsGlobalMuted(storedMute === "true");
      }
      const storedTopics = localStorage.getItem("fondpeace_my_topics");
      if (storedTopics) {
        setPreferredTopics(JSON.parse(storedTopics));
      }
    } catch (_) {}
  }, []);

  // Auto-play videos when they scroll into view (matches fondpeace.com)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.4 }
    );
    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });
    return () => observer.disconnect();
  }, [posts]);

  // Monitor scroll for Back to Top FAB
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 800) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Desktop Power-User Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleGlobalMute();
      } else if (e.key.toLowerCase() === "j" || e.key === "ArrowDown") {
        window.scrollBy({ top: 500, behavior: "smooth" });
      } else if (e.key.toLowerCase() === "k" || e.key === "ArrowUp") {
        window.scrollBy({ top: -500, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isGlobalMuted]);
  
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const uid = decoded.UserId;
        setUserId(uid);

        // Fetch user's following list to show accurate Following button states
        axios
          .get(`${API_BASE}/user/profile/${decoded.username}`, {
            headers: { "x-auth-token": token },
          })
          .then((res) => {
            const userObj = res.data?.Profile?.user;
            if (userObj) {
              setCurrentUserData(userObj);
            }
            const followings = userObj?.Followings || [];
            const map = {};
            followings.forEach((id) => {
              map[id?.toString?.() || id] = true;
            });
            setFollowingMap(map);
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error("Token error");
    }
  }, []);

  const handleTabChange = async (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    setHasMore(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (tab === "following") {
      if (!token) {
        setAuthGateAction("view posts from creators you follow");
        setAuthGateOpen(true);
        return;
      }

      setFollowingLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/post/feed/following?page=1&limit=12`, {
          headers: { "x-auth-token": token },
        });
        const followingPosts = Array.isArray(res.data?.posts) ? res.data.posts : [];
        setPosts(followingPosts);
        setHasMore(res.data?.hasMore ?? (followingPosts.length > 0));
      } catch (err) {
        console.error("Following feed fetch error:", err);
      } finally {
        setFollowingLoading(false);
      }
    } else {
      // For you discovery stream
      try {
        const postsData = await fetchFeedData(1, mediaTypeFilter, categoryFilter);
        setPosts(postsData);
      } catch (_) {}
    }
  };

  const fetchFeedData = useCallback(
    async (targetPage = 1, targetType = mediaTypeFilter, targetCat = categoryFilter) => {
      try {
        const typeParam = targetType === "all" ? "" : `&type=${targetType}`;
        let catParam = "";
        if (targetCat === "My Topics" && preferredTopics.length > 0) {
          catParam = `&topics=${encodeURIComponent(preferredTopics.join(","))}`;
        } else if (targetCat === "Near Me") {
          catParam = `&location=India`;
        } else if (targetCat !== "All" && targetCat !== "Shorts") {
          catParam = `&category=${encodeURIComponent(targetCat)}`;
        }

        const res = await axios.get(
          `${API_BASE}/post/mango/getall?page=${targetPage}&limit=12${typeParam}${catParam}`
        );
        const data = Array.isArray(res.data) ? res.data : [];

        if (targetType === "all" && data.length > 0) {
          const hasNonVideo = data.some(
            (p) =>
              p.mediaType === "image" ||
              p.mediaType === "text" ||
              p.mediaType === "discussion" ||
              (p.media && !p.media.endsWith(".mp4")) ||
              !p.media
          );

          if (!hasNonVideo) {
            // Live backend returned only video batch; fetch image and discussion posts to ensure a multi-type feed!
            const [imgRes, textRes] = await Promise.all([
              axios
                .get(
                  `${API_BASE}/post/mango/getall?page=${targetPage}&limit=6&type=image${catParam}`
                )
                .catch(() => ({ data: [] })),
              axios
                .get(
                  `${API_BASE}/post/mango/getall?page=${targetPage}&limit=6&type=discussion${catParam}`
                )
                .catch(() => ({ data: [] })),
            ]);

            const nonVideos = [
              ...(Array.isArray(imgRes.data) ? imgRes.data : []),
              ...(Array.isArray(textRes.data) ? textRes.data : []),
            ];

            if (nonVideos.length > 0) {
              const interleaved = [];
              const maxLen = Math.max(data.length, nonVideos.length);
              const seen = new Set();
              for (let i = 0; i < maxLen; i++) {
                if (i < nonVideos.length && !seen.has(nonVideos[i]._id)) {
                  seen.add(nonVideos[i]._id);
                  interleaved.push(nonVideos[i]);
                }
                if (i < data.length && !seen.has(data[i]._id)) {
                  seen.add(data[i]._id);
                  interleaved.push(data[i]);
                }
              }
              return interleaved.slice(0, 12);
            }
          }
        }
        return data;
      } catch {
        return [];
      }
    },
    [API_BASE, mediaTypeFilter, categoryFilter, preferredTopics]
  );

  const handleMediaTypeChange = async (type) => {
    if (type === mediaTypeFilter) return;
    playTap();
    setMediaTypeFilter(type);
    setPage(1);
    setHasMore(true);
    setFilterLoading(true);

    try {
      const data = await fetchFeedData(1, type, categoryFilter);
      setPosts(data);
    } catch (err) {
      console.error("Filter feed error:", err);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleRefreshFeed = async () => {
    playTap();
    setIsRefreshing(true);
    setPage(1);
    try {
      const data = await fetchFeedData(1, mediaTypeFilter, categoryFilter);
      if (data.length > 0) {
        const rotated = [...data].sort(() => Math.random() - 0.25);
        setPosts(rotated);
        playChime();
        toast.success("Feed refreshed with fresh stories! 🌟", { duration: 1500 });
      }
    } catch {
      toast.error("Could not refresh feed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectCategory = async (cat) => {
    if (cat === "My Topics" && preferredTopics.length === 0) {
      setShowPersonalizeModal(true);
      return;
    }
    playTap();
    setCategoryFilter(cat);
    setPage(1);
    setHasMore(true);

    try {
      const data = await fetchFeedData(1, mediaTypeFilter, cat);
      setPosts(data);
    } catch (_) {}
  };

  const handleToggleFollow = async (targetCreatorId, username) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthGateAction("follow creators");
      setAuthGateOpen(true);
      return;
    }

    const currentlyFollowing = !!followingMap[targetCreatorId];
    setFollowingMap((prev) => ({ ...prev, [targetCreatorId]: !currentlyFollowing }));
    playPop();
    toast.success(
      currentlyFollowing
        ? `Unfollowed @${username || "creator"}`
        : `Following @${username || "creator"}! ✨`
    );

    try {
      const res = await axios.post(
        `${API_BASE}/user/follow/${targetCreatorId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      if (res.data?.isFollowing !== undefined) {
        setFollowingMap((prev) => ({ ...prev, [targetCreatorId]: res.data.isFollowing }));
      }
    } catch (err) {
      setFollowingMap((prev) => ({ ...prev, [targetCreatorId]: currentlyFollowing }));
      toast.error("Failed to update follow status");
    }
  };

  useEffect(() => {
    if (page === 1) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (activeTab === "following") {
      if (!token) return;
      axios
        .get(`${API_BASE}/post/feed/following?page=${page}&limit=12`, {
          headers: { "x-auth-token": token },
        })
        .then((res) => {
          const data = res.data?.posts;
          if (!Array.isArray(data) || data.length === 0) {
            setHasMore(false);
          } else {
            setPosts((prev) => [...prev, ...data]);
          }
        })
        .catch(() => {});
    } else {
      fetchFeedData(page, mediaTypeFilter, categoryFilter)
        .then((data) => {
          if (!Array.isArray(data) || data.length === 0) {
            setHasMore(false);
          } else {
            setPosts((prev) => [...prev, ...data]);
          }
        })
        .catch(() => {});
    }
  }, [page, activeTab, mediaTypeFilter, categoryFilter, fetchFeedData]);

  
  const viewedPosts = useRef(new Set());

const increaseView = useCallback(
  (postId) => {
    if (viewedPosts.current.has(postId)) return;

    viewedPosts.current.add(postId);
    console.log("VIEW +1:", postId);

    axios.post(`${API_BASE}/analytics/view/${postId}`).catch(() => {});
  },
  [API_BASE]
);

  
  useEffect(() => {
    if (!posts.length) return;

    // Strict single active video observer to save bandwidth and prevent browser lag
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            // Pause all other videos so only the centered one consumes decoding resources
            videoRefs.current.forEach((v) => {
              if (v && v !== video && !v.paused) {
                v.pause();
              }
            });
            video.muted = isGlobalMuted;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.55 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [posts, isGlobalMuted]);

  const hasLikedPost = useCallback((post) => {
    if (!userId || !Array.isArray(post.likes)) return false;
    return post.likes.some((id) => id?.toString() === userId.toString());
  }, [userId]);

  const handleLikePost = async (postId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthGateAction("like posts");
      setAuthGateOpen(true);
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/post/like/${postId}`, {}, { headers: { "x-auth-token": token } });
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) { toast.error("Failed to like"); }
  };

  const handleComment = async (postId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthGateAction("comment on posts");
      setAuthGateOpen(true);
      return;
    }
    const comment = commentTextMap[postId]?.trim();
    if (!comment) return;
    try {
      const res = await axios.post(`${API_BASE}/post/comment/${postId}`, { CommentText: comment, userId }, { headers: { "x-auth-token": token } });
      setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, comments: res.data.comments } : p));
      toast.success("Commented");
    } catch { toast.error("Error"); }
  };

  const handleDoubleTapMedia = (postId, e) => {
    setDoubleTapHeart((prev) => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setDoubleTapHeart((prev) => ({ ...prev, [postId]: false }));
    }, 900);

    if (e && e.clientX && e.clientY) triggerHeartBurst(e.clientX, e.clientY);
    playPop();

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthGateAction("like this post");
      setAuthGateOpen(true);
      return;
    }
    handleLikePost(postId);
  };

  const handleToggleBookmark = async (postId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthGateAction("bookmark posts to save for later");
      setAuthGateOpen(true);
      return;
    }

    playChime();
    const currentlyBookmarked = !!bookmarkedMap[postId];
    setBookmarkedMap((prev) => ({ ...prev, [postId]: !currentlyBookmarked }));

    try {
      const res = await axios.post(
        `${API_BASE}/post/bookmark/${postId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      if (res.data?.bookmarked !== undefined) {
        setBookmarkedMap((prev) => ({ ...prev, [postId]: res.data.bookmarked }));
        toast.success(res.data.bookmarked ? "Post saved to Bookmarks! 🔖" : "Removed from Bookmarks");
      }
    } catch (err) {
      setBookmarkedMap((prev) => ({ ...prev, [postId]: currentlyBookmarked }));
      toast.error("Failed to update bookmark");
    }
  };

  const toggleGlobalMute = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextMuted = !isGlobalMuted;
    setIsGlobalMuted(nextMuted);

    try {
      localStorage.setItem("fondpeace_global_muted", String(nextMuted));
    } catch (_) {}

    // Instantly sync audio on all video instances
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = nextMuted;
      }
    });

    playTap();
    toast.success(nextMuted ? "Sound muted for all posts 🔇" : "Sound unmuted for all posts 🔊", {
      duration: 1500,
      id: "global-mute-toast"
    });
  };

  const handlePressStart = (postId, index) => {
    if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
    speedTimeoutRef.current = setTimeout(() => {
      const video = videoRefs.current[index];
      if (video) {
        video.playbackRate = 2.0;
        setSpeedBadge(postId);
        playPop();
      }
    }, 200);
  };

  const handlePressEnd = (postId, index) => {
    if (speedTimeoutRef.current) {
      clearTimeout(speedTimeoutRef.current);
      speedTimeoutRef.current = null;
    }
    const video = videoRefs.current[index];
    if (video && video.playbackRate !== 1.0) {
      video.playbackRate = 1.0;
    }
    setSpeedBadge(null);
  };

  const handleTimeUpdate = (postId, e) => {
    const video = e.target;
    if (video && video.duration) {
      const percent = (video.currentTime / video.duration) * 100;
      setVideoProgress((prev) => ({ ...prev, [postId]: percent }));
    }
  };

  const lastPostRef = useCallback(
  (node) => {
    if (!hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1); // ✅ LOAD NEXT PAGE
      }
    });

    if (node) observerRef.current.observe(node);
  },
  [hasMore]
);

  useEffect(() => {
  viewObserver.current = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const postId = entry.target.dataset.postid;
          if (postId) increaseView(postId);
        }
      });
    },
    { threshold: 0.6 }
  );

  return () => viewObserver.current?.disconnect();
}, [increaseView]);

const handleShare = async (postData) => {
  try {
    // Correctly checking if it's a video/short
    const isVideo = postData.mediaType?.startsWith('video') || postData.mtype?.startsWith('video'); 
    const path = isVideo ? 'shorts' : 'post'; // URL path logic

    const url = `${window.location.origin}/${path}/${postData._id}`;
    const shareText = `${postData.title || 'Check this out!'}\n${url}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      
      // Show "Copied" text for this specific post
      setCopiedPostId(postData._id);
      
      // 2 seconds baad hide kar dein
      setTimeout(() => setCopiedPostId(null), 2000);
    }
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

  const renderPost = useCallback((post, index) => {
    const isExpanded = expandedPosts[post._id];
    const isVideo = Boolean(
      post.mediaType?.startsWith("video") ||
      post.mtype?.startsWith("video") ||
      (typeof post.media === "string" && (
        post.media.endsWith(".mp4") ||
        post.media.endsWith(".webm") ||
        post.media.includes("/video/")
      ))
    );
    const title = post.title || "";
    const titleText = isExpanded ? title : title.slice(0, 100) + (title.length > 100 ? "..." : "");

    // Aggregate all unique hashtags from both post.tags and post.title
    const captionHashtags = (post.title || "").match(/#[\w\u0590-\u05ff]+/g) || [];
    const allPostTags = Array.from(
      new Set([
        ...(Array.isArray(post.tags) ? post.tags : []).map((t) => (t.startsWith("#") ? t : `#${t}`)),
        ...captionHashtags,
      ])
    );

    return (
      <article 
        key={post._id} 
        className="bg-zinc-950 w-full mb-5 rounded-2xl overflow-hidden border border-white/[0.1] shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-white/25"
      >
    {/* Pinned Post Radiant Indicator */}
    {post.isPinned && (
      <div className="flex items-center gap-1.5 px-3.5 py-1 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border-b border-purple-500/15 text-[11px] font-bold text-purple-600 dark:text-purple-400">
        <Pin size={11} className="rotate-45 fill-purple-500 text-purple-500" />
        <span>Pinned by Creator</span>
      </div>
    )}
    
    {/* 1. HEADER - Clean & Compact */}
    <div className="flex items-center justify-between p-3.5 h-[58px]">
      <div className="flex items-center gap-2">
        <UserProfileHoverCard
          user={post.userId}
          currentUserId={userId}
          isFollowing={followingMap[post.userId?._id]}
          onToggleFollow={handleToggleFollow}
        >
          <div className="flex items-center gap-2.5 cursor-pointer">
            <Link href={`/profile/${post.userId?.username}`} className="relative group">
              {/* Story-style gradient ring */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600">
                <div className="bg-white dark:bg-gray-900 p-[1.5px] rounded-full w-full h-full">
                  <img 
                    src={post.userId?.profilePic || post.userId?.avatar || "/Fondpeace.jpg"} 
                    alt={post.userId?.username || "creator"} 
                    className="w-full h-full rounded-full object-cover" 
                    onError={(e) => { e.currentTarget.src = "/Fondpeace.jpg"; }}
                  />
                </div>
              </div>
            </Link>
            <div className="flex flex-col">
              <Link href={`/profile/${post.userId?.username}`} className="text-sm font-bold text-white leading-none hover:underline">
                {post.userId?.username || "Creator"}
              </Link>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5 font-medium">
                <Link 
                  href={isVideo ? `/short/${post._id}` : `/post/${post._id}`}
                  className="hover:underline hover:text-zinc-200 transition-colors"
                  title="Open post"
                >
                  {new Date(post.createdAt).toLocaleDateString()}
                </Link>
                {post.location && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        playTap();
                        router.push(`/searchbro?q=${encodeURIComponent(post.location)}`);
                      }}
                      className="inline-flex items-center gap-0.5 text-[10.5px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold truncate max-w-[140px] hover:underline cursor-pointer"
                      title={`Explore more posts from ${post.location}`}
                    >
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{post.location}</span>
                    </button>
                  </>
                )}
                {getReadingTime(post.title) && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{getReadingTime(post.title)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </UserProfileHoverCard>

        {/* Creator Quick Follow Button */}
        {post.userId?._id && String(userId) !== String(post.userId?._id) && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleFollow(post.userId?._id, post.userId?.username);
            }}
            className={`ml-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all active:scale-90 flex items-center gap-1 shrink-0 ${
              followingMap[post.userId?._id]
                ? "bg-black/[0.05] dark:bg-white/[0.08] text-gray-600 dark:text-gray-300 hover:bg-rose-500/20 hover:text-rose-400 border border-black/[0.06] dark:border-white/10"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25"
            }`}
          >
            {followingMap[post.userId?._id] ? (
              <>
                <Check size={10} className="text-emerald-500 stroke-[3]" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus size={10} className="stroke-[2.5]" />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {userId && (String(post.userId?._id || post.userId) === String(userId)) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              playTap();
              setAnalyticsModalPostId(post._id);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-100 transition-colors active:scale-95"
            title="View Post Analytics & Retention"
          >
            <BarChart2 size={12} />
            <span>Insights</span>
          </button>
        )}
        <PostActionsMenu 
          post={post} 
          currentUserId={userId} 
          isBookmarked={bookmarkedMap[post._id]}
          onToggleBookmark={() => handleToggleBookmark(post._id)}
          onOpenStoryCard={() => setStoryModalPost(post)}
          onPinToggled={(isPinned) => setPosts(prev => prev.map(p => p._id === post._id ? {...p, isPinned} : p))} 
        />
      </div>
    </div>

    {/* 2. MEDIA SECTION - Industry Standard Capped Max-Height & Responsive Fit */}
    {post.media ? (
      <div className="relative w-full bg-black flex items-center justify-center overflow-hidden max-h-[520px] rounded-xl my-1">
        <Link 
          href={isVideo ? `/short/${post._id}` : `/post/${post._id}`} 
          className="w-full h-auto flex items-center justify-center bg-black cursor-pointer group/media"
        >
          {isVideo ? (
            <video
              ref={(ref) => (videoRefs.current[index] = ref)}
              src={post.media}
              autoPlay
              loop
              playsInline
              muted={isGlobalMuted}
              preload="metadata"
              className="w-full max-h-[520px] object-contain block mx-auto"
            />
          ) : (
            <img 
              src={post.media} 
              alt={post.title || "media"} 
              className="w-full max-h-[520px] object-contain block mx-auto" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </Link>
        
        {isVideo && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleGlobalMute(e);
            }}
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/10 shadow-lg cursor-pointer"
            title={isGlobalMuted ? "Sound is muted" : "Sound is on"}
          >
            {isGlobalMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
          </button>
        )}
      </div>
    ) : (
      /* Modern Discussion / Thought Card (When no image or video is attached) */
      <Link 
        href={`/post/${post._id}`}
        className="block relative mx-3 my-1 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg overflow-hidden border border-white/10 hover:border-blue-500/40 hover:shadow-indigo-500/10 transition-all cursor-pointer group"
      >
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />
        <Quote className="absolute top-4 right-4 text-white/10 group-hover:text-blue-400/20 w-12 h-12 pointer-events-none rotate-12 transition-colors" />
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/20">
            <Sparkles size={11} className="text-blue-400" />
            {post.category || "Community Discussion"}
          </span>
          <span className="text-xs text-slate-400 group-hover:text-blue-300 transition-colors">• View Discussion & Replies</span>
        </div>
        <div className="text-base sm:text-lg font-medium leading-relaxed text-slate-100 whitespace-pre-wrap">
          {renderFormattedCaption(post.title, (tag) => {
            playTap();
            setSelectedHashtag(tag);
          })}
        </div>
      </Link>
    )}

    {/* 3. INTERACTION & CONTENT AREA */}
    <div className="px-4 pt-3.5 pb-4">
      {/* Action Icons Bar - Streamlined, Balanced, Non-cluttered */}
      <div className="flex items-center justify-between py-1 mb-2.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Like */}
          <div className="relative flex items-center">
            <button 
              onClick={(e) => {
                if (e && e.clientX && e.clientY) triggerHeartBurst(e.clientX, e.clientY);
                playPop();
                handleLikePost(post._id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setReactionPickerPostId(post._id);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95 group"
              title="Like"
            >
              {hasLikedPost(post) ? (
                <FaHeart className="text-rose-500 text-[18px] drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
              ) : (
                <FaRegHeart className="text-[18px] group-hover:scale-110 transition-transform" />
              )}
              <span className={`text-xs font-semibold ${hasLikedPost(post) ? "text-rose-400 font-bold" : "text-gray-400"}`}>
                {post.likes?.length || 0}
              </span>
            </button>

            {/* Floating Multi-Reaction Bar */}
            <PostReactionsBar
              isOpen={reactionPickerPostId === post._id}
              onClose={() => setReactionPickerPostId(null)}
              onSelect={(reaction) => {
                handleLikePost(post._id);
                toast.success(`Reacted with ${reaction.emoji}`);
              }}
            />
          </div>

          {/* Comment */}
          <button 
            onClick={() => {
              playPop();
              setActiveCommentsPost(post);
            }} 
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all active:scale-95 group"
            title="Comments"
          >
            <FaCommentDots className="text-[18px] group-hover:scale-110 transition-transform" /> 
            <span className="text-xs font-semibold text-gray-400">{post.comments?.length || 0}</span>
          </button>

          {/* Repost */}
          <button
            onClick={() => {
              playPop();
              setRepostModalPost(post);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-95 group"
            title="Repost"
          >
            <Repeat2 className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-gray-400">{post.repostsCount || 0}</span>
          </button>

          {/* Creator Cheer / Super Thanks */}
          <button
            onClick={() => {
              playPop();
              setAppreciationPost(post);
            }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all active:scale-95"
            title="Cheer Creator"
          >
            <Sparkles className="w-[17px] h-[17px]" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Bookmark */}
          <button
            onClick={() => handleToggleBookmark(post._id)}
            className={`p-1.5 rounded-xl transition-all active:scale-95 ${
              bookmarkedMap[post._id]
                ? "text-blue-400 bg-blue-500/10"
                : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
            }`}
            title={bookmarkedMap[post._id] ? "Saved" : "Save Bookmark"}
          >
            <Bookmark
              size={17}
              className={bookmarkedMap[post._id] ? "fill-blue-500" : ""}
            />
          </button>

          {/* Share */}
          <button 
            onClick={() => handleShare(post)} 
            className="p-1.5 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all active:scale-95 relative"
            title="Share Post"
          >
            <FaShareAlt className="text-[16px]" />
            {copiedPostId === post._id && (
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap z-50">
                Copied!
              </span>
            )}
          </button>

          {/* Views count */}
          <div className="flex items-center gap-1 text-gray-500 px-2 py-0.5 rounded-lg text-[11px] font-semibold">
            <FaEye size={12} className="opacity-70" />
            <span>{post.views || 0}</span>
          </div>
        </div>
      </div>

      {/* Stats and Caption */}
      <div className="space-y-2">
        {post.media && (
          <div className="text-sm text-zinc-100 leading-relaxed">
            <span className="font-bold mr-2 hover:underline cursor-pointer text-white">
              {post.userId?.username}
            </span>
            <span className="whitespace-pre-wrap text-zinc-200">
              {renderFormattedCaption(titleText, (tag) => {
                playTap();
                setSelectedHashtag(tag);
              })}
            </span>
            {title.length > 100 && (
              <button 
                onClick={() => setExpandedPosts(p => ({...p, [post._id]: !isExpanded}))} 
                className="text-blue-400 font-medium ml-1.5 hover:underline"
              >
                {isExpanded ? " show less" : "...more"}
              </button>
            )}
          </div>
        )}

        {/* Smart 1-Click TL;DR Key Takeaways on Long Posts */}
        <PostQuickSummary text={post.title} />

        {/* 1-Click Inline Post Translator */}
        <PostTranslator text={post.title} />

        {/* Clickable Topic Hashtag Pills (Aggregated from caption + post.tags) */}
        {allPostTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {allPostTags.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playTap();
                  setSelectedHashtag(t);
                }}
                className="inline-flex items-center gap-0.5 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-500/30 px-2.5 py-0.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <span className="opacity-70">#</span>
                <span>{t.replace(/^#+/, "")}</span>
              </button>
            ))}
          </div>
        )}

        {/* Comment Preview Button - Opens Comments Bottom Sheet */}
        {post.comments?.length > 0 ? (
          <button 
            onClick={() => {
              playPop();
              setActiveCommentsPost(post);
            }} 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition flex items-center gap-1.5 pt-0.5"
          >
            View all {post.comments.length} comments...
          </button>
        ) : (
          <button 
            onClick={() => {
              playPop();
              setActiveCommentsPost(post);
            }} 
            className="text-xs text-gray-400 hover:text-blue-500 transition block pt-0.5"
          >
            Add a comment...
          </button>
        )}

        {/* Interactive Poll in Feed */}
        {post.poll && (
          <PollCard
            postId={post._id}
            pollData={post.poll}
            currentUserId={userId}
            onVoteSuccess={(updatedPoll) => {
              setPosts(prev => prev.map(p => p._id === post._id ? { ...p, poll: updatedPoll } : p));
            }}
          />
        )}

        {/* Rich Link Preview in Feed */}
        {post.linkPreview && (
          <LinkPreviewCard preview={post.linkPreview} />
        )}
      </div>

      {/* Active Comments Dropdown */}
      {commentBoxOpen[post._id] && (
        <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/10">
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
            {post.comments?.map((cmt, i) => (
              <div key={i} className="flex gap-2 text-sm items-start">
                <span className="font-bold whitespace-nowrap text-white">{cmt?.userId?.username || "User"}</span>
                <span className="text-zinc-200 leading-tight">{cmt?.CommentText}</span>
              </div>
            ))}
          </div>
          
          {/* New Comment Input Field */}
          <div className="flex items-center gap-3 mt-2 border border-white/10 rounded-full px-4 py-2 bg-white/[0.04] focus-within:bg-white/[0.08] focus-within:border-blue-500/50 transition-all">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentTextMap[post._id] || ""}
              onChange={(e) => setCommentTextMap(p => ({...p, [post._id]: e.target.value}))}
              className="flex-1 text-sm bg-transparent outline-none text-white placeholder-zinc-500"
            />
            <button 
              onClick={() => handleComment(post._id)}
              disabled={!commentTextMap[post._id]?.trim()}
              className="text-blue-400 text-sm font-bold disabled:opacity-30 hover:text-blue-300 transition"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  </article>
);
  }, [commentTextMap, commentBoxOpen, expandedPosts, userId, isGlobalMuted, followingMap]);

  const filteredPosts = posts.filter((post) => {
    if (categoryFilter === "All") return true;
    if (categoryFilter === "Shorts") {
      return post.mediaType?.startsWith("video") || post.mtype?.startsWith("video");
    }
    return (
      post.category === categoryFilter ||
      post.tags?.some((t) => t?.toLowerCase() === categoryFilter.toLowerCase())
    );
  });

  return (
    <div className="w-full">
      {/* ─── Sleek Community Header & Tabs ─── */}
      <div className="flex items-center justify-between px-1 mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Community
        </h2>
        {/* Streamlined minimal filter switcher */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-white/[0.1] rounded-xl backdrop-blur-xl">
          <button
            onClick={() => {
              if (activeTab !== "foryou") handleTabChange("foryou");
              if (mediaTypeFilter !== "all") handleMediaTypeChange("all");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "foryou" && mediaTypeFilter === "all"
                ? "bg-white text-black font-extrabold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => handleTabChange("following")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "following"
                ? "bg-white text-black font-extrabold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Following
          </button>
          <button
            onClick={() => {
              if (activeTab !== "foryou") handleTabChange("foryou");
              handleMediaTypeChange("video");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mediaTypeFilter === "video"
                ? "bg-white text-black font-extrabold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            🎬 Videos
          </button>
          <button
            onClick={() => {
              if (activeTab !== "foryou") handleTabChange("foryou");
              handleMediaTypeChange("discussion");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mediaTypeFilter === "discussion"
                ? "bg-white text-black font-extrabold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            💭 Discussions
          </button>
          <button
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            className="p-1.5 text-zinc-400 hover:text-white transition-all active:scale-90 cursor-pointer"
            title="Refresh Feed"
          >
            <RotateCw size={13} className={isRefreshing ? "animate-spin text-white" : ""} />
          </button>
        </div>
      </div>
      {/* Email Verification Shield Prompt Banner (If logged in & unverified) */}
      {currentUserData && !currentUserData.isEmailVerified && !dismissedVerifyBanner && (
        <div className="max-w-[600px] mx-auto px-3 sm:px-0 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs text-blue-900 dark:text-blue-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Verify your email to unlock your <strong>Verified Shield 🛡️</strong> badge!
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  playPop();
                  setEmailVerificationOpen(true);
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Verify Now
              </button>
              <button
                onClick={() => setDismissedVerifyBanner(true)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Creator Stories Bar */}
      <StoriesBar />

      {/* In-Feed Creator Quick Composer */}
      {activeTab === "foryou" && (
        <div className="px-3 sm:px-0">
          <QuickPostComposer
            onPostCreated={(newPost) => {
              if (newPost) setPosts(prev => [newPost, ...prev]);
            }}
            currentUserId={userId}
          />
        </div>
      )}

      {/* Loading state for Following tab */}
      {followingLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">Loading followed creators...</p>
        </div>
      )}

      {/* Empty state for Following tab (Renders Suggested Creators Cards) */}
      {!followingLoading && activeTab === "following" && filteredPosts.length === 0 && (
        <SuggestedCreatorsWidget
          currentUserId={userId}
          followingMap={followingMap}
          onToggleFollow={handleToggleFollow}
          title="You're Not Following Anyone Yet"
          subtitle="Follow these active creators to see their latest thoughts, reels, and stories in your feed!"
        />
      )}

      {/* Posts List - Stream vs Grid View */}
      {!followingLoading && viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-2 sm:px-0 mb-6">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              onClick={() => {
                playPop();
                if (post.media) {
                  setLightboxImage({ url: post.media, alt: post.title });
                } else {
                  router.push(`/post/${post._id}`);
                }
              }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-black cursor-pointer group shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-zinc-800"
            >
              {post.mediaType?.startsWith("video") ? (
                <video
                  src={post.media}
                  muted
                  loop
                  playsInline
                  preload="none"
                  poster={post.thumbnail || undefined}
                  className="w-full h-full object-cover"
                />
              ) : post.media ? (
                <img
                  src={post.media}
                  alt={post.title || "Post"}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full p-3 bg-gradient-to-tr from-blue-900 to-indigo-950 flex flex-col justify-between text-white">
                  <span className="text-[11px] font-bold">@{post.userId?.username || "creator"}</span>
                  <p className="text-xs line-clamp-3 leading-tight">{post.title}</p>
                </div>
              )}

              {/* Hover Stats Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs">
                <span className="flex items-center gap-1">
                  <FaHeart className="fill-red-500 text-red-500" />
                  {post.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <FaCommentDots />
                  {post.comments?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Stream View */
        !followingLoading && filteredPosts.map((post, idx) => {
          const isLast = idx === filteredPosts.length - 1;

          return (
            <React.Fragment key={post._id || idx}>
              <div
                data-postid={post._id}
                ref={(node) => {
                  if (node) viewObserver.current?.observe(node);
                  if (isLast) lastPostRef(node);
                }}
              >
                {renderPost(post, idx)}
              </div>

              {/* In-Feed Creator Discovery Carousel (After 3rd post for cold-start exploration) */}
              {idx === 2 && activeTab === "foryou" && (
                <div className="max-w-[600px] mx-auto px-2 sm:px-0">
                  <SuggestedCreatorsWidget
                    currentUserId={userId}
                    followingMap={followingMap}
                    onToggleFollow={handleToggleFollow}
                    variant="carousel"
                    title="Discover Creators You Might Like"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })
      )}

      {/* "You're All Caught Up" Celebration Card (Instagram Style) */}
      {!followingLoading && filteredPosts.length > 0 && !hasMore && (
        <div className="max-w-[600px] mx-auto px-4 py-8 my-6 bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-3xl text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Check size={24} className="stroke-[3]" />
          </div>
          <h3 className="font-black text-gray-900 dark:text-white text-base sm:text-lg">
            You're All Caught Up! 🎉
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            You've seen all the latest discussions, reels, and stories for now.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Link
              href="/upload"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              ✍️ Share a Thought / Reel
            </Link>
            <button
              type="button"
              onClick={() => {
                playTap();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-3.5 py-2 bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              ↑ Back to Top
            </button>
          </div>
        </div>
      )}

      <QuickAuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        actionName={authGateAction}
      />

      {/* Fullscreen Photo Lightbox & Zoom */}
      <ImageLightboxModal
        isOpen={!!lightboxImage}
        imageUrl={lightboxImage?.url}
        altText={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      {/* Desktop Keyboard Shortcuts Cheatsheet */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Floating New Posts Pill */}
      <NewPostsPill
        count={newPostsCount}
        onRefresh={() => setNewPostsCount(0)}
      />

      {/* 1-Click Viral Story Card Generator Modal */}
      <StoryCardExportModal
        isOpen={!!storyModalPost}
        post={storyModalPost}
        onClose={() => setStoryModalPost(null)}
      />

      {/* Personalized Topics Customizer Modal */}
      <PersonalizeFeedModal
        isOpen={showPersonalizeModal}
        onClose={() => setShowPersonalizeModal(false)}
        onSaveTopics={(topics) => {
          setPreferredTopics(topics);
          handleSelectCategory("My Topics");
        }}
      />

      {/* Modern Interactive Comments Drawer & Bottom Sheet */}
      <CommentsSheetModal
        isOpen={!!activeCommentsPost}
        onClose={() => setActiveCommentsPost(null)}
        postId={activeCommentsPost?._id}
        post={activeCommentsPost}
        currentUserId={userId}
        onCommentCountChange={(newCount) => {
          if (!activeCommentsPost?._id) return;
          setPosts(prev => prev.map(p => {
            if (p._id !== activeCommentsPost._id) return p;
            return {
              ...p,
              comments: p.comments && p.comments.length === newCount ? p.comments : new Array(newCount).fill({})
            };
          }));
        }}
      />

      {/* Picture-in-Picture Mini Floating Video Player */}
      {floatingVideo && (
        <MiniFloatingPlayer
          post={floatingVideo.post}
          videoSrc={floatingVideo.videoSrc}
          currentTime={floatingVideo.currentTime || 0}
          isMuted={isGlobalMuted}
          onToggleMute={toggleGlobalMute}
          onClose={() => setFloatingVideo(null)}
          onScrollToPost={(postId) => {
            setFloatingVideo(null);
            const el = document.querySelector(`[data-postid="${postId}"]`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />
      )}

      {/* Creator Super Thanks & Appreciation Cheer Modal */}
      <CreatorAppreciationModal
        isOpen={!!appreciationPost}
        onClose={() => setAppreciationPost(null)}
        post={appreciationPost}
      />

      {/* 1-Click Viral Repost & Quote Modal */}
      <RepostModal
        isOpen={!!repostModalPost}
        post={repostModalPost}
        onClose={() => setRepostModalPost(null)}
        onRepostSuccess={(newRepost) => {
          if (newRepost) setPosts(prev => [newRepost, ...prev]);
        }}
      />

      {/* Creator Live Analytics & Retention Modal */}
      <CreatorAnalyticsModal
        isOpen={!!analyticsModalPostId}
        postId={analyticsModalPostId}
        onClose={() => setAnalyticsModalPostId(null)}
      />

      {/* Hashtag & Trending Topic Explorer Drawer */}
      <HashtagDrawer
        hashtag={selectedHashtag}
        isOpen={!!selectedHashtag}
        onClose={() => setSelectedHashtag(null)}
        onSelectPost={(selectedP) => {
          setSelectedHashtag(null);
          const el = document.querySelector(`[data-postid="${selectedP._id}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            router.push(`/post/${selectedP._id}`);
          }
        }}
      />

      {/* Floating Back to Top FAB - Bottom Right */}
      {showScrollTop && (
        <button
          onClick={() => {
            playPop();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 bg-[#0e111d]/90 hover:bg-blue-600 text-white rounded-full shadow-2xl backdrop-blur-xl border border-white/15 hover:border-blue-400 transition-all hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-3 duration-200 cursor-pointer group"
          title="Scroll back to top"
          aria-label="Scroll back to top"
        >
          <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Email OTP Verification Modal */}
      <EmailVerificationModal
        isOpen={emailVerificationOpen}
        onClose={() => setEmailVerificationOpen(false)}
        userEmail={currentUserData?.email}
        onVerificationSuccess={(updatedUser) => {
          setCurrentUserData((prev) => ({ ...prev, isEmailVerified: true }));
        }}
      />
    </div>
  );
}











// 'use client';
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import Link from "next/link";
// import jwt from "jsonwebtoken";
// import toast from "react-hot-toast";
// import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye, FaVolumeMute, FaVolumeUp } from "react-icons/fa";


// export default function Village({ initialPosts = [] }) {
//   const [posts, setPosts] = useState(initialPosts);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const observerRef = useRef(null);

//   const [commentTextMap, setCommentTextMap] = useState({});
//   const [commentBoxOpen, setCommentBoxOpen] = useState({});
//   const [expandedPosts, setExpandedPosts] = useState({});
//   const [userId, setUserId] = useState(null);
//   const [mutedMap, setMutedMap] = useState({});
//   const videoRefs = useRef([]);
//   const router = useRouter();
//   const API_BASE = "https://backend-k.vercel.app";
//   const viewObserver = useRef(null);
  
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const decoded = jwt.decode(token);
//       if (decoded && decoded.exp * 1000 > Date.now()) {
//         setUserId(decoded.UserId);
//       }
//     } catch (e) { console.error("Token error"); }
//   }, []);
//   useEffect(() => {
//   if (page === 1) return;

//   axios
//     .get(`${API_BASE}/post/mango/getall?page=${page}`)
//     .then((res) => {
//       if (!res.data.length) {
//         setHasMore(false);
//       } else {
//         setPosts((prev) => [...prev, ...res.data]);
//       }
//     })
//     .catch(() => {});
// }, [page]);

  
//   const viewedPosts = useRef(new Set());

// const increaseView = useCallback(
//   (postId) => {
//     if (viewedPosts.current.has(postId)) return;

//     viewedPosts.current.add(postId);
//     console.log("VIEW +1:", postId);

//     axios.post(`${API_BASE}/post/view/${postId}`).catch(() => {});
//   },
//   [API_BASE]
// );

  
//   useEffect(() => {
//     if (!posts.length) return;
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           const video = entry.target;
//           if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
//             video.play().catch(() => {});
//           } else {
//             video.pause();
//           }
//         });
//       },
//       { threshold: 0.5 }
//     );
//     videoRefs.current.forEach((video) => { if (video) observer.observe(video); });
//     return () => observer.disconnect();
//   }, [posts]);

//   const hasLikedPost = useCallback((post) => {
//     if (!userId || !Array.isArray(post.likes)) return false;
//     return post.likes.some((id) => id?.toString() === userId.toString());
//   }, [userId]);

//   const handleLikePost = async (postId) => {
//     const token = localStorage.getItem("token");
//     if (!token) { toast.error("Please login"); return; }
//     try {
//       const res = await axios.post(`${API_BASE}/post/like/${postId}`, {}, { headers: { "x-auth-token": token } });
//       setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likes: res.data.likes } : p));
//     } catch (err) { toast.error("Failed to like"); }
//   };

//   const handleComment = async (postId) => {
//     const token = localStorage.getItem("token");
//     const comment = commentTextMap[postId]?.trim();
//     if (!token || !comment) return;
//     try {
//       const res = await axios.post(`${API_BASE}/post/comment/${postId}`, { CommentText: comment, userId }, { headers: { "x-auth-token": token } });
//       setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
//       setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, comments: res.data.comments } : p));
//       toast.success("Commented");
//     } catch { toast.error("Error"); }
//   };

//   const toggleMute = (index) => {
//     const video = videoRefs.current[index];
//     if (video) {
//       video.muted = !video.muted;
//       setMutedMap(prev => ({ ...prev, [index]: video.muted }));
//     }
//   };
//   const lastPostRef = useCallback(
//   (node) => {
//     if (!hasMore) return;

//     if (observerRef.current) observerRef.current.disconnect();

//     observerRef.current = new IntersectionObserver((entries) => {
//       if (entries[0].isIntersecting) {
//         setPage((prev) => prev + 1); // ✅ LOAD NEXT PAGE
//       }
//     });

//     if (node) observerRef.current.observe(node);
//   },
//   [hasMore]
// );

//   useEffect(() => {
//   viewObserver.current = new IntersectionObserver(
//     (entries) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           const postId = entry.target.dataset.postid;
//           if (postId) increaseView(postId);
//         }
//       });
//     },
//     { threshold: 0.6 }
//   );

//   return () => viewObserver.current?.disconnect();
// }, [increaseView]);


//   const renderPost = useCallback((post, index) => {
//     const isExpanded = expandedPosts[post._id];
//     const isVideo = post.mediaType?.startsWith("video");
//     const title = post.title || "";
//     const titleText = isExpanded ? title : title.slice(0, 100) + (title.length > 100 ? "..." : "");

//    return (
//   <article 
//     key={post._id} 
//     className="bg-white w-full max-w-[600px] mx-auto mb-4 sm:mb-8 sm:rounded-lg overflow-hidden border-y sm:border border-gray-200 shadow-sm"
//   >
    
//     {/* 1. HEADER - Clean & Compact */}
//     <div className="flex items-center justify-between p-3 h-[56px]">
//       <div className="flex items-center gap-3">
//         <Link href={`/profile/${post.userId?.username}`} className="relative group">
//           {/* Story-style gradient ring */}
//           <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
//             <div className="bg-white p-[1.5px] rounded-full w-full h-full">
//               <img 
//                 src="https://www.fondpeace.com/og-image.jpg" 
//                 alt="profile" 
//                 className="w-full h-full rounded-full object-cover" 
//               />
//             </div>
//           </div>
//         </Link>
//         <Link href={`/profile/${post.userId?.username}`} className="flex flex-col">
//           <span className="text-sm font-bold text-gray-900 leading-none hover:underline">
//             {post.userId?.username || "Unknown"}
//           </span>
//           <span className="text-[11px] text-gray-500 mt-0.5 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
//         </Link>
//       </div>
//       <button onClick={() => toast("Options coming soon 🚀")} className="text-gray-500 hover:text-black px-2 transition-colors">
//         <span className="text-lg tracking-widest font-bold">•••</span>
//       </button>
//     </div>

//     {/* 2. MEDIA SECTION - No more "Ugly" stretching */}
//     {post.media && (
//       <div className="relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[750px]">
//         <Link 
//           href={isVideo ? `/short/${post._id}` : `/post/${post._id}`} 
//           className="w-full h-full flex items-center justify-center bg-black"
//         >
//           {isVideo ? (
//             <video
//               ref={(ref) => (videoRefs.current[index] = ref)}
//               src={post.media}
//               autoPlay
//               loop
//               playsInline
//              muted
//              preload="none"
//               /* h-auto + object-contain prevents distorted faces/shapes */
//               className="w-full h-auto max-h-[750px] object-contain block mx-auto"
//             />
//           ) : (
//             <img 
//               src={post.media} 
//               alt={post.title} 
//               className="w-full h-auto max-h-[750px] object-contain block mx-auto" 
//             />
//           )}
//         </Link>
        
//         {isVideo && (
//           <button 
//             onClick={(e) => { e.preventDefault(); toggleMute(index); }}
//             className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/80 transition"
//           >
//             {mutedMap[index] ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
//           </button>
//         )}
//       </div>
//     )}

//     {/* 3. INTERACTION & CONTENT AREA */}
//     <div className="px-3 pt-3 pb-4">
//       {/* Action Icons */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-4">
//           <button onClick={() => handleLikePost(post._id)} className="flex items-center gap-1 transition-transform active:scale-125">
//   {hasLikedPost(post) ? (
//     <div className="flex items-center gap-1">
//       <FaHeart className="text-red-500 text-[26px]" />
//       <span>{post.likes?.length || 0}</span>
//     </div>
//   ) : (
//     <div className="flex items-center gap-1">
//       <FaRegHeart className="text-[26px] text-gray-800 hover:text-gray-500" />
//       <span>{post.likes?.length || 0}</span>
//     </div>
//   )}
// </button>

//           <button onClick={() => setCommentBoxOpen(p => ({...p, [post._id]: !commentBoxOpen[post._id]}))} className="flex items-center gap-1 transition-transform active:scale-125">
//             <FaCommentDots className="text-[24px] text-gray-800 hover:text-gray-500" /> 
//             <span>{post.comments?.length || 0}</span>
//           </button>
//           <button onClick={() => handleShare(post)}>
//             <FaShareAlt className="text-[22px] text-gray-800 hover:text-gray-500" />
//           </button>
//         </div>
//         <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
//           <FaEye size={14} />
//           <span className="text-[11px] font-bold">{post.views || 0}</span>
//         </div>
//       </div>

//       {/* Stats and Caption */}
//       <div className="space-y-1.5">
        
        
//         <div className="text-sm text-gray-900 leading-snug">
//           <span className="font-bold mr-2 hover:underline cursor-pointer">
//             {post.userId?.username}
//           </span>
//           <span className="whitespace-pre-wrap">{titleText}</span>
//           {title.length > 100 && (
//             <button 
//               onClick={() => setExpandedPosts(p => ({...p, [post._id]: !isExpanded}))} 
//               className="text-gray-500 font-medium ml-1 hover:text-gray-700"
//             >
//               {isExpanded ? " show less" : "...more"}
//             </button>
//           )}
//         </div>

//         {/* Comment Preview Logic */}
//         {post.comments?.length > 0 && !commentBoxOpen[post._id] && (
//           <button 
//             onClick={() => setCommentBoxOpen(p => ({...p, [post._id]: true}))}
//             className="text-sm text-gray-500 block hover:text-gray-400 transition"
//           >
//             View all {post.comments.length} comments
//           </button>
//         )}
//       </div>

//       {/* Active Comments Dropdown */}
//       {commentBoxOpen[post._id] && (
//         <div className="mt-4 pt-3 border-t border-gray-100">
//           <div className="space-y-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
//             {post.comments?.map((cmt, i) => (
//               <div key={i} className="flex gap-2 text-sm items-start">
//                 <span className="font-bold whitespace-nowrap">{cmt?.userId?.username || "User"}</span>
//                 <span className="text-gray-700 leading-tight">{cmt?.CommentText}</span>
//               </div>
//             ))}
//           </div>
          
//           {/* New Comment Input Field */}
//           <div className="flex items-center gap-3 mt-2 border border-gray-100 rounded-full px-4 py-2 bg-gray-50 focus-within:bg-white focus-within:border-blue-200 transition-all">
//             <input
//               type="text"
//               placeholder="Add a comment..."
//               value={commentTextMap[post._id] || ""}
//               onChange={(e) => setCommentTextMap(p => ({...p, [post._id]: e.target.value}))}
//               className="flex-1 text-sm bg-transparent outline-none text-gray-800"
//             />
//             <button 
//               onClick={() => handleComment(post._id)}
//               disabled={!commentTextMap[post._id]?.trim()}
//               className="text-blue-500 text-sm font-bold disabled:opacity-30 hover:text-blue-700 transition"
//             >
//               Post
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   </article>
// );
//   }, [commentTextMap, commentBoxOpen, expandedPosts, userId, mutedMap]);

//   return (
//     <div className="max-w-2xl mx-auto w-full">
//       {posts.map((post, idx) => {
//   const isLast = idx === posts.length - 1;

//   return (
//       <div
//   key={post._id}
//   data-postid={post._id}
//   ref={(node) => {
//     if (node) viewObserver.current?.observe(node);
//     if (isLast) lastPostRef(node);
//   }}
// >
//   {renderPost(post, idx)}
// </div>

//   );
// })}


//     </div>
//   );
// }













// 'use client';
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import Link from "next/link";
// import jwt from "jsonwebtoken";
// import toast from "react-hot-toast";

 
// import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";
  

// export default function Village({ initialPosts = [] }) {

//   const [posts, setPosts] = useState(initialPosts);
//   const [commentTextMap, setCommentTextMap] = useState({});
//   const [commentBoxOpen, setCommentBoxOpen] = useState({});
//   const [expandedPosts, setExpandedPosts] = useState({});
//   const [userId, setUserId] = useState(null);
//   const videoRefs = useRef([]);
//   const router = useRouter();
//   const API_BASE = "https://backend-k.vercel.app";

  

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     const startRedirectTimer = () => {
//       const timer = setTimeout(() => {
//         window.location.href = "/login";
//       }, 2 * 60 * 1000);
//       return timer;
//     };

//     let timer;

    

//     if (!token) {
//       timer = startRedirectTimer();
//       return () => clearTimeout(timer);
//     }

//     try {
//       const decoded = jwt.decode(token);

//       if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
//         localStorage.removeItem("token");
//         timer = startRedirectTimer();
//         return () => clearTimeout(timer);
//       }

//       setUserId(decoded.UserId);
//     } catch {
//       localStorage.removeItem("token");
//       timer = startRedirectTimer();
//       return () => clearTimeout(timer);
//     }
//   }, []);

//   // IntersectionObserver for autoplay on 50% visibility
//   useEffect(() => {
//     if (!posts.length) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           const video = entry.target;
//           if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
//             video.play().catch(() => {});
//           } else {
//             video.pause();
//           }
//         });
//       },
//       { threshold: 0.5 }
//     );

//     videoRefs.current.forEach((video) => {
//       if (video) observer.observe(video);
//     });

//     return () => observer.disconnect();
//   }, [posts]);

  

//  const hasLikedPost = useCallback(
//   (post) => {
//     if (!userId) return false;
//     if (!Array.isArray(post.likes)) return false;

//     return post.likes.some(
//       (id) => id?.toString() === userId.toString()
//     );
//   },
//   [userId]
// );



//   const handleLikePost = async (postId) => {
//   const token = localStorage.getItem("token");

//   if (!token || !userId) {
//     toast.error("Please login to like this post");
//     router.push("/login");
//     return;
//   }

//   try {
//     const res = await axios.post(
//       `${API_BASE}/post/like/${postId}`,
//       {},
//       { headers: { "x-auth-token": token } }
//     );

//     setPosts((prev) =>
//       prev.map((p) =>
//         p._id === postId
//           ? { ...p, likes: res.data.likes }
//           : p
//       )
//     );
//   } catch (err) {
//     toast.error("Failed to like post");
//   }
// };




//   const handleComment = async (postId) => {
//   const token = localStorage.getItem("token");
//   const comment = commentTextMap[postId]?.trim();

//   if (!token || !userId) {
//     toast.error("Login required to comment");
//     router.push("/login");
//     return;
//   }

//   if (!comment) {
//     toast.error("Comment cannot be empty");
//     return;
//   }

//   try {
//     const res = await axios.post(
//       `${API_BASE}/post/comment/${postId}`,
//       { CommentText: comment, userId },
//       { headers: { "x-auth-token": token } }
//     );

//     setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
//     setPosts((prev) =>
//       prev.map((p) =>
//         p._id === postId
//           ? { ...p, comments: res.data.comments }
//           : p
//       )
//     );

//     toast.success("Comment added");
//   } catch {
//     toast.error("Failed to post comment");
//   }
// };


//   const toggleCommentBox = (postId) => {
//     setCommentBoxOpen((prev) => ({ ...prev, [postId]: !prev[postId] }));
//   };

//   const toggleExpanded = (postId) => {
//     setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
//   };

//   const handleShare = async (post) => {
//   try {
//     const shareText = `${post.title}\n${window.location.origin}/post/${post._id}`;
//     await navigator.clipboard.writeText(shareText);
//     toast.success("Link copied to clipboard");
//   } catch (error) {
//     console.error("Share failed:", error);
//     toast.error("Share failed");
//   }
// };




//   const renderPost = useCallback(
//     (post, index) => {
//       const isExpanded = expandedPosts[post._id];
//       const isVideo = post.mediaType?.startsWith("video");
//       const commentText = commentTextMap[post._id] || "";
//       const commentsVisible = commentBoxOpen[post._id];
//       const title = post.title || "";
//       const titleText = isExpanded
//         ? title
//         : title.slice(0, 100) + (title.length > 100 ? "..." : "");



      
//   return (
//         <div key={post._id} className="bg-white shadow rounded-lg p-4 mb-6">
          
          
//           <div className="flex items-center justify-between mb-4">
//   {/* Left side → Avatar + Username */}
//   <div className="flex items-center gap-3">
//    <Link
//         href={`/profile/${post.userId?.username}`}
//         className="flex items-center gap-3"
//     >
//     <img
//       src={"https://www.fondpeace.com/og-image.jpg"}
//       alt="profile"
//       className="w-12 h-12 rounded-full object-cover"
//     />
//     <span className="font-semibold text-gray-900">
//       {post.userId?.username || "Unknown"}
//     </span>
//    </Link>
//   </div>

//   {/* Right side → 3 dots menu */}
//   <button
//     className="text-gray-600 hover:text-gray-900 text-2xl px-2"
//     onClick={(e) => {
//       e.stopPropagation(); // prevent opening post when clicked
//       toast("Options coming soon 🚀");

//     }}
//   >
//     ⋮
//   </button>
// </div>





          

//           <p className="text-gray-800 mb-4">
//             {titleText}
//             {title.length > 100 && (
//               <span
//                 className="text-blue-600 ml-2 cursor-pointer"
//                 onClick={() => toggleExpanded(post._id)}
//               >
//                 {isExpanded ? " See less" : " See more"}
//               </span>
//             )}
//           </p>

          
              
//                {post.media && (
//   <Link
//     href={isVideo ? `/short/${post._id}` : `/post/${post._id}`}
//     prefetch
//   >
//     <div className="relative w-full max-w-[600px] aspect-square rounded-lg mb-4 overflow-hidden mx-auto shadow-md cursor-pointer">
      
//       {/* VIDEO */}
//       {isVideo ? (
//         <video
//           ref={(ref) => (videoRefs.current[index] = ref)}
//           src={post.media}
//           autoPlay
//           loop
//           playsInline
//           muted
//           preload="none"
//           className="w-full h-full object-cover rounded-lg"
//         />
//       ) : (
//         /* IMAGE */
//         <img
//           src={post.media}
//           alt={post.title}
//           className="w-full h-full object-cover rounded-lg"
//         />
//       )}

//       {/* Sound toggle for video only */}
//       {isVideo && (
//         <button
//           className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-2"
//           onClick={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             const video = videoRefs.current[index];
//             if (video) video.muted = !video.muted;
//           }}
//         >
//           🔊
//         </button>
//       )}

//     </div>
//   </Link>
// )}


             

//           <div className="flex items-center justify-between text-gray-700 mb-4 text-sm">

//   {/* ❤️ LIKE */}
//   <button
//     onClick={() => handleLikePost(post._id)}
//     className="flex items-center gap-1"
//   >
//     {hasLikedPost(post) ? (
//       <FaHeart className="text-red-600 text-lg" />
//     ) : (
//       <FaRegHeart className="text-lg" />
//     )}
//     <span>{post.likes?.length || 0}</span>
//   </button>

//   {/* 💬 COMMENT */}
//   <button
//     onClick={() => toggleCommentBox(post._id)}
//     className="flex items-center gap-1"
//   >
//     <FaCommentDots className="text-lg" />
//     <span>{post.comments?.length || 0}</span>
//   </button>

//   {/* 👁️ VIEWS */}
//   <div className="flex items-center gap-1">
//     <FaEye className="text-lg text-gray-600" />
//     <span>{post.views || 0}</span>
//   </div>

//   {/* 🔗 SHARE */}
//   <button
//     onClick={() => handleShare(post)}
//     className="flex items-center gap-1 text-blue-600"
//   >
//     <FaShareAlt className="text-lg" />
    
//   </button>

// </div>


//           {commentsVisible && (
//             <div className="mt-4">
//               <input
//                 type="text"
//                 placeholder="Write a comment..."
//                 value={commentText}
//                 onChange={(e) =>
//                   setCommentTextMap((prev) => ({
//                     ...prev,
//                     [post._id]: e.target.value,
//                   }))
//                 }
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
//               />
//               <button
//                 onClick={() => handleComment(post._id)}
//                 className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
//               >
//                 Post Comment
//               </button>

//               <div className="mt-4 space-y-2">
//                 {Array.isArray(post.comments) &&
//   post.comments.map((cmt, i) => (
//     <div key={i} className="bg-gray-100 p-3 rounded-md">
//       <p className="font-semibold text-gray-800">
//         {cmt?.userId?.username || "User"}
//       </p>
//       <p className="text-gray-700">{cmt?.CommentText}</p>
//     </div>
// ))}

//               </div>
//             </div>
//           )}
//         </div>
//       );
//     },
//     [commentTextMap, commentBoxOpen, expandedPosts, userId]
//   );

  

//   return (
//   <div className="max-w-2xl mx-auto space-y-8 px-2 sm:px-0">
//     {posts.map((post, idx) => renderPost(post, idx))}
//   </div>
// );

//           }










// // 'use client';
// // import React, { useCallback, useEffect, useRef, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import axios from "axios";
// // import Link from "next/link";
// // import jwt from "jsonwebtoken";
// // import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";

// // export default function Village({ initialPosts = [] }) {
// //   const [posts, setPosts] = useState(initialPosts);
// //   const [commentTextMap, setCommentTextMap] = useState({});
// //   const [commentBoxOpen, setCommentBoxOpen] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [expandedPosts, setExpandedPosts] = useState({});
// //   const [userId, setUserId] = useState(null);
// //   const videoRefs = useRef([]);
// //   const router = useRouter();
// //   const API_BASE = "https://backend-k.vercel.app";

// //   // Set userId from token
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");

// //     const startRedirectTimer = () => {
// //       const timer = setTimeout(() => {
// //         window.location.href = "/login";
// //       }, 2 * 60 * 1000);
// //       return timer;
// //     };

// //     let timer;

// //     if (!token) {
// //       timer = startRedirectTimer();
// //       return () => clearTimeout(timer);
// //     }

// //     try {
// //       const decoded = jwt.decode(token);

// //       if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
// //         localStorage.removeItem("token");
// //         timer = startRedirectTimer();
// //         return () => clearTimeout(timer);
// //       }

// //       setUserId(decoded.UserId);
// //     } catch {
// //       localStorage.removeItem("token");
// //       timer = startRedirectTimer();
// //       return () => clearTimeout(timer);
// //     }
// //   }, []);

// //   // IntersectionObserver for autoplay videos
// //   useEffect(() => {
// //     if (!posts.length) return;

// //     const observer = new IntersectionObserver(
// //       (entries) => {
// //         entries.forEach((entry) => {
// //           const video = entry.target;
// //           if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
// //             video.play().catch(() => {});
// //           } else {
// //             video.pause();
// //           }
// //         });
// //       },
// //       { threshold: 0.5 }
// //     );

// //     videoRefs.current.forEach((video) => {
// //       if (video) observer.observe(video);
// //     });

// //     return () => observer.disconnect();
// //   }, [posts]);

// //   // Safe check for likes
// //   const hasLikedPost = (post) =>
// //     (post.likes || []).some((id) => id && userId && id.toString() === userId.toString());

// //   const handleLikePost = async (postId) => {
// //     const token = localStorage.getItem("token");
// //     if (!token) return alert("You must be logged in to like");

// //     try {
// //       const res = await axios.post(
// //         `${API_BASE}/post/like/${postId}`,
// //         {},
// //         { headers: { "x-auth-token": token } }
// //       );
// //       setPosts((prev) =>
// //         prev.map((p) => (p._id === postId ? res.data : p))
// //       );
// //     } catch {
// //       alert("Failed to toggle like");
// //     }
// //   };

// //   const handleComment = async (postId) => {
// //     const token = localStorage.getItem("token");
// //     const comment = commentTextMap[postId]?.trim();
// //     if (!token || !userId) return alert("Not authenticated");
// //     if (!comment) return alert("Comment cannot be empty");

// //     try {
// //       const res = await axios.post(
// //         `${API_BASE}/post/comment/${postId}`,
// //         { CommentText: comment, userId },
// //         { headers: { "x-auth-token": token } }
// //       );
// //       setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
// //       setPosts((prev) =>
// //         prev.map((p) =>
// //           p._id === postId ? { ...p, comments: res.data.comments } : p
// //         )
// //       );
// //     } catch {
// //       alert("Failed to post comment");
// //     }
// //   };

// //   const toggleCommentBox = (postId) => {
// //     setCommentBoxOpen((prev) => ({ ...prev, [postId]: !prev[postId] }));
// //   };

// //   const toggleExpanded = (postId) => {
// //     setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
// //   };

// //   const handleShare = async (post) => {
// //     try {
// //       const shareText = `${post.title}\n${window.location.origin}/post/${post._id}`;
// //       await navigator.clipboard.writeText(shareText);
// //       alert("Copied: Title + URL");
// //     } catch (error) {
// //       console.error("Share failed:", error);
// //     }
// //   };

// //   const renderPost = useCallback(
// //     (post, index) => {
// //       const isExpanded = expandedPosts[post._id];
// //       const isVideo = post.mediaType?.startsWith("video");
// //       const commentText = commentTextMap[post._id] || "";
// //       const commentsVisible = commentBoxOpen[post._id];
// //       const title = post.title || "";
// //       const titleText = isExpanded
// //         ? title
// //         : title.slice(0, 100) + (title.length > 100 ? "..." : "");

// //       return (
// //         <div key={post._id} className="bg-white shadow rounded-lg p-4 mb-6">
// //           {/* Post Header */}
// //           <div className="flex items-center justify-between mb-4">
// //             <div className="flex items-center gap-3">
// //               <Link href={`/profile/${post.userId?.username}`} className="flex items-center gap-3">
// //                 <img
// //                   src={"https://www.fondpeace.com/og-image.jpg"}
// //                   alt="profile"
// //                   className="w-12 h-12 rounded-full object-cover"
// //                 />
// //                 <span className="font-semibold text-gray-900">
// //                   {post.userId?.username || "Unknown"}
// //                 </span>
// //               </Link>
// //             </div>
// //             <button
// //               className="text-gray-600 hover:text-gray-900 text-2xl px-2"
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 alert("Show post options menu here (Report, Save, Share etc.)");
// //               }}
// //             >
// //               ⋮
// //             </button>
// //           </div>

// //           {/* Title */}
// //           <p className="text-gray-800 mb-4">
// //             {titleText}
// //             {title.length > 100 && (
// //               <span
// //                 className="text-blue-600 ml-2 cursor-pointer"
// //                 onClick={() => toggleExpanded(post._id)}
// //               >
// //                 {isExpanded ? " See less" : " See more"}
// //               </span>
// //             )}
// //           </p>

// //           {/* Media */}
// //           {post.media && (
// //             <Link href={isVideo ? `/short/${post._id}` : `/post/${post._id}`} prefetch>
// //               <div className="relative w-full max-w-[600px] aspect-square rounded-lg mb-4 overflow-hidden mx-auto shadow-md cursor-pointer">
// //                 {isVideo ? (
// //                   <video
// //                     ref={(ref) => (videoRefs.current[index] = ref)}
// //                     src={post.media}
// //                     autoPlay
// //                     loop
// //                     playsInline
// //                     muted
// //                     preload="none"
// //                     className="w-full h-full object-cover rounded-lg"
// //                   />
// //                 ) : (
// //                   <img
// //                     src={post.media}
// //                     alt={post.title}
// //                     className="w-full h-full object-cover rounded-lg"
// //                   />
// //                 )}
// //                 {isVideo && (
// //                   <button
// //                     className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-2"
// //                     onClick={(e) => {
// //                       e.preventDefault();
// //                       e.stopPropagation();
// //                       const video = videoRefs.current[index];
// //                       if (video) video.muted = !video.muted;
// //                     }}
// //                   >
// //                     🔊
// //                   </button>
// //                 )}
// //               </div>
// //             </Link>
// //           )}

// //           {/* Actions */}
// //           <div className="flex items-center justify-between text-gray-700 mb-4 text-sm">
// //             <button onClick={() => handleLikePost(post._id)} className="flex items-center gap-1">
// //               {hasLikedPost(post) ? (
// //                 <FaHeart className="text-red-600 text-lg" />
// //               ) : (
// //                 <FaRegHeart className="text-lg" />
// //               )}
// //               <span>{post.likes?.length || 0}</span>
// //             </button>
// //             <button onClick={() => toggleCommentBox(post._id)} className="flex items-center gap-1">
// //               <FaCommentDots className="text-lg" />
// //               <span>{post.comments?.length || 0}</span>
// //             </button>
// //             <div className="flex items-center gap-1">
// //               <FaEye className="text-lg text-gray-600" />
// //               <span>{post.views || 0}</span>
// //             </div>
// //             <button onClick={() => handleShare(post)} className="flex items-center gap-1 text-blue-600">
// //               <FaShareAlt className="text-lg" />
// //             </button>
// //           </div>

// //           {/* Comment Box */}
// //           {commentsVisible && (
// //             <div className="mt-4">
// //               <input
// //                 type="text"
// //                 placeholder="Write a comment..."
// //                 value={commentText}
// //                 onChange={(e) =>
// //                   setCommentTextMap((prev) => ({ ...prev, [post._id]: e.target.value }))
// //                 }
// //                 className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
// //               />
// //               <button
// //                 onClick={() => handleComment(post._id)}
// //                 className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
// //               >
// //                 Post Comment
// //               </button>

// //               <div className="mt-4 space-y-2">
// //                 {post.comments?.map((cmt, i) => (
// //                   <div key={i} className="bg-gray-100 p-3 rounded-md">
// //                     <p className="font-semibold text-gray-800">{cmt.userId?.username || "User"}</p>
// //                     <p className="text-gray-700">{cmt.CommentText}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       );
// //     },
// //     [commentTextMap, commentBoxOpen, expandedPosts, userId]
// //   );

// //   // Set loading to false after initialPosts are loaded
// //   useEffect(() => {
// //     setLoading(false);
// //   }, [initialPosts]);

// //   if (loading) return <div className="text-center p-6">Loading feed...</div>;

// //   return (
// //     <div className="max-w-2xl mx-auto space-y-8 px-2 sm:px-0">
// //       {posts.map((post, idx) => renderPost(post, idx))}
// //     </div>
// //   );
// // }







