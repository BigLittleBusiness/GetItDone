/**
 * MarketingFooter — shared footer used across all marketing pages.
 *
 * Usage:
 *   import MarketingFooter from "@/components/MarketingFooter";
 *   <MarketingFooter />
 */

import { APP_LOGO } from "@/const";

export default function MarketingFooter() {
  return (
    <footer className="bg-[#1E2639] py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2 opacity-80">
          <img src={APP_LOGO} alt="Taskbloom" className="w-6 h-6 object-contain" />
          <span className="font-serif font-medium">Taskbloom</span>
        </div>

        {/* Legal links */}
        <div className="flex gap-8 text-sm text-indigo-300">
          <a href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>

        {/* Copyright */}
        <div className="text-sm text-indigo-400">
          © 2026 Taskbloom. Built with ❤️ for neurodivergent minds.
        </div>
      </div>
    </footer>
  );
}
