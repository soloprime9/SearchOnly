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

    if (!res.ok) return [];

    return res.json();
  } catch (err) {
    return [];
  }
}

export default async function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  // 🔐 Protect Admin Route
  if (!token) {
    redirect("/");
  }

  const initialPosts = await getInitialData();

  return <AdminClient initialPosts={initialPosts} />;
}
