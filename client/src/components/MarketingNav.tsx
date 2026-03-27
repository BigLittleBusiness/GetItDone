/**
 * MarketingNav — shared navigation bar for all public marketing pages.
 *
 * Usage:
 *   import MarketingNav from "@/components/MarketingNav";
 *   <MarketingNav onJoinWaitlist={() => setIsFeedbackOpen(true)} />
 *
 * The component automatically highlights the active link based on the
 * current pathname, so no extra props are needed per page.
 */

import { Menu } from "lucide-react";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface MarketingNavProps {
  /** Called when the "Join Waitlist" button is clicked. */
  onJoinWaitlist: () => void;
}

// All top-level nav links. "Features" scrolls to the home page anchor.
const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Our Mission", href: "/mission" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Parents & Carers", href: "/parents" },
] as const;

export default function MarketingNav({ onJoinWaitlist }: MarketingNavProps) {
  const { isAuthenticated } = useAuth();
  const [pathname, setLocation] = useLocation();

  /** Returns true when the nav link should be styled as active. */
  function isActive(href: string): boolean {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href;
  }

  /** Desktop link class — underline when active, hover otherwise. */
  function desktopLinkClass(href: string): string {
    return isActive(href)
      ? "text-white border-b border-white/40 pb-0.5"
      : "hover:text-white transition-colors";
  }

  /** Mobile dropdown link class — highlighted background when active. */
  function mobileLinkClass(href: string, extra = ""): string {
    const base = "block px-5 py-3 text-sm transition-colors";
    const active = isActive(href)
      ? "text-white bg-white/5"
      : "text-indigo-100 hover:bg-white/5 hover:text-white";
    return [base, active, extra].filter(Boolean).join(" ");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#3B4A6B]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
            <img src={APP_LOGO} alt="Taskbloom logo" className="w-10 h-10 object-cover" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight">Taskbloom</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-indigo-100">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className={desktopLinkClass(href)}>
              {label}
            </a>
          ))}

          {isAuthenticated ? (
            <button
              onClick={() => setLocation("/dashboard")}
              className="bg-white text-[#3B4A6B] px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors font-semibold"
            >
              Go to App →
            </button>
          ) : (
            <button
              onClick={onJoinWaitlist}
              className="bg-white text-[#3B4A6B] px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors font-semibold"
            >
              Join Waitlist
            </button>
          )}
        </div>

        {/* Mobile CTA + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => setLocation("/dashboard")}
              className="text-sm bg-white text-[#3B4A6B] px-4 py-2 rounded-full font-semibold"
            >
              Go to App
            </button>
          ) : (
            <button
              onClick={onJoinWaitlist}
              className="text-sm bg-white text-[#3B4A6B] px-4 py-2 rounded-full font-semibold"
            >
              Join Waitlist
            </button>
          )}

          <details className="relative group">
            <summary className="list-none p-2 text-white cursor-pointer">
              <Menu size={24} />
            </summary>
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#2A354F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              {NAV_LINKS.map(({ label, href }, i) => (
                <a
                  key={href}
                  href={href}
                  className={mobileLinkClass(
                    href,
                    i === NAV_LINKS.length - 1 ? "border-t border-white/5" : ""
                  )}
                >
                  {label}
                </a>
              ))}
            </div>
          </details>
        </div>

      </div>
    </nav>
  );
}
