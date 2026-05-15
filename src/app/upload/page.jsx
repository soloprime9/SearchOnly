// src/app/page.jsx
import Upload from '@/components/Upload';
import LeftSidebar from "@//components/LeftSidebar"
import FindFriends from "@/components/FindFriends";


export default function HomePage() {
  return (
    <div>
      <LeftSidebar/>
      <Upload />
      <FindFriends />
    </div>
  );
}
