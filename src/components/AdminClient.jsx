"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import jwt from "jsonwebtoken";
import { getApiBase } from "@/utils/apiConfig";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Activity,
  Flame,
  Clock,
  Share2,
  BarChart3,
  Globe,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  Check,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

const API_ROOT = getApiBase();
const BACKEND = `${API_ROOT}/analytics`;
const SOCKET_BACKEND = API_ROOT;

export default function AdminClient({ initialPosts }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts || []);
  const [activeTab, setActiveTab] = useState("latest");
  const [liveWindow, setLiveWindow] = useState("30m"); // For the 1, 5, 30m sub-tabs
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [activeUsers30m, setActiveUsers30m] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityStats, setActivityStats] = useState(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [filterAction, setFilterAction] = useState("all");
  const [filterIp, setFilterIp] = useState("");
  const [copiedIp, setCopiedIp] = useState(null);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    try {
      const decoded = jwt.decode(token);
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return router.push("/login");
      }
      setAuthorized(true);
    } catch (err) {
      router.push("/login");
    }
  }, [router]);

  /* ================= FETCH LOGIC ================= */
  const refreshData = useCallback(async (tab = activeTab, window = liveWindow) => {
    if (loading) return;
    setLoading(true);
    try {
      let url = `${BACKEND}/mango/getall`;
      if (tab === "trending") url = `${BACKEND}/admin/all-traffic`;
      if (tab === "live") url = `${BACKEND}/admin/live-traffic?time=${window}`;

      const res = await fetch(url);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : (data.traffic || []));

      // Global Stat for Header
      const statRes = await fetch(`${BACKEND}/admin/live-traffic?time=30m`);
      const statData = await statRes.json();
      const total = (statData.traffic || []).reduce((acc, curr) => acc + (curr.views || 0), 0);
      setActiveUsers30m(total);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, liveWindow]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!authorized) return;
    const socket = io(SOCKET_BACKEND, { transports: ["websocket"], secure: true });
    socket.on("newViewGlobal", () => refreshData());
    socket.on("newActivityGlobal", (newLog) => {
      setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    });
    return () => socket.disconnect();
  }, [authorized, refreshData]);

  useEffect(() => {
    if (authorized) refreshData();
  }, [activeTab, liveWindow, authorized]);

  /* ================= HELPERS ================= */
  const handleShare = async (post) => {
    const text = `${window.location.origin}/post/${post._id}`;
    await navigator.clipboard.writeText(text);
    alert("URL Copied!");
  };

  const openDetails = async (post) => {
    const id = post._id?._id || post._id || post.postId;
    setSelectedPost(post._id?.title ? post._id : post);
    const res = await fetch(`${BACKEND}/admin/post/${id}/details`);
    const data = await res.json();
    setPostDetails(data);
  };

  const fetchActivityLogs = useCallback(async (action = filterAction, ip = filterIp) => {
    setTelemetryLoading(true);
    try {
      let url = `${BACKEND}/activity-logs?limit=100`;
      if (action && action !== "all") url += `&action=${action}`;
      if (ip) url += `&ip=${encodeURIComponent(ip)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data.records)) {
        setActivityLogs(data.records);
        setActivityStats(data.stats || null);
      }
    } catch (err) {
      console.error("Telemetry fetch error:", err);
    } finally {
      setTelemetryLoading(false);
    }
  }, [filterAction, filterIp]);

  useEffect(() => {
    if (authorized && activeTab === "shorts-telemetry") {
      fetchActivityLogs(filterAction, filterIp);
    }
  }, [activeTab, authorized, filterAction, filterIp, fetchActivityLogs]);

  const telemetryStats = useMemo(() => {
    if (!activityLogs.length) {
      return {
        total: activityStats?.total24h || 0,
        uniqueIps: activityStats?.uniqueIps24h || 0,
        topPaths: activityStats?.topPaths || [],
        mobileCount: activityStats?.devices?.mobile || 0,
        desktopCount: activityStats?.devices?.desktop || 0,
      };
    }
    const total = activityStats?.total24h || activityLogs.length;
    const uniqueIps =
      activityStats?.uniqueIps24h ||
      new Set(activityLogs.map((t) => t.ip || "0.0.0.0")).size;
    const mobileCount =
      activityStats?.devices?.mobile ||
      activityLogs.filter((t) => t.deviceType === "mobile").length;
    const desktopCount =
      activityStats?.devices?.desktop ||
      activityLogs.filter((t) => t.deviceType === "desktop").length;

    return {
      total,
      uniqueIps,
      topPaths: activityStats?.topPaths || [],
      mobileCount,
      desktopCount,
    };
  }, [activityLogs, activityStats]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(id);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // Fake chart data generation based on view count for visual feedback
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      name: `${i * 2}m`,
      uv: Math.floor(Math.random() * activeUsers30m) + 10,
    }));
  }, [activeUsers30m]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <nav className="bg-white border-b sticky top-0 z-50 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg"><Activity size={20} className="text-white" /></div>
          <h1 className="font-black text-xl tracking-tight">METRICS<span className="text-blue-600">PRO</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 px-4 py-2 rounded-xl flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase">30m Active</span>
            <span className="text-lg font-black leading-none text-blue-700">{activeUsers30m}</span>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border">
            <button onClick={() => setActiveTab("latest")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "latest" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
              <Clock size={16} className="inline mr-2" /> Latest Posts
            </button>
            <button onClick={() => setActiveTab("trending")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "trending" ? "bg-red-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
              <Flame size={16} className="inline mr-2" /> Trending (7D)
            </button>
            <button onClick={() => setActiveTab("live")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "live" ? "bg-green-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
              <Activity size={16} className="inline mr-2" /> Live Traffic
            </button>
            <button onClick={() => setActiveTab("shorts-telemetry")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "shorts-telemetry" ? "bg-purple-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
              <Globe size={16} className="inline mr-2" /> Visitor IP & Platform Telemetry
            </button>
          </div>

          {activeTab === "live" && (
            <div className="flex bg-slate-200 p-1 rounded-lg gap-1">
              {["1m", "5m", "30m"].map(t => (
                <button key={t} onClick={() => setLiveWindow(t)} className={`px-3 py-1 text-xs font-bold rounded ${liveWindow === t ? "bg-white shadow-sm" : "text-slate-600"}`}>{t}</button>
              ))}
            </div>
          )}
        </div>

        {/* LATEST POSTS TAB (GRID VIEW WITH THUMBNAILS) */}
        {activeTab === "latest" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
                <div className="relative h-48">
                  <img src={post.thumbnail} className="w-full h-full object-cover" alt="" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black">{post.mediaType || 'VIDEO'}</div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 line-clamp-2 h-10 mb-4">{post.title}</h3>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-xs font-bold text-slate-400">Total Views: <span className="text-slate-900">{post.views}</span></div>
                    <div className="flex gap-2">
                      <button onClick={() => handleShare(post)} className="p-2 bg-slate-50 rounded-full text-slate-600 hover:bg-green-50 hover:text-green-600"><Share2 size={16} /></button>
                      <button onClick={() => openDetails(post)} className="p-2 bg-slate-50 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-600"><BarChart3 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIVE TRAFFIC TAB (LIST VIEW WITH CHART & HOVER) */}
        {(activeTab === "trending" || activeTab === "live") && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {posts.map((post, i) => {
                const data = post._id?.title ? post._id : post;
                return (
                  <div key={i} className="group relative bg-white p-4 rounded-2xl border flex items-center justify-between hover:border-blue-500 transition-all cursor-default shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs">{i+1}</div>
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{data.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.views || data.views} Live Impressions</p>
                      </div>
                    </div>
                    
                    <button onClick={() => openDetails(data)} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-blue-600 transition-all">ANALYTICS</button>

                    {/* HOVER PREVIEW */}
                    <div className="absolute left-10 bottom-full mb-2 scale-0 group-hover:scale-100 transition-all duration-200 z-50 origin-bottom">
                      <div className="bg-white p-2 rounded-2xl shadow-2xl border w-64">
                        <img src={data.thumbnail} className="w-full h-32 object-cover rounded-xl mb-2" alt="" />
                        <p className="text-[10px] font-bold p-1 leading-tight">{data.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LIVE CHART & STATS SIDEBAR */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 className="font-black text-xs uppercase text-slate-400 mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-green-500" /> Traffic Velocity (30m)
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="uv" stroke="#2563eb" strokeWidth={3} dot={false} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM-WIDE VISITOR & IP TELEMETRY TAB */}
        {activeTab === "shorts-telemetry" && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Activity size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Events (24h)</p>
                  <p className="text-2xl font-black text-slate-900">{telemetryStats.total}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unique Visitor IPs (24h)</p>
                  <p className="text-2xl font-black text-slate-900">{telemetryStats.uniqueIps}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Smartphone size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Visitors</p>
                  <p className="text-2xl font-black text-slate-900">{telemetryStats.mobileCount}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Monitor size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desktop Visitors</p>
                  <p className="text-2xl font-black text-slate-900">{telemetryStats.desktopCount}</p>
                </div>
              </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="flex flex-wrap items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase mr-1">Filter Action:</span>
                <button
                  onClick={() => { setFilterAction("all"); fetchActivityLogs("all", filterIp); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${filterAction === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  All Actions
                </button>
                <button
                  onClick={() => { setFilterAction("page_view"); fetchActivityLogs("page_view", filterIp); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${filterAction === "page_view" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Page Views
                </button>
                <button
                  onClick={() => { setFilterAction("shorts_view"); fetchActivityLogs("shorts_view", filterIp); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${filterAction === "shorts_view" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Shorts Views
                </button>

                {filterIp && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                    <span>IP Filter: {filterIp}</span>
                    <button
                      onClick={() => { setFilterIp(""); fetchActivityLogs(filterAction, ""); }}
                      className="ml-1 text-purple-400 hover:text-purple-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchActivityLogs(filterAction, filterIp)}
                  disabled={telemetryLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={telemetryLoading ? "animate-spin" : ""} />
                  <span>{telemetryLoading ? "Refreshing..." : "Refresh Live Stream"}</span>
                </button>
              </div>
            </div>

            {/* Platform Activity Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-5">Visitor IP</th>
                      <th className="py-3.5 px-5">Location</th>
                      <th className="py-3.5 px-5">Page & Action</th>
                      <th className="py-3.5 px-5">Device & Screen</th>
                      <th className="py-3.5 px-5">Referrer</th>
                      <th className="py-3.5 px-5">Engagement</th>
                      <th className="py-3.5 px-5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activityLogs.map((item, idx) => {
                      const postTitle = item.postId?.title;
                      const postThumb = item.postId?.thumbnail;
                      const deviceType = item.deviceType || "desktop";
                      const pagePath = item.path || "/";
                      const actionType = item.action || "page_view";

                      return (
                        <tr key={item._id || idx} className="hover:bg-slate-50/70 transition-colors">
                          {/* IP Address */}
                          <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                            <div className="flex items-center gap-2">
                              <span>{item.ip || "0.0.0.0"}</span>
                              <button
                                onClick={() => copyToClipboard(item.ip, item._id || idx)}
                                className="text-slate-400 hover:text-purple-600 transition cursor-pointer"
                                title="Copy IP"
                              >
                                {copiedIp === (item._id || idx) ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                              <button
                                onClick={() => { setFilterIp(item.ip); fetchActivityLogs(filterAction, item.ip); }}
                                className="text-[10px] text-purple-600 hover:underline font-sans cursor-pointer"
                                title="Filter all sessions by this IP"
                              >
                                Journey
                              </button>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <MapPin size={13} className="text-purple-500 shrink-0" />
                              <span>{item.city && item.city !== "Unknown" ? item.city : "City"}</span>
                              <span className="text-slate-400">({item.country && item.country !== "Unknown" ? item.country : "Global"})</span>
                            </div>
                          </td>

                          {/* Page Path & Action */}
                          <td className="py-3.5 px-5">
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-slate-800 break-all">{pagePath}</span>
                              <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                                {actionType}
                              </span>
                            </div>
                          </td>

                          {/* Device & Screen */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className={`p-1.5 rounded-lg text-xs ${deviceType === "mobile" ? "bg-blue-50 text-blue-600" : deviceType === "tablet" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"}`}>
                                {deviceType === "mobile" ? <Smartphone size={13} /> : deviceType === "tablet" ? <Tablet size={13} /> : <Monitor size={13} />}
                              </span>
                              <span className="capitalize font-bold text-slate-700">{deviceType}</span>
                              {item.screenResolution && (
                                <span className="text-[10px] text-slate-400 font-mono">({item.screenResolution})</span>
                              )}
                            </div>
                          </td>

                          {/* Referrer */}
                          <td className="py-3.5 px-5 text-slate-500 max-w-[160px] truncate" title={item.referrer || "Direct"}>
                            {item.referrer ? item.referrer.replace(/^https?:\/\//, '') : "Direct Visit"}
                          </td>

                          {/* Engagement / Duration */}
                          <td className="py-3.5 px-5">
                            {item.watchDuration ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono font-bold text-slate-800">
                                {item.watchDuration}s {item.completed ? "✅" : "⏳"}
                              </span>
                            ) : postTitle ? (
                              <span className="truncate max-w-[140px] text-slate-700 inline-block font-semibold" title={postTitle}>
                                {postTitle}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-5 text-slate-400 text-[11px] whitespace-nowrap">
                            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Recently"}
                          </td>
                        </tr>
                      );
                    })}

                    {!activityLogs.length && !telemetryLoading && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          No visitor activity logs found yet. Navigate anywhere on the site to generate logs!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL - ANALYTICS DETAILS */}
      {selectedPost && postDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <img src={selectedPost.thumbnail} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{selectedPost.title}</h2>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Real-time Performance Metrics</p>
                </div>
              </div>
              <button onClick={() => {setSelectedPost(null); setPostDetails(null)}} className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-xl hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {Object.entries(postDetails.traffic).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{key}</p>
                    <p className="text-xl font-black text-slate-900">{val}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-[32px] border">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-500" /> Geography Distribution</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {postDetails.locations.map((loc, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={14} /></div>
                          <span className="text-xs font-bold">{loc._id.country || 'Global'} <span className="text-slate-400">({loc._id.city || 'Any'})</span></span>
                        </div>
                        <span className="text-sm font-black text-blue-600">{loc.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-600 p-8 rounded-[32px] text-white flex flex-col justify-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 opacity-10"><Activity size={200} /></div>
                   <h4 className="text-3xl font-black mb-2">Excellent!</h4>
                   <p className="text-blue-100 font-medium">This content is currently trending in {postDetails.locations[0]?._id.country || 'multiple regions'}.</p>
                   <div className="mt-6 flex gap-2">
                      <div className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold">Live: {postDetails.traffic['1m']} / min</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {io} from "socket.io-client";
// import jwt from "jsonwebtoken";

// const BACKEND = "https://backendk-z915.onrender.com/analytics";
// const Socket_Backend = "https://backendk-z915.onrender.com";

// export default function AdminClient({ initialPosts }) {
//   const router = useRouter();
//   const [posts, setPosts] = useState(initialPosts || []);
//   const [activeTab, setActiveTab] = useState("latest");
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [postDetails, setPostDetails] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [authorized, setAuthorized] = useState(false);

// /* ================= TOCKEN CHECKUP ================= */

//   useEffect(() => {
//   console.log("🔍 Checking token...");

//   const token = localStorage.getItem("token");
//   console.log("Token from localStorage:", token);

//   if (!token) {
//     console.log("❌ No token found. Redirecting...");
//     router.push("/login");
//     return;
//   }

//   try {
//     const decoded = jwt.decode(token);
//     console.log("Decoded token:", decoded);

//     if (!decoded) {
//       console.log("❌ Token decode failed");
//       localStorage.removeItem("token");
//       router.push("/login");
//       return;
//     }

//     if (!decoded.exp) {
//       console.log("❌ No expiration in token");
//       localStorage.removeItem("token");
//       router.push("/login");
//       return;
//     }

//     console.log("Token expiry:", decoded.exp * 1000);
//     console.log("Current time:", Date.now());

//     if (decoded.exp * 1000 < Date.now()) {
//       console.log("❌ Token expired");
//       localStorage.removeItem("token");
//       router.push("/login");
//       return;
//     }

//     console.log("✅ Token valid");
//     setAuthorized(true);

//   } catch (err) {
//     console.log("❌ Token invalid:", err);
//     localStorage.removeItem("token");
//     router.push("/login");
//   }
// }, []);
  
//   /* ================= SOCKET ================= */

//  useEffect(() => {
//   const socket = io(Socket_Backend, {
//     transports: ["websocket"], // ✅ Force websocket only
//     withCredentials: true,
//     secure: true,
//   });

//   socket.on("connect", () => {
//     console.log("✅ Socket connected:", socket.id);
//   });

//   socket.on("connect_error", (err) => {
//     console.error("❌ Socket connection error:", err.message);
//   });

//   socket.on("newViewGlobal", () => {
//     refreshData();
//   });

//   return () => {
//     socket.disconnect();
//   };
// }, []);

//   /* ================= TAB CHANGE ================= */

//   useEffect(() => {
//     if (activeTab !== "latest") {
//       refreshData();
//     }
//   }, [activeTab]);

//   /* ================= FETCH POSTS ================= */

//   const refreshData = async () => {
//     try {
//       setLoading(true);

//       const url =
//         activeTab === "trending"
//           ? `${BACKEND}/admin/all-traffic`
//           : `${BACKEND}/mango/getall`;

//       const res = await fetch(url);
//       const data = await res.json();

//       setPosts(data);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setLoading(false);
//     }
//   };

//   /* ================= FETCH DETAILS ================= */

//   const fetchPostDetails = async (id) => {
//     try {
//       const res = await fetch(`${BACKEND}/admin/post/${id}/details`);
//       const data = await res.json();
//       setPostDetails(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /* ================= OPEN MODAL ================= */

//   const openDetails = (post) => {
//     const realPost = post._id?.title ? post._id : post;
//     setSelectedPost(realPost);
//     fetchPostDetails(realPost._id);
//   };

//   /* ================= SHARE ================= */

//   const handleShare = async (post) => {
//     const text = `${post.title}\n${window.location.origin}/post/${post._id}`;
//     await navigator.clipboard.writeText(text);
//     alert("Copied!");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">

//       {/* HEADER */}
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">
//         📊 Admin Analytics Dashboard
//       </h1>

//       {/* TABS */}
//       <div className="flex gap-4 mb-6 flex-wrap">
//         <button
//           onClick={() => setActiveTab("latest")}
//           className={`px-5 py-2 rounded-lg transition ${
//             activeTab === "latest"
//               ? "bg-blue-600 text-white shadow-lg"
//               : "bg-white border"
//           }`}
//         >
//           Latest Posts
//         </button>

//         <button
//           onClick={() => setActiveTab("trending")}
//           className={`px-5 py-2 rounded-lg transition ${
//             activeTab === "trending"
//               ? "bg-red-600 text-white shadow-lg"
//               : "bg-white border"
//           }`}
//         >
//           🔥 Trending (7D)
//         </button>
//       </div>

//       {loading && <p className="text-gray-500">Loading...</p>}

//       {/* POSTS GRID */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {!loading &&
//           posts.map((post, i) => {
//             const data = post._id?.title ? post._id : post;

//             return (
//               <div
//                 key={i}
//                 className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
//               >
//                 <img
//                   src={data.thumbnail}
//                   className="w-full h-44 object-cover"
//                   alt=""
//                 />

//                 <div className="p-4">
//                   <h2 className="font-semibold text-lg line-clamp-1">
//                     {data.title}
//                   </h2>

//                   <p className="text-gray-500 text-sm mt-1">
//                     Total Views: {data.views}
//                   </p>

//                   {activeTab === "trending" && (
//                     <p className="text-red-600 text-sm font-medium mt-1">
//                       🔥 {post.views7d} views (7 days)
//                     </p>
//                   )}

//                   <div className="flex justify-between mt-4">
//                     <button
//                       onClick={() => openDetails(post)}
//                       className="text-blue-600 text-sm"
//                     >
//                       Analytics
//                     </button>

//                     <button
//                       onClick={() => handleShare(data)}
//                       className="text-green-600 text-sm"
//                     >
//                       Share
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//       </div>

//       {/* MODAL */}
//       {selectedPost && postDetails && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white w-full max-w-3xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">

//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">
//                 {selectedPost.title} Analytics
//               </h2>

//               <button
//                 onClick={() => {
//                   setSelectedPost(null);
//                   setPostDetails(null);
//                 }}
//                 className="text-red-500"
//               >
//                 Close
//               </button>
//             </div>

//             {/* TRAFFIC */}
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//               {Object.entries(postDetails.traffic).map(([key, value]) => (
//                 <div
//                   key={key}
//                   className="bg-gray-100 rounded-lg p-3 text-center"
//                 >
//                   <p className="text-sm text-gray-500">{key}</p>
//                   <p className="font-bold text-lg">{value}</p>
//                 </div>
//               ))}
//             </div>

//             {/* COUNTRIES */}
//             <div>
//               <h3 className="font-semibold mb-2">🌍 Top Countries</h3>

//               <div className="space-y-2 max-h-40 overflow-y-auto">
//                 {postDetails.locations.map((loc, i) => (
//                   <div
//                     key={i}
//                     className="flex justify-between bg-gray-50 p-2 rounded"
//                   >
//                     <span>{loc._id}</span>
//                     <span className="font-medium">{loc.count}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
