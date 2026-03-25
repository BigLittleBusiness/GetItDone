/**
 * ReadingThemeContext
 *
 * Manages the user's reading theme preference (accessibility background colour).
 * Applies the chosen theme as a `data-reading-theme` attribute on <html> so that
 * the CSS variables defined in index.css take effect globally.
 *
 * The theme is persisted in localStorage under "reading_theme" for instant
 * application on page load before the server profile is fetched.
 */

import React, { createContext, useContext, useEffect, useState } from "react";

export type ReadingTheme = "default" | "cream" | "sage" | "sky" | "dusk" | "sand";

const STORAGE_KEY = "reading_theme";

interface ReadingThemeContextType {
  readingTheme: ReadingTheme;
  setReadingTheme: (theme: ReadingTheme) => void;
}

const ReadingThemeContext = createContext<ReadingThemeContextType | undefined>(undefined);

export function ReadingThemeProvider({ children }: { children: React.ReactNode }) {
  const [readingTheme, setReadingThemeState] = useState<ReadingTheme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ReadingTheme | null;
    return stored ?? "default";
  });

  // Apply data attribute to <html> whenever the theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (readingTheme === "default") {
      root.removeAttribute("data-reading-theme");
    } else {
      root.setAttribute("data-reading-theme", readingTheme);
    }
    localStorage.setItem(STORAGE_KEY, readingTheme);
  }, [readingTheme]);

  const setReadingTheme = (theme: ReadingTheme) => {
    setReadingThemeState(theme);
  };

  return (
    <ReadingThemeContext.Provider value={{ readingTheme, setReadingTheme }}>
      {children}
    </ReadingThemeContext.Provider>
  );
}

export function useReadingTheme() {
  const ctx = useContext(ReadingThemeContext);
  if (!ctx) throw new Error("useReadingTheme must be used within ReadingThemeProvider");
  return ctx;
}
