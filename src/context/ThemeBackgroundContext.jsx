"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/utils/toast";
import { playPop } from "@/utils/soundEffects";

const THEME_TOKENS = {
  white: {
    "--bg-canvas": "#ffffff",
    "--bg-surface": "#ffffff",
    "--bg-surface-elevated": "#f8fafc",
    "--bg-surface-hover": "#f1f5f9",
    "--bg-subtle": "#f4f4f5",
    "--border-subtle": "rgba(0, 0, 0, 0.08)",
    "--border-subtle-hover": "rgba(59, 130, 246, 0.4)",
    "--text-primary": "#09090b",
    "--text-secondary": "#64748b",
    "--text-muted": "#94a3b8",
    "--background": "#ffffff",
    "--foreground": "#09090b",
    "--card": "#ffffff",
  },
  black: {
    "--bg-canvas": "#000000",
    "--bg-surface": "#0a0b10",
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
    "--card": "#0a0b10",
  },
};

const applyThemeTokens = (target) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;

  root.setAttribute("data-bg", target);
  if (body) {
    body.setAttribute("data-bg", target);
    body.style.backgroundColor = target === "white" ? "#ffffff" : "#000000";
    body.style.color = target === "white" ? "#09090b" : "#ffffff";
  }

  // Synchronize dark / light class for Tailwind
  if (target === "white") {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  }

  const tokens = THEME_TOKENS[target] || THEME_TOKENS.black;
  Object.entries(tokens).forEach(([prop, val]) => {
    root.style.setProperty(prop, val);
    if (body) {
      body.style.setProperty(prop, val);
    }
  });
};

const ThemeBackgroundContext = createContext({
  bgTheme: "black", // "white" | "black"
  toggleBgTheme: () => {},
  setBgTheme: () => {},
});

export function ThemeBackgroundProvider({ children }) {
  const [bgTheme, setBgThemeState] = useState("black");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let initial = "black";
    try {
      const saved = localStorage.getItem("fondpeace_bg_theme");
      if (saved === "white") initial = "white";
      else initial = "black";
    } catch {}
    setBgThemeState(initial);
    applyThemeTokens(initial);
    setMounted(true);
  }, []);

  const applyTheme = (theme, showToast = true) => {
    const target = theme === "white" ? "white" : "black";
    setBgThemeState(target);
    try {
      localStorage.setItem("fondpeace_bg_theme", target);
    } catch {}

    applyThemeTokens(target);

    if (showToast && mounted) {
      playPop();
      if (target === "white") {
        toast.success("Switched to White Mode (Clean Light)");
      } else {
        toast.success("Switched to Black Mode (Pitch Black OLED)");
      }
    }
  };

  const toggleBgTheme = () => {
    applyTheme(bgTheme === "white" ? "black" : "white", true);
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
