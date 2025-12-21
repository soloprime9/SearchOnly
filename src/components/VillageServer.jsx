import axios from "axios";
import VillageClient from "./VillageClient";

export const dynamic = "force-dynamic"; // ✅ CRITICAL
export const revalidate = 0;             // ✅ CRITICAL

const API_BASE = "https://backend-k.vercel.app";

export default async function VillageServer() {
  let posts = [];

  try {
    const res = await axios.get(`${API_BASE}/post/mango/getall`, {
      headers: { "Cache-Control": "no-store" },
    });
    posts = res.data || [];
  } catch (err) {
    console.error("Server feed fetch failed");
  }

  return <VillageClient initialPosts={posts} />;
}
