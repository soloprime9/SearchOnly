'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import jwt from "jsonwebtoken";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔴 NO TOKEN → go login
    if (!token) {
      if (pathname !== "/login" && pathname !== "/signup") {
        setTimeout(() => router.push("/login"), 5000);
      }
      setLoading(false);
      return;
    }

    try {
      const decoded = jwt.decode(token);

      // 🔴 Invalid token
      if (!decoded) {
        localStorage.removeItem("token");
        return router.push("/login");
      }

      // 🔴 Expired token
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return router.push("/login");
      }

      // 🟢 VALID TOKEN

      // 👉 If user is on login/signup → redirect to home
      if (pathname === "/login" || pathname === "/signup") {
        return router.push("/");
      }

    } catch (err) {
      console.error("Auth error:", err);
      localStorage.removeItem("token");
      return router.push("/login");
    }

    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return children;
}
