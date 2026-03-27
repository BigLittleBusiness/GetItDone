/**
 * Privacy Policy page — /privacy
 *
 * Plain-language privacy policy covering GDPR (EU), Australian Privacy Act 1988,
 * and general best-practice disclosure requirements.
 *
 */

import { Helmet } from "react-helmet-async";
import { Shield, Mail, Database, Eye, Trash2, Lock, Globe, FileText } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import { useState } from "react";

const LAST_UPDATED = "March 2026";

const sections = [
  {
    id: "who-we-are",
    icon: Globe,
    title: "Who we are",
    content: `Taskbloom is a neurodivergent-friendly productivity application. The data controller responsible for your personal information is:

Big Little Business Pty Ltd
Rothschild Street, Glen Huntly, Victoria, 3163, Australia
Contact: admin@biglittlebusiness.com

If you have any questions about this policy or how your data is handled, please contact us at the email address above.`,
  },
  {
    id: "what-we-collect",
    icon: Database,
    title: "What information we collect",
    content: `We collect only the information necessary to provide and improve the service.

Account information: When you sign in via Manus OAuth, we receive your name and a unique identifier. We do not receive your password.

Profile preferences: The role, motivation style, and reading theme you choose during onboarding and in Settings are stored against your account so they persist across sessions and devices.

Task data: The tasks you create, including their titles, due dates, completion status, and any AI-generated step breakdowns, are stored in our database.

Usage data: We collect anonymised analytics (page views, feature usage) to understand how the app is being used. This data cannot be linked back to individual users.

Waitlist and survey responses: If you complete the pre-launch survey on our marketing website, we store your responses and optional email address. This data is used solely for product development and early-access communication.

We do not collect payment information, location data, or any sensitive personal data beyond what is described above.`,
  },
  {
    id: "how-we-use",
    icon: Eye,
    title: "How we use your information",
    content: `We use your information for the following purposes, each with a lawful basis under applicable privacy law:

To provide the service: Your account information and task data are used to operate the app and display your content to you. Lawful basis: performance of a contract.

To personalise your experience: Your role, motivation style, and reading theme preferences are used to tailor the app's behaviour and appearance. Lawful basis: performance of a contract / legitimate interests.

To improve the product: Anonymised usage analytics help us understand which features are working well and where we can improve. Lawful basis: legitimate interests.

To communicate with early-access users: If you provided your email address via the waitlist survey, we may contact you about early access availability and product updates. Lawful basis: consent (you may withdraw this at any time by contacting us).

We do not use your data for advertising, profiling, or automated decision-making that produces legal or similarly significant effects.`,
  },
  {
    id: "data-sharing",
    icon: Lock,
    title: "Who we share your data with",
    content: `We do not sell your personal data. We share it only with the following categories of service providers, under strict data processing agreements:

Hosting and infrastructure: Our application and database are hosted on cloud infrastructure. Manus Cloud Platform processes data on our behalf.

Authentication: Sign-in is handled via Manus OAuth. Your authentication credentials are managed by Manus and are not accessible to us.

Analytics: We use a self-hosted analytics tool to collect anonymised usage data. No personally identifiable information is shared with this provider.

We do not share your data with any other third parties unless required to do so by law.`,
  },
  {
    id: "data-retention",
    icon: Trash2,
    title: "How long we keep your data",
    content: `Account and task data: Retained for as long as your account is active. If you delete your account, all associated data is permanently deleted within 30 days.

Waitlist and survey responses: Retained until the product launches publicly, after which we will either delete the data or ask for your renewed consent to continue holding it.

Anonymised analytics: Retained indefinitely as they cannot be linked to any individual.

Server logs: Retained for a maximum of 90 days for security and debugging purposes, then automatically deleted.`,
  },
  {
    id: "your-rights",
    icon: Shield,
    title: "Your rights",
    content: `Depending on your location, you have the following rights regarding your personal data:

Right of access: You can request a copy of the personal data we hold about you.

Right to rectification: You can ask us to correct inaccurate data. Most profile data can be updated directly in the Settings page of the app.

Right to erasure: You can request that we delete your account and all associated data.

Right to data portability: You can request your task data in a machine-readable format.

Right to object or restrict processing: You can ask us to stop or limit how we use your data in certain circumstances.

Right to withdraw consent: Where processing is based on consent (such as marketing emails), you can withdraw it at any time.

To exercise any of these rights, please contact us at admin@biglittlebusiness.com. We will respond within 30 days. If you are located in the EU/EEA and are unsatisfied with our response, you have the right to lodge a complaint with your local supervisory authority.`,
  },
  {
    id: "cookies",
    icon: FileText,
    title: "Cookies and local storage",
    content: `We use a small number of cookies and browser storage items to operate the service:

Session cookie: A secure, HTTP-only cookie is used to keep you signed in. This is essential for the app to function and cannot be disabled.

Consent preference: Your cookie consent choice is stored in your browser's localStorage so we do not ask again on subsequent visits.

Reading theme: Your chosen reading theme is stored in localStorage for instant application on page load, before your account preferences are fetched.

Analytics: If you accept all cookies, we set an anonymised analytics identifier to count unique visitors. This contains no personal information.

We do not use advertising cookies, tracking pixels, or third-party cookies for any purpose.`,
  },
  {
    id: "security",
    icon: Lock,
    title: "Security",
    content: `We take reasonable technical and organisational measures to protect your data, including encrypted connections (HTTPS), secure session management, and access controls limiting who can view production data.

No method of transmission over the internet is completely secure. If you believe your account has been compromised, please contact us immediately at admin@biglittlebusiness.com.`,
  },
  {
    id: "children",
    icon: Shield,
    title: "Children's privacy",
    content: `Taskbloom is designed to be used by people of all ages, including young people with ADHD, autism, and other neurodivergent profiles. However, we require users to be at least 13 years old to create an account independently.

For users under 16 in the EU/EEA, or under 13 elsewhere, a parent or guardian must provide consent before an account is created. If you believe a child has created an account without appropriate consent, please contact us and we will delete it promptly.`,
  },
  {
    id: "changes",
    icon: FileText,
    title: "Changes to this policy",
    content: `We may update this policy from time to time. When we make material changes, we will update the "Last updated" date at the top of this page and, where appropriate, notify registered users by email.

Continued use of the service after changes take effect constitutes acceptance of the updated policy.`,
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact us",
    content: `If you have any questions, concerns, or requests regarding this privacy policy or your personal data, please contact us:

Email: admin@biglittlebusiness.com
Big Little Business Pty Ltd, Rothschild Street, Glen Huntly, Victoria, 3163, Australia

We aim to respond to all privacy-related enquiries within 30 days.`,
  },
];

