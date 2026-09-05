'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from '@/lib/mock-firebase';
import { Challenge } from '@/lib/data';
import Link from 'next/link';
import { MapPin, Trophy, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function ImpactPage() {
  const [resolvedChallenges, setResolvedChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    // Only fetch Resolved challenges
    const q = query(collection(db, 'challenges'), where('status', '==', 'Resolved'));
    const unsub = onSnapshot(q, (snap: any) => {
      setResolvedChallenges(snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Challenge)));
    });
    return () => unsub();
  }, []);

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-headline-lg text-5xl font-black text-on-surface mb-4">Jharkhand Impact Dashboard</h1>
        <p className="text-on-surface-variant text-xl max-w-2xl mx-auto">
          See the real-world outcomes of citizen reporting, academic research, and industry funding coming together to solve local problems.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-success-green/10 p-6 rounded-2xl border border-success-green/20 text-center">
          <CheckCircle className="w-10 h-10 text-success-green mx-auto mb-2" />
          <div className="text-4xl font-black text-success-green">{resolvedChallenges.length}</div>
          <div className="text-on-surface-variant font-bold uppercase tracking-widest text-sm mt-1">Challenges Resolved</div>
        </div>
        <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 text-center">
          <Users className="w-10 h-10 text-primary mx-auto mb-2" />
          <div className="text-4xl font-black text-primary">{resolvedChallenges.length * 3}</div>
          <div className="text-on-surface-variant font-bold uppercase tracking-widest text-sm mt-1">Communities Impacted</div>
        </div>
        <div className="bg-warning-amber/10 p-6 rounded-2xl border border-warning-amber/20 text-center">
          <Trophy className="w-10 h-10 text-warning-amber mx-auto mb-2" />
          <div className="text-4xl font-black text-warning-amber">₹{resolvedChallenges.length * 1.5} Cr</div>
          <div className="text-on-surface-variant font-bold uppercase tracking-widest text-sm mt-1">Industry Funding Deployed</div>
        </div>
      </div>

      <h2 className="font-headline-md text-2xl font-bold mb-6">Success Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resolvedChallenges.map(challenge => (
          <motion.div key={challenge.id} whileHover={{ y: -4 }} className="bg-surface-container-lowest border border-surface-variant rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {challenge.photoBase64 ? (
              <img src={challenge.photoBase64} alt={challenge.title} className="w-full h-48 object-cover grayscale-[20%]" />
            ) : (
              <div className="w-full h-48 bg-surface-variant/30 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-outline" />
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-primary text-sm font-bold mb-2">
                <MapPin className="w-4 h-4" /> {challenge.district}
              </div>
              <h3 className="font-headline-md text-xl font-bold mb-3 line-clamp-2">{challenge.title}</h3>
              <p className="text-on-surface-variant text-sm line-clamp-3 mb-4 flex-grow">{challenge.description}</p>
              
              <Link href={`/project/${challenge.id}`} className="mt-auto flex items-center gap-2 text-primary font-bold hover:underline">
                View Resolution Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
        
        {resolvedChallenges.length === 0 && (
          <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-variant border-dashed">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No challenges have been resolved yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
