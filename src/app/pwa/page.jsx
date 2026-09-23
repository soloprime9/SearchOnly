import LeftSidebar from "@/components/LeftSidebar";
import Dashboard from "@/components/Dashboard";

export const metadata = {
  title: "FondPeace PWA",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fondpeace.com",
  },
};

export default function PwaHomePage() {
  return (
    <div>
      <LeftSidebar />
      <Dashboard />
    </div>
  );
}
