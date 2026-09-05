'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, CheckCircle, Clock, AlertTriangle, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from '@/lib/mock-firebase';
import Link from 'next/link';

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const docRef = doc(db, 'challenges', trackingId.trim());
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setResult({ id: snap.id, ...snap.data() });
      } else {
        setError('No challenge found with this Tracking ID. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to look up challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['Reported', 'Validated', 'Open for Proposals', 'In Progress', 'Resolved'];
  const currentStep = result ? statusSteps.indexOf(result.status) : -1;

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-4xl font-black text-on-surface mb-3">Track Your Challenge</h1>
          <p className="text-on-surface-variant text-lg">
            Enter your Challenge Tracking ID to see real-time status updates.
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              value={trackingId}
              onChange={e => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID (e.g. challenge_1)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-outline-variant bg-surface-container-lowest text-on-surface text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Track
          </button>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-error/10 border border-error/20 text-error rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
            <div className="p-6 border-b border-surface-variant">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tracking ID: {result.id}</p>
                  <h2 className="font-headline-md text-xl font-bold text-on-surface">{result.title}</h2>
                  <p className="text-sm text-on-surface-variant mt-1">{result.district} &middot; {result.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                  result.urgency === 'High' ? 'bg-error/10 text-error' :
                  result.urgency === 'Medium' ? 'bg-warning-amber/10 text-warning-amber' :
                  'bg-success-green/10 text-success-green'
                }`}>
                  {result.urgency} Urgency
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="p-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-4">Resolution Progress</h3>
              <div className="flex items-center justify-between relative">
                {/* Background line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-surface-variant z-0" />
                <div 
                  className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
                  style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }}
                />
                
                {statusSteps.map((step, i) => (
                  <div key={step} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      i < currentStep ? 'bg-primary border-primary' :
                      i === currentStep ? 'bg-primary border-primary ring-4 ring-primary/20' :
                      'bg-surface-container-lowest border-surface-variant'
                    }`}>
                      {i <= currentStep ? (
                        <CheckCircle className="w-4 h-4 text-on-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-on-surface-variant" />
                      )}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 text-center max-w-[80px] ${i <= currentStep ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6">
              <Link href={`/challenges/${result.id}`} className="flex items-center justify-center gap-2 bg-primary/10 text-primary font-bold py-3 rounded-xl hover:bg-primary/20 transition-colors">
                <FileText className="w-4 h-4" /> View Full Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
