import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel | FondPeace",
  robots: {
    index: false,
    follow: false,
  },
};

async function getInitialData() {
  try {
    const res = await fetch(
      "https://backendk-z915.onrender.com/analytics/mango/getall",
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
