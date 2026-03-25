/**
 * BackToTop — a floating button that fades in once the user has scrolled
 * past a threshold and smoothly returns them to the top of the page.
 *
 * Usage (add once, near the bottom of any marketing page's JSX):
 *   import BackToTop from "@/components/BackToTop";
 *   <BackToTop />
 *
 * The button sits above the existing dashboard FAB (z-40 vs z-50) so it
 * never overlaps the app's action button on authenticated pages.
 */

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  /** Scroll distance in px before the button appears. Defaults to 400. */
  threshold?: number;
}

export default function BackToTop({ threshold = 400 }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > threshold);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount in case the page loads mid-scroll
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={[
        // Layout & shape
        "fixed bottom-6 right-6 z-40",
        "w-11 h-11 rounded-full",
        // Colours — matches the marketing site's indigo palette
        "bg-indigo-500/90 hover:bg-indigo-400 text-white",
        // Subtle shadow so it lifts off the page
        "shadow-lg shadow-indigo-900/30",
        // Micro-interaction
        "hover:scale-110 active:scale-95",
        // Visibility transition
        "transition-all duration-300 ease-out",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
        // Centre the icon
        "flex items-center justify-center",
        // Focus ring for keyboard accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      ].join(" ")}
    >
      <ArrowUp size={18} strokeWidth={2.5} />
    </button>
  );
}
