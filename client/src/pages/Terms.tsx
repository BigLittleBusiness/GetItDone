/**
 * Terms of Service page — /terms
 *
 * Plain-language terms covering acceptable use, intellectual property,
 * disclaimers, and governing law.
 *
 */

import { Helmet } from "react-helmet-async";
import { FileText, AlertCircle, Shield, Ban, Scale, Mail, RefreshCw, Globe } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import { useState } from "react";

const LAST_UPDATED = "March 2026";

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    title: "Acceptance of these terms",
    content: `By accessing or using Taskbloom (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.

These Terms apply to all visitors, users, and others who access or use the Service. By creating an account or using any part of the Service, you confirm that you are at least 13 years of age and have the legal capacity to enter into a binding agreement.

If you are using the Service on behalf of an organisation, you represent and warrant that you have the authority to bind that organisation to these Terms.`,
  },
  {
    id: "description",
    icon: Globe,
    title: "Description of the Service",
    content: `Taskbloom is a neurodivergent-friendly productivity application designed to help people with ADHD, autism, dyslexia, and related conditions manage tasks, build routines, and reduce cognitive load.

The Service is operated by Big Little Business Pty Ltd, registered at Rothschild Street, Glen Huntly, Victoria, 3163, Australia ("we", "us", or "our").

We reserve the right to modify, suspend, or discontinue the Service (or any part of it) at any time with reasonable notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.`,
  },
  {
    id: "accounts",
    icon: Shield,
    title: "Your account",
    content: `To use the full features of the Service, you must sign in via Manus OAuth. You are responsible for maintaining the security of your account and for all activities that occur under your account.

You agree to:
— Provide accurate and complete information when creating your account.
— Notify us immediately of any unauthorised use of your account.
— Not share your account credentials with any third party.
— Not create multiple accounts for the purpose of circumventing any restrictions.

We reserve the right to suspend or terminate your account if we believe you have violated these Terms, with or without prior notice depending on the severity of the violation.`,
  },
  {
    id: "acceptable-use",
    icon: Ban,
    title: "Acceptable use",
    content: `You agree to use the Service only for lawful purposes and in a manner that does not infringe the rights of others. You must not:

— Use the Service to store, transmit, or distribute any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
— Attempt to gain unauthorised access to any part of the Service, its servers, or any systems connected to the Service.
— Use automated tools, bots, or scrapers to access or extract data from the Service without our express written permission.
— Reverse engineer, decompile, or disassemble any part of the Service.
— Use the Service in any way that could damage, disable, overburden, or impair its infrastructure.
— Impersonate any person or entity, or falsely represent your affiliation with any person or entity.

We reserve the right to investigate and take appropriate legal action against anyone who, in our sole discretion, violates these provisions.`,
  },
  {
    id: "content",
    icon: FileText,
    title: "Your content",
    content: `The tasks, notes, and other content you create within the Service ("Your Content") remain yours. You retain full ownership of Your Content.

By using the Service, you grant us a limited, non-exclusive, royalty-free licence to store, process, and display Your Content solely for the purpose of providing the Service to you. This licence ends when you delete Your Content or close your account.

You are solely responsible for Your Content and the consequences of sharing or publishing it. We do not claim ownership of Your Content and will not sell it to third parties.

We may delete Your Content if it violates these Terms, applicable law, or our content policies.`,
  },
  {
    id: "intellectual-property",
    icon: Scale,
    title: "Intellectual property",
    content: `The Service and its original content (excluding Your Content), features, and functionality are and will remain the exclusive property of Big Little Business Pty Ltd and its licensors.

Our trademarks, service marks, logos, and trade names — including "Taskbloom" — may not be used in connection with any product or service without our prior written consent.

The Service is protected by copyright, trademark, and other laws of Australia and international conventions. Nothing in these Terms grants you any right to use our intellectual property for any purpose other than using the Service as intended.`,
  },
  {
    id: "disclaimers",
    icon: AlertCircle,
    title: "Disclaimers and limitations of liability",
    content: `The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.

We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. We do not warrant that the results obtained from using the Service will be accurate or reliable.

Taskbloom is a productivity tool and is not a substitute for professional medical, psychological, or therapeutic advice. If you have concerns about ADHD, autism, or any other condition, please consult a qualified healthcare professional.

To the fullest extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Service.`,
  },
  {
    id: "termination",
    icon: Ban,
    title: "Termination",
    content: `You may stop using the Service and close your account at any time by contacting us at admin@biglittlebusiness.com. Upon account closure, we will delete your personal data in accordance with our Privacy Policy.

We may terminate or suspend your access to the Service immediately, without prior notice or liability, if you breach these Terms or if we are required to do so by law.

Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`,
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Changes to these terms",
    content: `We reserve the right to update or modify these Terms at any time. When we make material changes, we will notify you by updating the "Last updated" date at the top of this page and, where appropriate, by sending a notification through the Service or by email.

Your continued use of the Service after any changes to these Terms constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Service.

We encourage you to review these Terms periodically to stay informed of any updates.`,
  },
  {
    id: "governing-law",
    icon: Scale,
    title: "Governing law and disputes",
    content: `These Terms shall be governed by and construed in accordance with the laws of Victoria, Australia, without regard to its conflict of law provisions.

Any dispute arising out of or relating to these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If a resolution cannot be reached within 30 days, the dispute shall be submitted to the courts of Victoria, Australia, as applicable under local law.

If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.`,
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact us",
    content: `If you have any questions about these Terms, please contact us:

Email: admin@biglittlebusiness.com
Address: Big Little Business Pty Ltd, Rothschild Street, Glen Huntly, Victoria, 3163, Australia

We aim to respond to all enquiries within 5 business days.`,
  },
];

export default function Terms() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a1f3e] text-white">
      <Helmet>
        <title>Terms of Service — Taskbloom</title>
        <meta
          name="description"
          content="Read the Terms of Service for Taskbloom, the neurodivergent-friendly productivity app. Understand your rights and responsibilities when using the platform."
        />
        <meta property="og:title" content="Terms of Service — Taskbloom" />
        <meta
          property="og:description"
          content="Plain-language terms covering your account, acceptable use, intellectual property, and more."
        />
        <meta property="og:url" content="https://taskbloom.app/terms" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service — Taskbloom" />
      </Helmet>

      <MarketingNav onJoinWaitlist={() => setShowFeedback(true)} />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-indigo-200 mb-6">
            <FileText size={14} />
            Last updated: {LAST_UPDATED}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
            Terms of Service
          </h1>
          <p className="text-lg text-indigo-200 leading-relaxed max-w-2xl mx-auto">
            These terms are written in plain language. We have done our best to avoid legal jargon
            so you can understand exactly what you are agreeing to.
          </p>
        </div>
      </section>

      {/* Legal notice */}
      <section className="pb-8 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-5 flex gap-4">
            <AlertCircle className="text-indigo-300 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-indigo-100 leading-relaxed">
              These Terms are written in good faith but do not constitute legal advice. Consider having them reviewed by a qualified legal professional.
            </p>
          </div>
        </div>
      </section>

      {/* Quick navigation */}
      <section className="pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-4">
              Jump to section
            </p>
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-xs bg-white/10 hover:bg-indigo-500/30 border border-white/10 hover:border-indigo-400/40 text-indigo-200 hover:text-white rounded-full px-3 py-1.5 transition-all duration-200"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                id={s.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-indigo-300" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{s.title}</h2>
                </div>
                <div className="space-y-4">
                  {s.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-indigo-100/80 leading-relaxed text-sm">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <MarketingFooter />
      <BackToTop />
      <CookieConsent />
    </div>
  );
}
