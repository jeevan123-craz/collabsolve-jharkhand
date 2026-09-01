'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from '@/lib/mock-firebase';
import ChallengeCard from '@/components/ChallengeCard';
import { Search, Loader2 } from 'lucide-react';
import { Category } from '@/lib/data';

const categories: Category[] = ['Education', 'Healthcare', 'Agriculture', 'Water Management', 'Environment', 'Public Service', 'Mining Safety', 'Tribal Welfare', 'Infrastructure'];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChallenges(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = challenges.filter(c =>
    (!filterCat || c.category === filterCat) &&
    (!filterStatus || c.status === filterStatus) &&
    (!search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
  );

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
            🌍 All Challenges
          </h1>
          <p className="text-on-surface-variant text-body-lg">Browse and filter civic challenges reported across Jharkhand.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mb-8 bg-surface-container-low p-4 rounded-2xl border border-surface-variant">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search challenges by keyword..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-48">
              <select 
                value={filterCat} 
                onChange={(e) => setFilterCat(e.target.value)} 
                className="w-full appearance-none px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pr-10"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
            
            <div className="relative w-full sm:w-48">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="w-full appearance-none px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pr-10"
              >
                <option value="">All Status</option>
                <option value="Reported">Reported</option>
                <option value="Validated">Validated</option>
                <option value="Open for Proposals">Open for Proposals</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <motion.p variants={itemVariants} className="font-label-md text-sm text-on-surface-variant mb-6">{filtered.length} challenges found</motion.p>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {filtered.map(c => (
                <motion.div key={c.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
                  <ChallengeCard challenge={c as any} />
                </motion.div>
              ))}
            </motion.div>
            
            {filtered.length === 0 && (
              <motion.div variants={itemVariants} className="text-center py-20 bg-surface-container-low rounded-2xl border border-surface-variant mt-4">
                <p className="text-5xl mb-4 opacity-50">🔍</p>
                <p className="font-headline-md text-xl text-on-surface font-semibold mb-2">No challenges found</p>
                <p className="font-body-md text-on-surface-variant">Try adjusting your filters or search terms.</p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
