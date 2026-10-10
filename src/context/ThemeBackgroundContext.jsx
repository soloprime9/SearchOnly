"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/utils/toast";
import { playPop } from "@/utils/soundEffects";

const THEME_TOKENS = {
  dim: {
    "--bg-canvas": "#090c15",
    "--bg-surface": "#0f1523",
    "--bg-surface-elevated": "#151d30",
    "--bg-surface-hover": "#172036",
    "--bg-subtle": "#1c2640",
    "--border-subtle": "rgba(255, 255, 255, 0.08)",
    "--border-subtle-hover": "rgba(59, 130, 246, 0.4)",
    "--text-primary": "#f8fafc",
    "--text-secondary": "#94a3b8",
    "--text-muted": "#64748b",
    "--background": "#090c15",
    "--foreground": "#f8fafc",
    "--card": "#0f1523",
  },
  black: {
    "--bg-canvas": "#000000",
    "--bg-surface": "#090a0f",
    "--bg-surface-elevated": "#111218",
    "--bg-surface-hover": "#161720",
    "--bg-subtle": "#161822",
    "--border-subtle": "rgba(255, 255, 255, 0.12)",
    "--border-subtle-hover": "rgba(255, 255, 255, 0.35)",
    "--text-primary": "#ffffff",
    "--text-secondary": "#a1a1aa",
    "--text-muted": "#71717a",
    "--background": "#000000",
    "--foreground": "#ffffff",
    "--card": "#090a0f",
  },
};

const applyThemeTokens = (target) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;

  root.setAttribute("data-bg", target);
  if (body) {
    body.setAttribute("data-bg", target);
    body.style.backgroundColor = target === "black" ? "#000000" : "#090c15";
    body.style.color = target === "black" ? "#ffffff" : "#f8fafc";
  }

  const tokens = THEME_TOKENS[target] || THEME_TOKENS.dim;
  Object.entries(tokens).forEach(([prop, val]) => {
    root.style.setProperty(prop, val);
    if (body) {
      body.style.setProperty(prop, val);
    }
  });
};

const ThemeBackgroundContext = createContext({
  bgTheme: "dim", // "dim" (Midnight Navy) | "black" (Lights Out / OLED)
  toggleBgTheme: () => {},
  setBgTheme: () => {},
});

export function ThemeBackgroundProvider({ children }) {
  const [bgTheme, setBgThemeState] = useState("dim");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let initial = "dim";
    try {
      const saved = localStorage.getItem("fondpeace_bg_theme");
      if (saved === "black") initial = "black";
    } catch {}
    setBgThemeState(initial);
    applyThemeTokens(initial);
    setMounted(true);
  }, []);

  const applyTheme = (theme, showToast = true) => {
    const target = theme === "black" ? "black" : "dim";
    setBgThemeState(target);
    try {
      localStorage.setItem("fondpeace_bg_theme", target);
    } catch {}

    applyThemeTokens(target);

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
