import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const res = await fetch(
      "https://backend-k.vercel.app/analytics/mango/getall",
      { cache: "no-store" }
    );
    return res.json();
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const initialPosts = await getInitialData();
  return <AdminClient initialPosts={initialPosts} />;
}
