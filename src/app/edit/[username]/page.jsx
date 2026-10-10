import React from "react";
import EditProfile from "@/components/EditProfile";
import LeftSidebar from "@/components/LeftSidebar";

export const metadata = {
  title: "Edit Profile & Creator Settings | FondPeace",
  description: "Customize your creator profile, update avatar, banner, bio, categories, and social links on FondPeace.",
  robots: "noindex, nofollow", // Keep private user settings private from Google search index
};

export default async function EditProfilePage({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username || "";

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200 flex justify-center gap-6 px-2 sm:px-6 py-4 sm:py-8">
      {/* Left Navigation on Desktop */}
      <aside className="hidden lg:block w-[72px] shrink-0">
        <LeftSidebar />
      </aside>

      {/* Main Center Form */}
      <main className="w-full max-w-2xl shrink-0">
        <EditProfile initialUsername={username} />
      </main>
    </div>
  );
}
