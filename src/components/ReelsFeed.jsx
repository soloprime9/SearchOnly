"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback } from "react";
import StatusBar from "@/components/StatusBar";
import toast from "react-hot-toast";

const API_URL = "https://backend-k.vercel.app/post/shorts";
const SINGLE_API = "https://backend-k.vercel.app/post/single";

export default function ReelsFeed({ videoId }) {
  const [videos, setVideos] = useState([]);
  const [single, setSingle] = useState(null);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const hasMore = useRef(true);
  const observer = useRef();
  const videoRefs = useRef([]);

  // Fetch single video
  useEffect(() => {
    const loadSingle = async () => {
      const res = await fetch(`${SINGLE_API}/${videoId}`);
      const data = await res.json();
      setSingle(data);
    };
    loadSingle();
  }, [videoId]);

  // Fetch feed videos
  const fetchVideos = useCallback(async () => {
    if (!hasMore.current) return;

    const res = await fetch(`${API_URL}?page=${page}&limit=5`);
    const data = await res.json();

    setVideos((prev) => {
      const existing = new Set(prev.map((v) => v._id));
      const newOnes = data.videos.filter((v) => !existing.has(v._id));
      return [...prev, ...newOnes];
    });

    if (page >= data.totalPages) hasMore.current = false;
  }, [page]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // infinite scroll observer
  const lastRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore.current) {
          setPage((p) => p + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    []
  );

  // auto play / auto pause + url update
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
            const id = video.dataset.id;
            if (id) {
              window.history.replaceState(null, "", `/short/${id}`);
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((v) => v && io.observe(v));

    return () => videoRefs.current.forEach((v) => io.unobserve(v));
  }, [videos, single]);

  const handleShare = (item) => {
    const text = `${item.title}\n${window.location.origin}/short/${item._id}`;
    navigator.clipboard.writeText(text);
    toast.success("Link copied!");
  };

  return (
    <div className="overflow-y-auto snap-y snap-mandatory bg-white">
      <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory">

        {/* SINGLE VIDEO FIRST */}
        {single && (
          <VideoBlock
            data={single}
            index={0}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            handleShare={handleShare}
            refFn={(el) => (videoRefs.current[0] = el)}
          />
        )}

        {/* FEED VIDEOS */}
        {videos.map((v, idx) => (
          <VideoBlock
            key={v._id}
            data={v}
            index={idx + 1}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            handleShare={handleShare}
            refFn={idx === videos.length - 1 ? lastRef : (el) => (videoRefs.current[idx + 1] = el)}
          />
        ))}
      </div>

      <StatusBar />
    </div>
  );
}

// VIDEO BLOCK COMPONENT
function VideoBlock({ data, index, expandedId, setExpandedId, handleShare, refFn }) {
  return (
    <div className="snap-start w-full h-screen flex justify-center items-center">
      <div className="relative w-full h-full bg-black">
        <video
          ref={refFn}
          src={data.media}
          autoPlay
          playsInline
          loop
          controls={false}
          className="object-contain w-full h-full"
          data-id={data._id}
        />

        {/* Left text */}
        <div className="absolute left-4 bottom-40 text-white">
          <p className="font-semibold text-lg mb-1">@{data.userId?.username}</p>
          <p
            className={`text-sm cursor-pointer ${expandedId === data._id ? "" : "line-clamp-1"}`}
            onClick={() => setExpandedId(expandedId === data._id ? null : data._id)}
          >
            {data.title}
          </p>
        </div>

        {/* Right actions */}
        <div className="absolute right-4 bottom-40 flex flex-col items-center gap-5 text-white">
          <div onClick={() => handleShare(data)} className="cursor-pointer flex flex-col items-center">
            <svg width="28" height="28" fill="white">
              <path d="M4 12v1a9 9 0 009 9h3M20 12v-1a9 9 0 00-9-9H8" />
            </svg>
            <span className="text-xs">Share</span>
          </div>

          <div className="flex flex-col items-center">
            <svg width="28" height="28" fill="red">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5..." />
            </svg>
            <span className="text-xs">{data.likes?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
