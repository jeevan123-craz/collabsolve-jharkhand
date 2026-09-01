import Link from 'next/link';
import { Challenge } from '@/lib/data';
import StatusBadge from './StatusBadge';
import { ThumbsUp, MessageSquare, MapPin, AlertTriangle } from 'lucide-react';

const urgencyColors = {
  'Low': 'bg-surface-variant/50 text-on-surface-variant',
  'Medium': 'bg-warning-amber/10 text-warning-amber',
  'High': 'bg-error-container text-on-error-container',
  'Critical': 'bg-[#991B1B] text-white',
};

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant hover:shadow-md transition-all group flex flex-col h-full">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3 gap-2">
          <StatusBadge status={challenge.status} />
          <span className={`inline-flex items-center font-label-sm text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${urgencyColors[challenge.urgency]}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />{challenge.urgency}
          </span>
        </div>
        <h3 className="font-headline-md text-xl font-bold text-on-surface line-clamp-2 mb-2 group-hover:text-primary transition-colors">{challenge.title}</h3>
        <p className="font-body-md text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">{challenge.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          <span className="inline-flex items-center text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
            {challenge.category}
          </span>
          <span className="inline-flex items-center text-xs font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5 mr-1" />{challenge.district}
          </span>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-surface-variant bg-surface-container-low/50 flex items-center justify-between rounded-b-2xl mt-auto">
        <div className="flex items-center gap-4 font-label-md text-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" />{challenge.upvotes}</span>
          <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" />{challenge.comments}</span>
        </div>
        <Link href={`/challenges/${challenge.id}`} className="font-label-md text-sm font-bold text-primary hover:text-secondary transition-colors flex items-center gap-1">
          View Details <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
