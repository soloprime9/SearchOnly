import React from "react";
import EditProfile from "@/components/EditProfile";
import LeftSidebar from "@/components/LeftSidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Edit Profile & Creator Settings | FondPeace",
  description: "Customize your creator profile, update avatar, banner, bio, categories, and social links on FondPeace.",
  robots: "noindex, nofollow", // Keep private user settings private from Google search index
};

export default async function EditProfilePage({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username || "";

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <div
        className="
          grid 
          grid-cols-1 
          lg:grid-cols-[76px_minmax(0,1fr)] 
          xl:grid-cols-[220px_minmax(0,1fr)] 
          max-w-[1440px] 
          mx-auto
          gap-4 lg:gap-6
          px-2 sm:px-4
          py-3
        "
      >
        {/* Left Navigation */}
        <aside className="shrink-0">
          <LeftSidebar sticky={true} />
        </aside>

        {/* Main Center Form */}
        <main className="w-full min-w-0 max-w-2xl mx-auto py-4 sm:py-6 pb-20 lg:pb-8">
          <EditProfile initialUsername={username} />
        </main>
      </div>
    </div>
  );
}
