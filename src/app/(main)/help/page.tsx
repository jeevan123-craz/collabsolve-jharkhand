'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Shield, Sparkles, Users, MapPin } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  { q: 'How do I report a civic issue?', a: 'Go to the "Report Issue" page, fill in the title, description, select your district, and attach any photos, videos, or documents. Our AI will automatically categorize your issue and check for duplicates before submission.' },
  { q: 'How does the AI categorization work?', a: 'When you submit a challenge, our Gemini-powered AI analyzes your title and description to automatically suggest the best category (Education, Healthcare, Water Management, etc.), relevant skills needed, and the most suitable university/department to solve it.' },
  { q: 'Can I track my complaint status?', a: 'Yes! After submitting, you receive a Tracking ID. Go to the "Track" page and enter your ID to see a visual timeline of your complaint\'s progress through all stages: Reported → Validated → Open for Proposals → In Progress → Resolved.' },
  { q: 'Who resolves the challenges?', a: 'Challenges are routed to partner universities (BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, etc.) and industry sponsors. Researchers form teams, submit proposals, and work on solutions with mentorship and funding support.' },
  { q: 'What is the SLA (Service Level Agreement)?', a: 'Each challenge has an expected resolution timeline. If a challenge is not addressed within the SLA period, it gets automatically escalated to higher authorities. Our current SLA compliance rate is 87%.' },
  { q: 'How does the leaderboard work?', a: 'Universities are ranked by their resolution rate, speed, and citizen satisfaction scores. Citizens earn badges (Gold, Silver, Bronze Reporter) based on the number of verified reports they submit. This gamification encourages active participation.' },
  { q: 'Is my data secure?', a: 'Yes. We use Firebase Authentication for secure login and Firestore Security Rules that enforce document-level access control. Only the author of a challenge can edit or delete it, and admin actions are role-verified.' },
  { q: 'What AI features are available?', a: 'CollabSolve uses 13+ AI features: Smart Categorization, Duplicate Detection, Sentiment Analysis, Auto-Assignment, Semantic Search, Description Improvement, Proposal Scoring, Report Generation, Semantic Matching, Nudge Engine, Admin Chatbot, Follow-up Questions, and Project Summarization.' },
  { q: 'How can industry partners get involved?', a: 'Industry partners can browse challenges on the Industry Portal, view AI-matched opportunities based on their CSR focus areas, and provide funding, mentorship, or resources to university teams working on solutions.' },
  { q: 'What districts does the platform cover?', a: 'CollabSolve covers all 24 districts of Jharkhand, including Ranchi, Dhanbad, Jamshedpur, Bokaro, Hazaribagh, Deoghar, Dumka, and more. The platform uses GPS auto-detection when submitting challenges.' },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <h1 className="font-headline-lg text-4xl font-black text-on-surface mb-3 flex items-center justify-center gap-3">
            <HelpCircle className="w-10 h-10 text-primary" /> Help Center
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Everything you need to know about using CollabSolve Jharkhand.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Report Issue', href: '/citizen', color: 'text-primary bg-primary/10' },
            { icon: MapPin, label: 'Track Status', href: '/track', color: 'text-secondary bg-secondary/10' },
            { icon: Sparkles, label: 'AI Features', href: '/challenges', color: 'text-warning-amber bg-warning-amber/10' },
            { icon: Users, label: 'Leaderboard', href: '/leaderboard', color: 'text-success-green bg-success-green/10' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="bg-surface-container-lowest rounded-2xl border border-surface-variant p-5 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-on-surface">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="font-headline-md text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest rounded-2xl border border-surface-variant overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container-low/50 transition-colors"
              >
                <span className="font-bold text-on-surface pr-4">{faq.q}</span>
                {openIndex === i ? <ChevronUp className="w-5 h-5 text-primary shrink-0" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant shrink-0" />}
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-on-surface-variant leading-relaxed border-t border-surface-variant pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-10 text-center">
          <p className="text-on-surface-variant mb-3">Still have questions?</p>
          <Link href="/feedback" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
            <Shield className="w-4 h-4" /> Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
