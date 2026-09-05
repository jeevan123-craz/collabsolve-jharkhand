'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '@/lib/data';
import ChallengeCard from '@/components/ChallengeCard';
import { Search, Trophy, FileText, Compass, Clock, CheckCircle, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, where } from '@/lib/mock-firebase';
import { useApp } from '@/lib/AppContext';

const categories: Category[] = ['Education', 'Healthcare', 'Agriculture', 'Water Management', 'Environment', 'Public Service', 'Mining Safety', 'Tribal Welfare', 'Infrastructure'];

export default function ResearcherPortal() {
  const { user, t } = useApp();
  const [tab, setTab] = useState<'explore' | 'proposals' | 'leaderboard'>('explore');
  const [filterCat, setFilterCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [allProposals, setAllProposals] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'challenges'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChallenges(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'proposals'), where('authorId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProposals(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const allQ = query(collection(db, 'proposals'));
    const unsubAll = onSnapshot(allQ, (snap) => {
      setAllProposals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubscribe();
      unsubAll();
    };
  }, [user]);

  const openChallenges = challenges.filter(c =>
    c.status === 'Open for Proposals' || c.status === 'Validated'
  );

  const dynamicLeaderboard = (() => {
    const scores: Record<string, { name: string, institution: string, score: number, solved: number }> = {};
    allProposals.forEach(p => {
      if (p.status === 'Accepted') {
        const team = p.teamName || 'Anonymous Team';
        if (!scores[team]) scores[team] = { name: team, institution: p.institution || 'Unknown', score: 0, solved: 0 };
        scores[team].score += p.impactScore || 100;
        scores[team].solved += 1;
      }
    });
    const sorted = Object.values(scores).sort((a, b) => b.score - a.score);
    return sorted.map((s, idx) => ({
      rank: idx + 1,
      name: s.name,
      institution: s.institution,
      impactScore: s.score,
      challengesSolved: s.solved,
      badge: idx === 0 ? '🏆 Platinum Innovator' : idx === 1 ? '🥇 Gold Partner' : '🥈 Silver Scholar'
    }));
  })();

  const filtered = openChallenges.filter(c =>
    (!filterCat || c.category === filterCat) &&
    (!search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center gap-2">
          🎓 {t('researcher.hub')}
        </h1>
        <p className="text-on-surface-variant text-body-lg">{t('researcher.desc')}</p>
      </div>

      {/* Modern Tabs */}
      <div className="flex p-1 bg-surface-container-low rounded-xl mb-8 max-w-lg border border-surface-variant">
        {(['explore', 'proposals', 'leaderboard'] as const).map(tKey => (
          <button 
            key={tKey} 
            onClick={() => setTab(tKey)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === tKey 
                ? 'bg-surface-container-lowest shadow-sm text-primary border border-outline-variant/30' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/50'
            }`}
          >
            {tKey === 'explore' && <Compass className="w-4 h-4" />}
            {tKey === 'proposals' && <FileText className="w-4 h-4" />}
            {tKey === 'leaderboard' && <Trophy className="w-4 h-4" />}
            {tKey === 'explore' ? t('researcher.explore') : tKey === 'proposals' ? t('researcher.myproposals') : t('researcher.leaderboard')}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Explore Tab */}
        {tab === 'explore' && (
          <motion.div key="explore" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('researcher.search')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="relative w-full md:w-64">
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pr-10"
                >
                  <option value="">{t('researcher.allcategories')}</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
            
            <p className="font-label-md text-label-md text-on-surface-variant mb-4">{filtered.length} {t('researcher.available')}</p>
            
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {filtered.map(c => (
                <motion.div key={c.id} variants={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}>
                  <ChallengeCard challenge={c} />
                </motion.div>
              ))}
            </motion.div>
            
            {filtered.length === 0 && (
              <div className="text-center py-16 bg-surface-container-low rounded-xl border border-surface-variant">
                <p className="text-4xl mb-2 opacity-50">🔍</p>
                <p className="font-body-md text-body-md text-on-surface-variant">No open challenges match your filters.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Proposals Tab */}
        {tab === 'proposals' && (
          <motion.div key="proposals" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">My Submitted Proposals</h2>
            {proposals.length === 0 && (
              <p className="text-on-surface-variant">You have not submitted any proposals yet.</p>
            )}
            {proposals.map(p => (
              <motion.div key={p.id} variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }} className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant p-md hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-headline-md text-xl font-bold text-on-surface">{p.teamName}</h3>
                    <p className="font-label-md text-label-md text-primary mt-1">{p.institution}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-bold flex items-center gap-1 uppercase tracking-wider ${
                    p.status === 'Accepted' ? 'bg-[#DCFCE7] text-success-green' :
                    p.status === 'Rejected' ? 'bg-error-container text-on-error-container' :
                    'bg-[#FEF3C7] text-warning-amber'
                  }`}>
                    {p.status === 'Accepted' && <CheckCircle className="w-3.5 h-3.5" />}
                    {p.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                    {p.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                    {p.status || 'Pending'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4 bg-surface-container-low p-3 rounded-lg border border-surface-variant/50 leading-relaxed">{p.approach}</p>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 font-label-sm text-sm text-on-surface-variant bg-surface-container-lowest border-t border-outline-variant/30 pt-4">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-outline" /> {p.timeline}</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-outline">payments</span> {p.budgetRequest}</span>
                  <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-warning-amber" /> Impact Score: {p.impactScore || 'N/A'}</span>
                </div>
                
                {p.teamMembers && p.teamMembers.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.teamMembers.map((m: string) => (
                      <span key={m} className="font-label-sm text-xs bg-surface-variant/50 text-on-surface-variant px-2.5 py-1 rounded-md border border-outline-variant/50">{m}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {tab === 'leaderboard' && (
          <motion.div key="leaderboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FBBF24]" /> Impact Leaderboard
            </h2>
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-outline-variant/50">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="px-6 py-4 text-left font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Researcher</th>
                      <th className="px-6 py-4 text-left font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Institution</th>
                      <th className="px-6 py-4 text-left font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Impact Score</th>
                      <th className="px-6 py-4 text-left font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Solved</th>
                      <th className="px-6 py-4 text-left font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {dynamicLeaderboard.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">No accepted proposals yet to calculate leaderboard.</td>
                      </tr>
                    )}
                    {dynamicLeaderboard.map((entry, idx) => (
                      <motion.tr 
                        key={entry.rank} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`transition-colors hover:bg-surface-container-low/50 ${entry.rank <= 3 ? 'bg-[#FEF3C7]/20' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-headline-md text-lg font-bold text-on-surface">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-label-md text-sm font-semibold text-on-surface">{entry.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-body-md text-sm text-on-surface-variant">{entry.institution}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="font-label-md text-sm font-bold text-on-surface w-8">{entry.impactScore}</span>
                            <div className="w-24 bg-surface-variant rounded-full h-2 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-warning-amber to-error-red" style={{ width: `${(entry.impactScore / 1000) * 100}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-label-md text-sm text-on-surface text-center">{entry.challengesSolved}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-label-sm text-xs">{entry.badge}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
