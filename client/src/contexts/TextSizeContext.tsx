/**
 * TextSizeContext
 *
 * Manages the user's text-size preference (Small / Medium / Large).
 * Applies the chosen size as a `data-text-size` attribute on <html> so that
 * the CSS variables defined in index.css take effect globally.
 *
 * The preference is persisted in localStorage under "text_size" for instant
 * application on page load before the server profile is fetched.
 */

import React, { createContext, useContext, useEffect, useState } from "react";

export type TextSize = "small" | "medium" | "large";

const STORAGE_KEY = "text_size";

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as TextSize | null;
    return stored ?? "medium";
  });

  // Apply data attribute to <html> whenever the size changes
  useEffect(() => {
    const root = document.documentElement;
    if (textSize === "medium") {
      root.removeAttribute("data-text-size");
    } else {
      root.setAttribute("data-text-size", textSize);
    }
    localStorage.setItem(STORAGE_KEY, textSize);
  }, [textSize]);

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
  };

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const ctx = useContext(TextSizeContext);
  if (!ctx) throw new Error("useTextSize must be used within TextSizeProvider");
  return ctx;
}
