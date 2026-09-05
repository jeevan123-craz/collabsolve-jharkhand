'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, DollarSign, TrendingUp, Users, Handshake } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from '@/lib/mock-firebase';

export default function IndustryPortal() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [industryProfile, setIndustryProfile] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<Record<string, { score: number, reason: string }>>({});

  const handleMatch = async () => {
    if (!industryProfile) return;
    setIsMatching(true);
    try {
      const res = await fetch('/api/ai/semantic-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: industryProfile,
          proposals: proposals.filter(p => p.status === 'Accepted'),
          challenges
        })
      });
      const data = await res.json();
      const results: Record<string, { score: number, reason: string }> = {};
      data.matches?.forEach((m: any) => {
        results[m.proposalId] = { score: m.matchScore, reason: m.reason };
      });
      setMatchResults(results);
    } catch (e) {
      console.error(e);
    }
    setIsMatching(false);
  };

  useEffect(() => {
    const pQ = query(collection(db, 'proposals'));
    const unsubP = onSnapshot(pQ, (snap) => {
      setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const cQ = query(collection(db, 'challenges'));
    const unsubC = onSnapshot(cQ, (snap) => {
      setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubP();
      unsubC();
    };
  }, []);

  const acceptedProposals = proposals.filter(p => p.status === 'Accepted');
  const totalBudget = acceptedProposals.reduce((sum, p) => {
    const num = parseInt((p.budgetRequest || '').replace(/[^0-9]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center gap-2">
            🏭 Industry Partner Portal
          </h1>
          <p className="text-on-surface-variant text-body-lg">Fund, mentor, and power innovation-driven solutions for Jharkhand's civic challenges.</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="font-headline-md text-3xl font-bold text-on-surface">{acceptedProposals.length}</p>
            <p className="font-label-md text-sm text-on-surface-variant mt-1">Approved Proposals</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-success-green flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="font-headline-md text-3xl font-bold text-on-surface">₹{(totalBudget / 100000).toFixed(2)}L</p>
            <p className="font-label-md text-sm text-on-surface-variant mt-1">Total Funding Needed</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="font-headline-md text-3xl font-bold text-on-surface">14</p>
            <p className="font-label-md text-sm text-on-surface-variant mt-1">Active Partners</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#FFEDD5] text-warning-amber flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="font-headline-md text-3xl font-bold text-on-surface">89%</p>
            <p className="font-label-md text-sm text-on-surface-variant mt-1">Implementation Success</p>
          </div>
        </motion.div>

        {/* Proposals Ready for Funding */}
        <motion.div variants={itemVariants} className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Proposals Ready for Sponsorship</h2>
          
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Enter your industry focus (e.g. Clean Energy)" 
              value={industryProfile}
              onChange={e => setIndustryProfile(e.target.value)}
              className="px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:border-primary outline-none min-w-[250px]"
            />
            <button onClick={handleMatch} disabled={isMatching || !industryProfile} className="bg-secondary/10 text-secondary hover:bg-secondary/20 px-4 py-2 rounded-lg font-label-md flex items-center gap-2 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              {isMatching ? 'Matching...' : 'Find Matches'}
            </button>
          </div>
        </motion.div>
        
        {acceptedProposals.length === 0 && (
          <p className="text-on-surface-variant mb-6">No accepted proposals ready for sponsorship yet.</p>
        )}

        <motion.div variants={itemVariants} className="space-y-6">
          {[...acceptedProposals]
            .sort((a, b) => (matchResults[b.id]?.score || 0) - (matchResults[a.id]?.score || 0))
            .map((p, idx) => {
            const challenge = challenges.find(c => c.id === p.challengeId);
            const match = matchResults[p.id];
            
            return (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                          SOLVING: {challenge?.title || 'Unknown Challenge'}
                        </p>
                        {match && (
                          <span className="bg-[#DCFCE7] text-success-green px-3 py-1 rounded-full font-label-sm text-xs font-bold shadow-sm">
                            {match.score}% Match
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline-md text-2xl font-bold text-on-surface">{p.teamName}</h3>
                      <p className="font-label-md text-sm text-on-surface-variant mt-1">{p.institution}</p>
                      
                      <div className="bg-surface-container-low p-4 rounded-xl mt-4 border border-outline-variant/30">
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{p.approach}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5 font-label-md text-sm text-on-surface">
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-outline">schedule</span> {p.timeline}</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-success-green">payments</span> {p.budgetRequest}</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-warning-amber">star</span> Impact: {p.impactScore || 'N/A'}/100</span>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-48 flex flex-col gap-3 shrink-0">
                      <button className="w-full bg-primary text-on-primary font-label-md text-sm px-4 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                        <Handshake className="w-4 h-4" /> Sponsor Project
                      </button>
                      <button className="w-full bg-surface-container-low text-on-surface font-label-md text-sm px-4 py-3 rounded-xl hover:bg-surface-variant transition-all border border-outline-variant/30 flex items-center justify-center gap-2">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* AI Match Tag */}
                {match ? (
                  <div className="bg-[#DCFCE7]/20 px-6 md:px-8 py-3 border-t border-[#DCFCE7] flex items-start gap-2">
                    <span className="material-symbols-outlined text-success-green text-[20px] mt-0.5">smart_toy</span>
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                      <strong className="text-success-green">AI Match Reason:</strong> {match.reason}
                    </p>
                  </div>
                ) : (
                  <div className="bg-primary/5 px-6 md:px-8 py-3 border-t border-primary/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
                    <p className="font-label-sm text-sm text-primary">
                      <strong>AI Match:</strong> Awaiting industry profile to evaluate semantic match.
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* CSR Impact Tracker */}
        <motion.div variants={itemVariants} className="mt-xl bg-surface-container-highest rounded-3xl p-8 border border-outline-variant/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">📊 Your CSR Impact Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                <p className="font-headline-lg text-4xl font-bold text-primary mb-1">₹45L</p>
                <p className="font-label-md text-sm text-on-surface-variant">Total CSR Investment</p>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                <p className="font-headline-lg text-4xl font-bold text-success-green mb-1">12,000+</p>
                <p className="font-label-md text-sm text-on-surface-variant">Lives Impacted</p>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                <p className="font-headline-lg text-4xl font-bold text-secondary mb-1">5</p>
                <p className="font-label-md text-sm text-on-surface-variant">Districts Covered</p>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
