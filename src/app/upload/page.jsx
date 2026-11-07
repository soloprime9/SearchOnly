import Upload from "@/components/Upload";
import LeftSidebar from "@/components/LeftSidebar";

export const metadata = {
  title: "Creator Studio - Publish Video, Photo, Poll or Discussion | FondPeace",
  description: "Share your thoughts, high-resolution media, interactive polls, and viral stories on FondPeace.",
};

export default function UploadPage() {
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

        {/* Center Studio Area */}
        <main className="w-full min-w-0 max-w-2xl mx-auto py-4 sm:py-6 pb-20 lg:pb-8">
          <Upload />
        </main>
      </div>
    </div>
  );
}
