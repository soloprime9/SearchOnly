import Upload from "@/components/Upload";
import LeftSidebar from "@/components/LeftSidebar";

export const metadata = {
  title: "Creator Studio - Publish Video, Photo, Poll or Discussion | FondPeace",
  description: "Share your thoughts, high-resolution media, interactive polls, and viral stories on FondPeace.",
};

export default function UploadPage() {
  return (
    <div className="min-h-screen w-full bg-[#08090e] text-white flex justify-center gap-6 px-3 sm:px-6 py-6 sm:py-10">
      {/* Left Navigation */}
      <aside className="hidden lg:block w-[72px] shrink-0">
        <LeftSidebar />
      </aside>

      {/* Center Studio Area */}
      <main className="w-full max-w-2xl shrink-0">
        <Upload />
      </main>
    </div>
  );
}
