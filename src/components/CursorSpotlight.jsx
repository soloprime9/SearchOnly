"use client";

import { useEffect, useState } from "react";

export default function CursorSpotlight() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on desktop devices with a precision pointer
    const isDesktop = window.matchMedia("(pointer: fine)").matches;
    if (!isDesktop) return;

    setMounted(true);
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300"
      style={{
        background: `radial-gradient(550px circle at ${position.x}px ${position.y}px, rgba(26, 115, 232, 0.045), transparent 80%)`,
      }}
    />
  );
}
