/**
 * MarketingFooter — shared footer used across all marketing pages.
 *
 * Usage:
 *   import MarketingFooter from "@/components/MarketingFooter";
 *   <MarketingFooter />
 */

import { useLogo } from "@/hooks/useLogo";

export default function MarketingFooter() {
  const { wordmarkUrl } = useLogo();
  return (
    <footer className="bg-[#1E2639] py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand — wordmark pulled from admin logo settings */}
        <div className="flex items-center opacity-80">
          <img src={wordmarkUrl} alt="Taskbloom" className="h-7 w-auto object-contain" />
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