export default function Privacy() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#2A354F] text-white">
      <Helmet>
        <title>Privacy Policy — Taskbloom</title>
        <meta
          name="description"
          content="How Taskbloom collects, uses, and protects your personal data. Plain-language privacy policy covering GDPR and Australian Privacy Act requirements."
        />
        <meta property="og:title" content="Privacy Policy — Taskbloom" />
        <meta
          property="og:description"
          content="How Taskbloom collects, uses, and protects your personal data."
        />
        <meta property="og:url" content="https://taskbloom.app/privacy" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy — Taskbloom" />
      </Helmet>

      <MarketingNav onJoinWaitlist={() => setIsFeedbackOpen(true)} />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-200 text-sm font-medium mb-6">
          <Shield size={14} />
          Your data, explained plainly
        </div>
        <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
          Privacy Policy
        </h1>
        <p className="text-lg text-indigo-200 max-w-2xl mx-auto leading-relaxed">
          We believe you deserve to know exactly what happens with your information — in plain language, not legal jargon. Last updated: {LAST_UPDATED}.
        </p>

        {/* Quick-nav */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              {s.title}
            </a>
          ))}
        </div>
      </section>

      {/* Notice banner */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-5 flex gap-4 items-start">
          <FileText size={20} className="text-indigo-300 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-100 leading-relaxed">
            This policy is written in good faith based on the app's actual data practices, but it does not constitute legal advice. Consider having it reviewed by a qualified privacy lawyer.
          </p>
        </div>
      </section>

      {/* Policy sections */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                id={s.id}
                className="glass-card rounded-3xl p-8 scroll-mt-24"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-indigo-300" />
                  </div>
                  <h2 className="text-2xl font-serif">{s.title}</h2>
                </div>
                <div className="text-indigo-100 leading-relaxed space-y-4">
                  {s.content.split("\n\n").map((para, i) => {
                    // Lines that end with a colon are sub-headings
                    const lines = para.split("\n");
                    return (
                      <div key={i}>
                        {lines.map((line, j) => {
                          const isSubHeading =
                            line.trim().endsWith(":") &&
                            !line.trim().startsWith("[");
                          return isSubHeading ? (
                            <p
                              key={j}
                              className="font-semibold text-white mt-4 mb-1"
                            >
                              {line}
                            </p>
                          ) : (
                            <p key={j} className={line === "" ? "hidden" : ""}>
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <MarketingFooter />
      <BackToTop />
      <CookieConsent />

      {/* Feedback modal placeholder — keeps onJoinWaitlist wired */}
      {isFeedbackOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setIsFeedbackOpen(false)}
        >
          <div
            className="glass-card rounded-3xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif mb-3">Join the Waitlist</h3>
            <p className="text-indigo-200 text-sm mb-5">
              Head to our home page to join the early access waitlist.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
