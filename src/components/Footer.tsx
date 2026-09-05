'use client';
import Link from 'next/link';
import { Heart, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-variant bg-surface-container-low/50 mt-auto">
      <div className="max-w-container-max mx-auto px-gutter py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg leading-none">C</span>
              </div>
              <span className="font-extrabold text-lg text-on-surface">CollabSolve</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              A digital platform to crowdsource societal challenges and facilitate collaborative problem solving across Jharkhand.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-on-surface mb-3 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/citizen" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Report Issue</Link></li>
              <li><Link href="/challenges" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Browse Challenges</Link></li>
              <li><Link href="/researcher" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Researcher Hub</Link></li>
              <li><Link href="/impact" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Impact Dashboard</Link></li>
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <h4 className="font-bold text-on-surface mb-3 text-sm uppercase tracking-wider">AI Features</h4>
            <ul className="space-y-2">
              <li className="text-sm text-on-surface-variant">✦ Smart Categorization</li>
              <li className="text-sm text-on-surface-variant">✦ Duplicate Detection</li>
              <li className="text-sm text-on-surface-variant">✦ Sentiment Analysis</li>
              <li className="text-sm text-on-surface-variant">✦ Auto-Assignment</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-on-surface mb-3 text-sm uppercase tracking-wider">Built For</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-2">
              Smart India Hackathon 2026
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Problem Statement: SIH26043
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed mt-1">
              Ministry of Education
            </p>
          </div>
        </div>

        <div className="border-t border-surface-variant pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-on-surface-variant flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-error fill-error" /> for Jharkhand &middot; © 2026 CollabSolve
          </p>
          <p className="text-xs text-on-surface-variant">
            Powered by Gemini AI &middot; Firebase &middot; Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
