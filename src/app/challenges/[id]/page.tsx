'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp } from '@/lib/mock-firebase';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { MapPin, ThumbsUp, MessageSquare, AlertTriangle, ArrowRight, X, Loader2, FileText, Github } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export default function ChallengeDetails() {
  const params = useParams();
  const { user, login } = useApp();
  const [challenge, setChallenge] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDoc, setViewDoc] = useState<{base64: string, name: string} | null>(null);
  
  // Form State
  const [teamName, setTeamName] = useState('');
  const [institution, setInstitution] = useState('');
  const [approach, setApproach] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budgetRequest, setBudgetRequest] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (!params.id) return;
    
    const fetchChallenge = async () => {
      const docRef = doc(db, 'challenges', params.id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChallenge({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };

    fetchChallenge();

    const q = query(collection(db, 'proposals'), where('challengeId', '==', params.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProposals(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [params.id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a proposal.");
      login();
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Get AI Score
      const res = await fetch('/api/ai/score-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          approach, 
          timeline, 
          budgetRequest, 
          challengeDescription: challenge.description 
        })
      });
      const scoreData = await res.json();
      const impactScore = scoreData.impactScore || 50;

      // 2. Save to Firestore
      await addDoc(collection(db, 'proposals'), {
        challengeId: challenge.id,
        teamName,
        institution,
        approach,
        timeline,
        budgetRequest,
        authorId: user.uid,
        status: 'Under Review',
        impactScore,
        aiReasoning: scoreData.reasoning || '',
        createdAt: serverTimestamp(),
        githubLink,
        documentBase64: fileBase64,
        documentName: fileName
      });
      setShowProposalForm(false);
      setTeamName('');
      setInstitution('');
      setApproach('');
      setTimeline('');
      setBudgetRequest('');
      setGithubLink('');
      setFileBase64(null);
      setFileName('');
    } catch (err) {
      console.error(err);
      alert("Failed to submit proposal");
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!challenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-2xl font-bold text-on-surface">Challenge not found</h1>
        <Link href="/challenges" className="text-primary mt-4 inline-block">← Back to all challenges</Link>
      </div>
    );
  }

  const urgencyColors: Record<string, string> = {
    'Low': 'text-on-surface-variant',
    'Medium': 'text-warning-amber',
    'High': 'text-error',
    'Critical': 'text-[#991B1B]',
  };

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <Link href="/challenges" className="font-label-md text-sm font-bold text-primary hover:text-secondary mb-6 inline-flex items-center gap-1 transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Challenges
      </Link>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={challenge.status || 'Reported'} />
              <span className={`text-sm font-bold tracking-wider uppercase flex items-center gap-1 ${urgencyColors[challenge.urgency || 'Medium']}`}>
                <AlertTriangle className="w-4 h-4" /> {challenge.urgency || 'Medium'}
              </span>
            </div>
            <h1 className="font-headline-lg text-3xl font-bold text-on-surface mb-3">{challenge.title}</h1>
            <div className="flex items-center gap-4 text-sm text-on-surface-variant font-label-md">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{challenge.district}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{challenge.upvotes || 0}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{challenge.comments || 0}</span>
            </div>
          </div>
        </div>
        <p className="text-body-lg text-on-surface-variant mt-6 whitespace-pre-wrap">{challenge.description}</p>
        
        {challenge.photoBase64 && (
          <div className="mt-6 border border-surface-variant rounded-xl overflow-hidden max-w-xl">
            <img src={challenge.photoBase64} alt="Challenge Attachment" className="w-full h-auto max-h-[400px] object-cover" />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface-container-low rounded-xl border border-surface-variant">
          <div>
            <h3 className="font-label-md text-sm font-bold text-on-surface uppercase tracking-wider mb-3">Category</h3>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-md">{challenge.category}</span>
          </div>
          {challenge.aiCategories && challenge.aiCategories.length > 0 && (
            <div>
              <h3 className="font-label-md text-sm font-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-1">✨ AI-Matched Departments</h3>
              <div className="flex flex-wrap gap-2">
                {challenge.aiCategories.map((d: string) => (
                  <span key={d} className="text-sm font-medium text-secondary bg-secondary/10 px-3 py-1.5 rounded-md">{d}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proposals Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline-md text-2xl font-bold text-on-surface">Proposals ({proposals.length})</h2>
        <button onClick={() => setShowProposalForm(true)} className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md font-bold hover:opacity-90 transition-opacity shadow-sm">
          Submit Proposal
        </button>
      </div>

      {showProposalForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowProposalForm(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-error">
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-6">Submit Your Proposal</h2>
            <form onSubmit={handleSubmitProposal} className="flex flex-col gap-4">
              <div>
                <label className="font-label-md text-sm font-bold text-on-surface mb-1 block">Team / Organization Name</label>
                <input required value={teamName} onChange={e => setTeamName(e.target.value)} type="text" className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none focus:border-primary" />
              </div>
              <div>
                <label className="font-label-md text-sm font-bold text-on-surface mb-1 block">Institution / Company</label>
                <input required value={institution} onChange={e => setInstitution(e.target.value)} type="text" className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none focus:border-primary" />
              </div>
              <div>
                <label className="font-label-md text-sm font-bold text-on-surface mb-1 block">Solution Approach</label>
                <textarea required value={approach} onChange={e => setApproach(e.target.value)} rows={4} className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none focus:border-primary resize-y"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-sm font-bold text-on-surface mb-1 block">Estimated Timeline</label>
                  <input required value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 3 months" type="text" className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="font-label-md text-sm font-bold text-on-surface mb-1 block">Budget Request</label>
                  <input required value={budgetRequest} onChange={e => setBudgetRequest(e.target.value)} placeholder="e.g. ₹50,000" type="text" className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="font-label-md text-sm font-bold text-on-surface mb-1 block">GitHub Repository (Optional)</label>
                <input value={githubLink} onChange={e => setGithubLink(e.target.value)} placeholder="https://github.com/your-repo" type="url" className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none focus:border-primary" />
              </div>
              <div>
                <label className="font-label-md text-sm font-bold text-on-surface mb-1 block">Supporting Document (PDF/Excel - Optional)</label>
                <div className="flex items-center gap-3">
                  <label htmlFor="fileUpload" className="cursor-pointer bg-surface-variant text-on-surface-variant px-4 py-2 rounded-xl text-sm font-bold hover:bg-surface-variant/80 transition-colors">
                    Choose File
                  </label>
                  <input id="fileUpload" type="file" accept=".pdf,.xls,.xlsx" onChange={handleFileUpload} className="hidden" />
                  <span className="text-sm text-on-surface-variant truncate max-w-[200px]">
                    {fileName || 'No file chosen'}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowProposalForm(false)} className="px-5 py-2.5 font-bold text-on-surface-variant hover:bg-surface-variant/20 rounded-full">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {proposals.length > 0 ? (
        <div className="space-y-4">
          {proposals.map(p => (
            <div key={p.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">{p.teamName}</h3>
                  <p className="text-sm font-medium text-primary">{p.institution}</p>
                </div>
                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  p.status === 'Accepted' ? 'bg-success-green/10 text-success-green' :
                  p.status === 'Rejected' ? 'bg-error-container text-on-error-container' : 'bg-warning-amber/10 text-warning-amber'
                }`}>{p.status}</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-3 line-clamp-3">{p.approach}</p>
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-surface-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <span className="flex items-center gap-1">⏱️ {p.timeline}</span>
                <span className="flex items-center gap-1">💰 {p.budgetRequest}</span>
              </div>
              {(p.githubLink || p.documentBase64) && (
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-surface-variant">
                  {p.githubLink && (
                    <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors">
                      <Github className="w-3.5 h-3.5" /> View Repository
                    </a>
                  )}
                  {p.documentBase64 && (
                    p.documentName?.toLowerCase().endsWith('.pdf') ? (
                      <button onClick={() => setViewDoc({ base64: p.documentBase64, name: p.documentName })} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors">
                        <FileText className="w-3.5 h-3.5" /> View {p.documentName || 'Document'}
                      </button>
                    ) : (
                      <a href={p.documentBase64} download={p.documentName || 'Attachment'} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Download {p.documentName || 'Document'}
                      </a>
                    )
                  )}
                </div>
              )}
              {p.status === 'Accepted' && (
                <Link href={`/project/${p.challengeId}`} className="mt-4 inline-flex items-center text-sm font-bold text-primary hover:text-secondary transition-colors">
                  View Project Workspace <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-surface-variant">
          <p className="text-5xl mb-4 opacity-50">💡</p>
          <p className="font-headline-md text-xl font-bold text-on-surface mb-2">No proposals yet</p>
          <p className="text-on-surface-variant">Be the first to submit a solution!</p>
        </div>
      )}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-surface-container-lowest rounded-2xl flex flex-col h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-surface-variant">
              <h2 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> {viewDoc.name}
              </h2>
              <button onClick={() => setViewDoc(null)} className="text-on-surface-variant hover:text-error bg-surface-variant/20 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full bg-gray-100 dark:bg-gray-900">
              <iframe src={viewDoc.base64} className="w-full h-full border-none" title="Document Viewer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
