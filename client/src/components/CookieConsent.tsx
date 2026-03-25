/**
 * CookieConsent — lightweight GDPR/ePrivacy cookie consent banner.
 *
 * - Appears at the bottom of the page on first visit.
 * - Persists the user's choice in localStorage under "cookie_consent".
 * - Offers "Accept All" and "Essential Only" options.
 * - Slides in with a smooth animation and dismisses cleanly.
 *
 * Usage:
 *   import CookieConsent from "@/components/CookieConsent";
 *   <CookieConsent />
 */

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "cookie_consent";

type ConsentValue = "all" | "essential" | null;

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentValue;
    if (!stored) {
      // Small delay so the banner doesn't flash on initial paint
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (value: "all" | "essential") => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none"
    >
      <div
        className="
          pointer-events-auto
          max-w-3xl mx-auto
          bg-[#1E2639]/95 backdrop-blur-md
          border border-white/10
          rounded-2xl
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          p-5
          flex flex-col sm:flex-row items-start sm:items-center gap-4
          animate-in slide-in-from-bottom-4 duration-300
        "
      >
        {/* Icon */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Cookie size={20} className="text-indigo-400" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90 leading-relaxed">
            We use cookies to keep you signed in and understand how people find
            us. No advertising cookies, ever.{" "}
            <a
              href="#"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => accept("essential")}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              text-indigo-300 hover:text-white
              border border-white/10 hover:border-white/20
              bg-transparent hover:bg-white/5
              transition-all duration-150
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400
            "
          >
            Essential only
          </button>
          <button
            onClick={() => accept("all")}
            className="
              px-4 py-2 rounded-lg text-sm font-semibold
              bg-indigo-600 hover:bg-indigo-500
              text-white
              transition-all duration-150
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400
            "
          >
            Accept all
          </button>
          <button
            onClick={() => accept("essential")}
            aria-label="Dismiss"
            className="
              p-1.5 rounded-lg
              text-white/40 hover:text-white/70
              hover:bg-white/5
              transition-all duration-150
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400
            "
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
