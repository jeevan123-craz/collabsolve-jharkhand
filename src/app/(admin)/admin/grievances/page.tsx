'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Search, Filter, Eye, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from '@/lib/mock-firebase';
import { Challenge } from '@/lib/data';
import Link from 'next/link';

export default function AdminGrievancesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'challenges'));
    const unsub = onSnapshot(q, (snap: any) => {
      setChallenges(snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Challenge)));
    });
    return () => unsub();
  }, []);

  const filtered = challenges.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-3xl font-bold text-on-surface flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-warning-amber" /> Grievances & Challenges
          </h1>
          <p className="text-on-surface-variant">Comprehensive list of all citizen reports.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-variant flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search grievances by title or district..." 
              className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2 outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-variant/30 text-on-surface-variant">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/20 text-on-surface-variant font-label-md uppercase tracking-wider text-sm">
                <th className="p-4 border-b border-surface-variant">Title</th>
                <th className="p-4 border-b border-surface-variant">District</th>
                <th className="p-4 border-b border-surface-variant">Urgency</th>
                <th className="p-4 border-b border-surface-variant">Status</th>
                <th className="p-4 border-b border-surface-variant">Upvotes</th>
                <th className="p-4 border-b border-surface-variant w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((challenge, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={challenge.id} 
                  className="border-b border-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <td className="p-4 font-bold max-w-xs truncate" title={challenge.title}>{challenge.title}</td>
                  <td className="p-4 text-on-surface-variant text-sm">{challenge.district}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      challenge.urgency === 'High' ? 'bg-error/10 text-error' :
                      challenge.urgency === 'Medium' ? 'bg-warning-amber/10 text-warning-amber' :
                      'bg-success-green/10 text-success-green'
                    }`}>
                      {challenge.urgency}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{challenge.status}</td>
                  <td className="p-4 text-sm font-bold text-primary">{challenge.upvotes || 0}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/challenges/${challenge.id}`} className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-variant/50">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-error/10">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant">
              No grievances found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
