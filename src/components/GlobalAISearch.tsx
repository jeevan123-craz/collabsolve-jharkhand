'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, X, Loader2, MapPin, ArrowUpRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from '@/lib/mock-firebase';
import { Challenge, mockChallenges } from '@/lib/data';

interface SearchResult extends Challenge {
  relevanceScore?: number;
  matchReason?: string;
}

const suggestedQueries = [
  'Groundwater depletion in mining districts',
  'Tribal education and Santhali language tools',
  'Malnutrition monitoring in Santhal Pargana',
  'Crop loss and agricultural weather forecasting',
  'Illegal mining safety in Koderma'
];

export default function GlobalAISearch({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all challenges for semantic search context
  useEffect(() => {
    async function loadChallenges() {
      try {
        const q = query(collection(db, 'challenges'));
        const snapshot = await getDocs(q);
        if (snapshot && snapshot.docs && snapshot.docs.length > 0) {
          const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
          setChallenges(loaded);
        }
      } catch (err) {
        console.error('Error fetching challenges for AI search:', err);
      }
    }
    loadChallenges();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSearch = async (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    setLoading(true);
    setHasSearched(true);
    setAiSummary(null);

    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: term,
          challenges: challenges.length > 0 ? challenges : mockChallenges,
        }),
      });

      const data = await res.json();
      setResults(data.results || []);
      setAiSummary(data.aiSummary || null);
    } catch (error) {
      console.error('AI smart search failed:', error);
      // Fallback local search
      const qLower = term.toLowerCase();
      const filtered = (challenges.length > 0 ? challenges : mockChallenges).filter(
        c =>
          c.title?.toLowerCase().includes(qLower) ||
          c.description?.toLowerCase().includes(qLower) ||
          c.category?.toLowerCase().includes(qLower) ||
          c.district?.toLowerCase().includes(qLower)
      );
      setResults(filtered);
      setAiSummary(`Showing ${filtered.length} matching civic challenges across Jharkhand.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(queryText);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQueryText(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className="w-full">
      {/* Search Bar / Input Area */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center bg-white dark:bg-gray-900 rounded-2xl border-2 border-primary/20 hover:border-primary/40 focus-within:border-primary shadow-lg shadow-primary/5 transition-all p-1.5">
          <div className="pl-3.5 pr-2 text-primary flex items-center">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Ask AI: e.g. 'Find urgent water or tribal education issues in Dumka'..."
            className="w-full bg-transparent px-2 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base outline-none font-medium"
          />
          {queryText && (
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setHasSearched(false);
                setResults([]);
                setAiSummary(null);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !queryText.trim()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Query Chips */}
      {!hasSearched && (
        <div className="mt-4">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Suggested Semantic Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 transition-all text-left"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results & AI Summary */}
      <AnimatePresence>
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 space-y-4"
          >
            {/* AI Summary Banner */}
            {aiSummary && (
              <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border border-primary/20 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl text-primary mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      AI Synthesis & Insights
                    </h4>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                      {aiSummary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {results.length} {results.length === 1 ? 'Challenge' : 'Challenges'} Ranked by Relevance
              </span>
            </div>

            {/* Results Grid / List */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                          {c.category}
                        </span>
                        {typeof c.relevanceScore === 'number' && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {c.relevanceScore}% match
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {c.title}
                      </h4>

                      {/* Match Reason if provided by AI */}
                      {c.matchReason && (
                        <div className="mb-2.5 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 font-medium">
                          💡 <span className="font-semibold">AI Match:</span> {c.matchReason}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                        {c.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {c.district}
                      </span>
                      <Link
                        href={`/challenges/${c.id}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 font-bold text-primary hover:text-blue-600 transition-colors"
                      >
                        View Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <Search className="w-8 h-8 mx-auto text-gray-400 mb-2 opacity-60" />
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">No matching challenges found</p>
                  <p className="text-xs text-gray-500 mt-1">Try phrasing your query differently or using broader keywords.</p>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
