"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/utils/toast";
import { playPop } from "@/utils/soundEffects";

const ThemeBackgroundContext = createContext({
  bgTheme: "dim", // "dim" (Midnight Navy) | "black" (Lights Out / OLED)
  toggleBgTheme: () => {},
  setBgTheme: () => {},
});

export function ThemeBackgroundProvider({ children }) {
  const [bgTheme, setBgThemeState] = useState("dim");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fondpeace_bg_theme");
      const initial = saved === "black" ? "black" : "dim";
      setBgThemeState(initial);
      document.documentElement.setAttribute("data-bg", initial);
      document.body.setAttribute("data-bg", initial);
    } catch {
      document.documentElement.setAttribute("data-bg", "dim");
      document.body.setAttribute("data-bg", "dim");
    }
    setMounted(true);
  }, []);

  const applyTheme = (theme, showToast = true) => {
    const target = theme === "black" ? "black" : "dim";
    setBgThemeState(target);
    try {
      localStorage.setItem("fondpeace_bg_theme", target);
    } catch {}
    document.documentElement.setAttribute("data-bg", target);
    document.body.setAttribute("data-bg", target);

    if (showToast && mounted) {
      playPop();
      if (target === "black") {
        toast.success("Switched to Lights Out (OLED Pitch Black)");
      } else {
        toast.success("Switched to Midnight Dim (Deep Navy Slate)");
      }
    }
  };

  const toggleBgTheme = () => {
    applyTheme(bgTheme === "dim" ? "black" : "dim", true);
  };

  const setBgTheme = (theme) => {
    applyTheme(theme, true);
  };

  return (
    <ThemeBackgroundContext.Provider value={{ bgTheme, toggleBgTheme, setBgTheme }}>
      {children}
    </ThemeBackgroundContext.Provider>
  );
}

export function useThemeBackground() {
  return useContext(ThemeBackgroundContext);
}
