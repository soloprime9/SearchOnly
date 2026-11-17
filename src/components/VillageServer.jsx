import VillageClient from "./VillageClient";
import { getApiBase } from "@/utils/apiConfig";

const API_BASE = getApiBase();

export default async function VillageServer() {
  let posts = [];

  try {
    const res = await fetch(`${API_BASE}/post/mango/getall`, {
      cache: "no-store",
    });
    posts = await res.json();
  } catch (err) {
    console.error("Server feed fetch failed");
  }

  return <VillageClient initialPosts={posts} />;
}
