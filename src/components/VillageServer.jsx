import axios from "axios";
import VillageClient from "./VillageClient";

const API_BASE = "https://backend-k.vercel.app";

export default async function VillageServer() {
  let posts = [];

  try {
    const res = await axios.get(`${API_BASE}/post/mango/getall`, {
      timeout: 8000,
    });
    posts = res.data || [];
  } catch (err) {
    console.error("Server feed fetch failed");
  }

  return <VillageClient initialPosts={posts} />;
}
