'use client';
import Link from 'next/link';
import { Challenge } from '@/lib/data';
import StatusBadge from './StatusBadge';
import { ThumbsUp, MessageSquare, MapPin, AlertTriangle, ArrowUpRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from '@/lib/mock-firebase';
import { motion } from 'motion/react';

const urgencyColors: Record<string, string> = {
  'Low': 'bg-success-green/10 text-success-green border-success-green/20',
  'Medium': 'bg-warning-amber/10 text-warning-amber border-warning-amber/20',
  'High': 'bg-error/10 text-error border-error/20',
  'Critical': 'bg-[#991B1B]/10 text-[#991B1B] border-[#991B1B]/20',
};

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(challenge.upvotes || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const upvoted = localStorage.getItem(`upvoted_${challenge.id}`);
    if (upvoted) setHasUpvoted(true);
  }, [challenge.id]);

  useEffect(() => {
    if (challenge.upvotes !== undefined && !hasUpvoted) {
      setUpvotes(challenge.upvotes);
    }
  }, [challenge.upvotes, hasUpvoted]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUpvoted || isUpdating) return;
    setIsUpdating(true);
    
    const previousUpvotes = upvotes;
    try {
      const newUpvotes = previousUpvotes + 1;
      setUpvotes(newUpvotes);
      setHasUpvoted(true);
      localStorage.setItem(`upvoted_${challenge.id}`, 'true');
      
      const docRef = doc(db, 'challenges', challenge.id);
      await updateDoc(docRef, { upvotes: newUpvotes });
    } catch (error) {
      console.error("Failed to upvote", error);
      setUpvotes(previousUpvotes);
      setHasUpvoted(false);
      localStorage.removeItem(`upvoted_${challenge.id}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant hover:shadow-lg hover:border-primary/20 transition-all duration-300 group flex flex-col h-full overflow-hidden"
    >
      {/* AI badge strip */}
      {challenge.aiCategories && challenge.aiCategories.length > 0 && (
        <div className="bg-gradient-to-r from-secondary/5 to-primary/5 px-5 py-1.5 border-b border-surface-variant flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-secondary" />
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">AI Categorized</span>
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3 gap-2">
          <StatusBadge status={challenge.status} />
          <span className={`inline-flex items-center font-label-sm text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${urgencyColors[challenge.urgency] || urgencyColors['Medium']}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />{challenge.urgency}
          </span>
        </div>
        
        <h3 className="font-headline-md text-lg font-bold text-on-surface line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
          {challenge.title}
        </h3>
        <p className="font-body-md text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1 leading-relaxed">
          {challenge.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
          <span className="inline-flex items-center text-[11px] font-bold text-primary bg-primary/8 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            {challenge.category}
          </span>
          <span className="inline-flex items-center text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-lg">
            <MapPin className="w-3 h-3 mr-1" />{challenge.district}
          </span>
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-surface-variant bg-surface-container-low/30 flex items-center justify-between rounded-b-2xl mt-auto">
        <div className="flex items-center gap-4 font-label-md text-sm text-on-surface-variant">
          <button 
            onClick={handleUpvote}
            disabled={isUpdating || hasUpvoted}
            className={`flex items-center gap-1.5 transition-all duration-200 rounded-lg px-2 py-1 -ml-2 ${hasUpvoted ? 'text-primary bg-primary/10' : 'hover:text-primary hover:bg-primary/5'}`}
            title={hasUpvoted ? 'Already upvoted' : 'Upvote'}
          >
            <ThumbsUp className={`w-4 h-4 transition-transform ${hasUpvoted ? 'fill-primary scale-110' : ''}`} />{upvotes}
          </button>
          <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" />{challenge.comments || 0}</span>
        </div>
        <Link href={`/challenges/${challenge.id}`} className="font-label-md text-sm font-bold text-primary hover:text-secondary transition-colors flex items-center gap-1 group/link">
          Details <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
