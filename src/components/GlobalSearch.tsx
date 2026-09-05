'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, MapPin, AlertTriangle, Command, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from '@/lib/mock-firebase';
import { Challenge, mockChallenges } from '@/lib/data';

const urgencyColors: Record<string, string> = {
  'Low': 'bg-surface-variant/50 text-on-surface-variant',
  'Medium': 'bg-warning-amber/10 text-warning-amber',
  'High': 'bg-error-container text-on-error-container',
  'Critical': 'bg-[#991B1B] text-white',
};

const statusColors: Record<string, string> = {
  'Reported': 'bg-gray-100 text-gray-700 ring-1 ring-gray-500/20',
  'Validated': 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  'Open for Proposals': 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
  'In Progress': 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-600/20',
  'Resolved': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
};

const quickCategories = [
  'All',
  'Water Management',
  'Education',
  'Healthcare',
  'Agriculture',
  'Mining Safety',
  'Tribal Welfare',
];

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time challenges from Firebase / mock-firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'challenges'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
      if (docs.length > 0) {
        setChallenges(docs);
      } else {
        // Fallback to mock data if empty
        setChallenges(mockChallenges);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Ctrl+K / Cmd+K and Escape shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedCategory('All');
      setSelectedIndex(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter challenges across title, description, district, and category
  const filteredChallenges = challenges.filter(challenge => {
    const matchesCategory =
      selectedCategory === 'All' ||
      challenge.category?.toLowerCase() === selectedCategory.toLowerCase();

    if (!matchesCategory) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    const titleMatch = challenge.title?.toLowerCase().includes(q);
    const descMatch = challenge.description?.toLowerCase().includes(q);
    const districtMatch = challenge.district?.toLowerCase().includes(q);
    const catMatch = challenge.category?.toLowerCase().includes(q);

    return titleMatch || descMatch || districtMatch || catMatch;
  });

  // Handle arrow key navigation in results
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (filteredChallenges.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredChallenges.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredChallenges.length) % filteredChallenges.length);
    }
  };

  return (
    <>
      {/* Trigger Button in Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full lg:rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-variant hover:border-primary/40 text-on-surface-variant hover:text-primary transition-all shadow-xs group cursor-pointer"
        title="Search challenges (Ctrl+K / ⌘K)"
        aria-label="Open global search"
      >
        <Search className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold hidden xl:inline text-on-surface-variant group-hover:text-primary">
          Search challenges...
        </span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant/70 bg-surface-container-lowest rounded-md border border-outline-variant shadow-2xs">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Full Screen Command Palette Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Modal Container */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant overflow-hidden flex flex-col my-auto max-h-[85vh] z-10"
              role="dialog"
              aria-modal="true"
            >
              {/* Header & Search Input */}
              <div className="p-4 sm:p-5 border-b border-surface-variant bg-surface-container-lowest">
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-primary">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedIndex(0);
                    }}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Search challenges by title, district, category, keywords..."
                    className="w-full pl-11 pr-20 py-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-base placeholder:text-on-surface-variant/60 outline-none transition-all"
                  />
                  <div className="absolute right-3 flex items-center gap-1.5">
                    {query && (
                      <button
                        onClick={() => {
                          setQuery('');
                          inputRef.current?.focus();
                        }}
                        className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-2 py-1 text-[11px] font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-md border border-outline-variant/50 transition-colors cursor-pointer"
                    >
                      ESC
                    </button>
                  </div>
                </div>

                {/* Quick Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Focus:
                  </span>
                  {quickCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Results / Content Area */}
              <div className="overflow-y-auto p-4 sm:p-5 flex-1 divide-y divide-surface-variant/50">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                    <p className="text-sm font-medium">Searching live challenges across Jharkhand...</p>
                  </div>
                ) : filteredChallenges.length === 0 ? (
                  /* No Results Found State */
                  <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-3.5 border border-surface-variant">
                      <Search className="w-7 h-7" />
                    </div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">
                      No challenges found
                    </h3>
                    <p className="font-body-md text-sm text-on-surface-variant max-w-sm mb-4">
                      {query ? (
                        <>No matches found for <span className="font-semibold text-on-surface">&ldquo;{query}&rdquo;</span>. Try another keyword or district.</>
                      ) : (
                        <>No challenges match the current filter selection.</>
                      )}
                    </p>
                    {query && (
                      <button
                        onClick={() => {
                          setQuery('');
                          setSelectedCategory('All');
                        }}
                        className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-lg transition-colors"
                      >
                        Reset filters & view all
                      </button>
                    )}
                  </div>
                ) : (
                  /* List of Challenge Results */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant px-1 pb-1">
                      <span>
                        {query ? 'MATCHING CHALLENGES' : 'ALL ACTIVE CHALLENGES'} ({filteredChallenges.length})
                      </span>
                      {selectedCategory !== 'All' && (
                        <span className="text-primary font-semibold">
                          Filtered by {selectedCategory}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {filteredChallenges.map((challenge, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                          <Link
                            key={challenge.id}
                            href={`/challenges/${challenge.id}`}
                            onClick={() => setIsOpen(false)}
                            className={`block p-4 rounded-2xl transition-all border group relative ${
                              isSelected
                                ? 'bg-primary/5 border-primary/40 shadow-xs'
                                : 'bg-surface-container-lowest hover:bg-surface-container-low border-surface-variant hover:border-outline-variant'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                              <h4 className="font-headline-md text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                                {challenge.title}
                              </h4>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {challenge.urgency && (
                                  <span
                                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                      urgencyColors[challenge.urgency] || 'bg-surface-variant text-on-surface-variant'
                                    }`}
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                                    {challenge.urgency}
                                  </span>
                                )}
                                {challenge.status && (
                                  <span
                                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      statusColors[challenge.status] || 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {challenge.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-3">
                              {challenge.description}
                            </p>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-variant/40">
                              <div className="flex flex-wrap items-center gap-2">
                                {challenge.category && (
                                  <span className="inline-flex items-center font-bold text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                    {challenge.category}
                                  </span>
                                )}
                                {challenge.district && (
                                  <span className="inline-flex items-center text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                                    <MapPin className="w-3 h-3 mr-1 text-outline" />
                                    {challenge.district}
                                  </span>
                                )}
                              </div>

                              <span className="inline-flex items-center text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                                Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Palette Footer */}
              <div className="px-4 py-3 bg-surface-container-low border-t border-surface-variant flex items-center justify-between text-[11px] font-medium text-on-surface-variant">
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-surface-container-lowest border border-outline-variant/60 rounded text-[10px] font-bold">↑↓</kbd> to navigate
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-surface-container-lowest border border-outline-variant/60 rounded text-[10px] font-bold">ESC</kbd> to exit
                  </span>
                </div>
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Semantic Search & Discovery</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
