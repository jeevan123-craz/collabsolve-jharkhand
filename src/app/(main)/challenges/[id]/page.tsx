'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot } from '@/lib/mock-firebase';
import { useApp } from '@/lib/AppContext';
import { MapPin, MessageSquare, ThumbsUp, AlertTriangle, ArrowRight, Github, FileText, X, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { Challenge, Proposal } from '@/lib/data';

export default function ChallengeDetails() {
  const params = useParams();
  const { user, login } = useApp();
  const [challenge, setChallenge] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDoc, setViewDoc] = useState<{base64: string, name: string} | null>(null);
  
  // AI Proposal Scoring State
  const [isScoring, setIsScoring] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  
  // Form State
  const [teamName, setTeamName] = useState('');
  const [institution, setInstitution] = useState('');
  const [approach, setApproach] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budgetRequest, setBudgetRequest] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  
  // Comment State
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    
    const docRef = doc(db, 'challenges', params.id as string);
    const unsubChallenge = onSnapshot(docRef, (snapshot: any) => {
      if (snapshot.exists && (typeof snapshot.exists === 'function' ? snapshot.exists() : snapshot.exists)) {
        setChallenge({ id: snapshot.id, ...snapshot.data() } as Challenge);
      }
      setLoading(false);
    });

    const q = query(collection(db, 'proposals'), where('challengeId', '==', params.id));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      setProposals(snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Proposal)));
    });

    return () => {
      unsubChallenge();
      unsubscribe();
    };
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

  const handleScoreProposal = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!approach || !timeline || !budgetRequest) {
      alert("Please fill in Approach, Timeline, and Budget to get an AI review.");
      return;
    }
    
    setIsScoring(true);
    setAiScore(null);
    setAiReasoning('');
    
    try {
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
      
      const data = await res.json();
      if (res.ok) {
        setAiScore(data.impactScore);
        setAiReasoning(data.reasoning);
      } else {
        alert(data.error || "Failed to score proposal");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during AI review.");
    } finally {
      setIsScoring(false);
    }
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
        authorId: user.id,
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to comment.");
      login();
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const docRef = doc(db, 'challenges', challenge.id);
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        authorName: user.displayName || 'Anonymous User',
        authorRole: user.role || 'Citizen',
        createdAt: Date.now(),
      };
      
      const updatedCommentsList = [...(challenge.commentsList || []), newComment];
      await updateDoc(docRef, {
        commentsList: updatedCommentsList,
        comments: (challenge.comments || 0) + 1
      });
      setCommentText('');
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    }
    setIsSubmittingComment(false);
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
              <div className="pt-4 border-t border-surface-variant flex flex-col gap-4">
                
                {/* AI Review UI */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2 text-blue-800 font-bold">
                      <BrainCircuit className="w-5 h-5" /> AI Proposal Review
                    </div>
                    <button 
                      onClick={handleScoreProposal}
                      disabled={isScoring}
                      className="bg-white text-blue-700 border border-blue-200 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isScoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Check Quality
                    </button>
                  </div>
                  
                  {aiScore !== null && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 relative z-10">
                      <div className="flex justify-between text-sm mb-1 font-bold text-gray-700">
                        <span>Quality Score</span>
                        <span className={aiScore >= 80 ? 'text-green-600' : aiScore >= 50 ? 'text-yellow-600' : 'text-red-600'}>{aiScore}/100</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2.5 mb-3 border border-blue-100">
                        <div className={`h-2.5 rounded-full ${aiScore >= 80 ? 'bg-green-500' : aiScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${aiScore}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-600 bg-white/60 p-3 rounded-lg border border-white font-medium">
                        {aiReasoning}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setShowProposalForm(false)} className="px-6 py-2.5 rounded-full font-bold text-on-surface hover:bg-surface-variant transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-md">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit Proposal
                  </button>
                </div>
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
      
      {/* Comments Section */}
      <div className="mt-12">
        <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" /> Comments ({challenge.comments || 0})
        </h2>
        
        <form onSubmit={handleAddComment} className="mb-8 bg-surface-container-low p-4 rounded-2xl border border-surface-variant flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
            {user ? user.displayName?.charAt(0) || 'U' : '?'}
          </div>
          <div className="flex-1">
            <textarea 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={user ? "Add a comment..." : "Login to comment..."}
              className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant outline-none focus:border-primary resize-y min-h-[80px]"
              disabled={isSubmittingComment}
            />
            <div className="mt-3 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmittingComment || !commentText.trim()}
                className="bg-primary text-on-primary px-5 py-2 rounded-full font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
              >
                {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Post Comment
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {(challenge.commentsList || []).map((c: any) => (
            <div key={c.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant flex gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold shrink-0">
                {c.authorName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h4 className="font-bold text-on-surface">{c.authorName}</h4>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{c.authorRole}</span>
                  <span className="text-xs text-on-surface-variant ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-on-surface-variant">{c.text}</p>
              </div>
            </div>
          ))}
          {(!challenge.commentsList || challenge.commentsList.length === 0) && (
            <div className="text-center py-8 text-on-surface-variant">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </div>

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
