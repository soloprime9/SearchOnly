import { redirect } from "next/navigation";
import { getApiBase } from "@/utils/apiConfig";

export const dynamic = "force-dynamic";

export default async function ShortsRedirectPage() {
  const API_BASE = getApiBase();
  let targetId = "698c432d0a8059958d20a4f4"; // Fallback popular short

  try {
    const res = await fetch(`${API_BASE}/post/shorts?page=1&limit=1`, {
      next: { revalidate: 30 },
    });
    const data = await res.json();
    if (Array.isArray(data?.videos) && data.videos[0]?._id) {
      targetId = data.videos[0]._id;
    }
  } catch (_) {}

  redirect(`/short/${targetId}`);
}
