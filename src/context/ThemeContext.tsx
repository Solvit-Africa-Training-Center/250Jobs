import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
    const root = document.documentElement;
    const body = document.body;
    const isDark = theme === "dark";

    // Apply to html and body to satisfy different selectors/builds
    root.classList.toggle("dark", isDark);
    body.classList.toggle("dark", isDark);
    if (isDark) {
      root.setAttribute("data-theme", "dark");
      body.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      body.setAttribute("data-theme", "light");
    }
  }, [theme]);

  const value = useMemo<ThemeContextType>(
    () => ({ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")), setTheme }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
