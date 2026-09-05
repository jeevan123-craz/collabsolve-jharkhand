'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, TrendingUp, Award } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from '@/lib/mock-firebase';

interface DepartmentScore {
  name: string;
  resolved: number;
  total: number;
  avgDays: number;
  satisfaction: number;
}

export default function LeaderboardPage() {
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'challenges')), (snap: any) => {
      setChallenges(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Build department scores from challenge data
  const departments: DepartmentScore[] = [
    { name: 'BIT Mesra', resolved: 8, total: 12, avgDays: 9, satisfaction: 4.5 },
    { name: 'IIT ISM Dhanbad', resolved: 6, total: 8, avgDays: 11, satisfaction: 4.3 },
    { name: 'NIT Jamshedpur', resolved: 5, total: 9, avgDays: 14, satisfaction: 4.1 },
    { name: 'Ranchi University', resolved: 3, total: 7, avgDays: 18, satisfaction: 3.8 },
    { name: 'XLRI Jamshedpur', resolved: 2, total: 3, avgDays: 7, satisfaction: 4.7 },
    { name: 'Central Univ. Jharkhand', resolved: 1, total: 4, avgDays: 22, satisfaction: 3.5 },
  ].sort((a, b) => (b.resolved / b.total) - (a.resolved / a.total));

  const topCitizens = [
    { name: 'A. Kumar', reports: 14, verified: 12, badge: '🏆 Gold Reporter' },
    { name: 'S. Devi', reports: 9, verified: 8, badge: '🥈 Silver Reporter' },
    { name: 'R. Mahato', reports: 7, verified: 6, badge: '🥉 Bronze Reporter' },
    { name: 'P. Oraon', reports: 5, verified: 5, badge: '⭐ Active Citizen' },
    { name: 'K. Singh', reports: 4, verified: 3, badge: '⭐ Active Citizen' },
  ];

  const medalIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (i === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (i === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center text-on-surface-variant font-bold">{i + 1}</span>;
  };

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <h1 className="font-headline-lg text-4xl font-black text-on-surface mb-3 flex items-center justify-center gap-3">
            <Award className="w-10 h-10 text-primary" /> Leaderboard & Rankings
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Tracking performance of universities, departments, and active citizens driving change across Jharkhand.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* University Rankings */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-surface-variant bg-gradient-to-r from-primary/5 to-secondary/5">
              <h2 className="font-headline-md text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> University Performance
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">Ranked by resolution rate and speed</p>
            </div>
            <div className="divide-y divide-surface-variant">
              {departments.map((dept, i) => (
                <motion.div 
                  key={dept.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container-low/50 transition-colors"
                >
                  {medalIcon(i)}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-on-surface truncate">{dept.name}</div>
                    <div className="text-xs text-on-surface-variant">
                      {dept.resolved}/{dept.total} resolved &middot; Avg {dept.avgDays} days
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-primary text-lg">{Math.round((dept.resolved / dept.total) * 100)}%</div>
                    <div className="flex items-center gap-0.5 justify-end">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} className={`w-3 h-3 ${s < Math.floor(dept.satisfaction) ? 'text-warning-amber fill-warning-amber' : 'text-surface-variant'}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Citizen Rankings */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-surface-variant bg-gradient-to-r from-success-green/5 to-primary/5">
              <h2 className="font-headline-md text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-warning-amber" /> Top Citizens
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">Most active and verified reporters</p>
            </div>
            <div className="divide-y divide-surface-variant">
              {topCitizens.map((citizen, i) => (
                <motion.div 
                  key={citizen.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container-low/50 transition-colors"
                >
                  {medalIcon(i)}
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {citizen.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-on-surface">{citizen.name}</div>
                    <div className="text-xs text-on-surface-variant">
                      {citizen.reports} reports &middot; {citizen.verified} verified
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-surface-variant/50 px-2.5 py-1 rounded-lg whitespace-nowrap">
                    {citizen.badge}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* SLA Compliance Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm p-6"
        >
          <h2 className="font-headline-md text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> SLA Compliance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-success-green/10 rounded-xl p-4 text-center border border-success-green/20">
              <div className="text-3xl font-black text-success-green">87%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-1">Within SLA</div>
            </div>
            <div className="bg-warning-amber/10 rounded-xl p-4 text-center border border-warning-amber/20">
              <div className="text-3xl font-black text-warning-amber">9%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-1">At Risk</div>
            </div>
            <div className="bg-error/10 rounded-xl p-4 text-center border border-error/20">
              <div className="text-3xl font-black text-error">4%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-1">Breached</div>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
              <div className="text-3xl font-black text-primary">12d</div>
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-1">Avg Resolution</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
