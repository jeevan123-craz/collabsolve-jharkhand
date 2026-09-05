'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Briefcase, CheckCircle, MapPin, Bot, Users, Edit, FileText, X, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from '@/lib/mock-firebase';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';
import Link from 'next/link';

const columns = ['Reported', 'Validated', 'Open for Proposals', 'In Progress', 'Resolved'];

export default function Page() {
  const { user } = useApp();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  
  const [reportModal, setReportModal] = useState<{isOpen: boolean, title: string, content: string, isLoading: boolean}>({isOpen: false, title: '', content: '', isLoading: false});

  // AI Clustering State
  const [clusters, setClusters] = useState<any[] | null>(null);
  const [isClustering, setIsClustering] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'clusters'>('kanban');

  const runAiTriage = async () => {
    setIsClustering(true);
    setViewMode('clusters');
    try {
      const res = await fetch('/api/ai/cluster-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenges })
      });
      const data = await res.json();
      setClusters(data.clusters || []);
    } catch (e) {
      console.error(e);
      alert('Failed to run AI triage.');
      setViewMode('kanban');
    }
    setIsClustering(false);
  };

  const generateProgressReport = async () => {
    setReportModal({ isOpen: true, title: 'AI Status Digest & Progress Report', content: '', isLoading: true });
    try {
      const res = await fetch('/api/ai/admin-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'progress_report', data: { challenges, proposals } })
      });
      const data = await res.json();
      setReportModal({ isOpen: true, title: 'AI Status Digest & Progress Report', content: data.report || 'Error generating report.', isLoading: false });
    } catch (e) {
      setReportModal({ isOpen: true, title: 'Error', content: 'Failed to generate report.', isLoading: false });
    }
  };

  const generateSolutionBrief = async (proposal: any, challenge: any) => {
    setReportModal({ isOpen: true, title: `Executive Solution Brief: ${proposal.teamName}`, content: '', isLoading: true });
    try {
      const res = await fetch('/api/ai/admin-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'solution_brief', data: { proposal, challenge } })
      });
      const data = await res.json();
      setReportModal({ isOpen: true, title: `Executive Solution Brief: ${proposal.teamName}`, content: data.report || 'Error generating brief.', isLoading: false });
    } catch (e) {
      setReportModal({ isOpen: true, title: 'Error', content: 'Failed to generate brief.', isLoading: false });
    }
  };

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      const [{ data: cData }, { data: pData }] = await Promise.all([
        supabase.from('challenges').select('*'),
        supabase.from('proposals').select('*')
      ]);
      if (cData) setChallenges(cData);
      if (pData) setProposals(pData);
    };
    fetchData();

    // Realtime subscriptions
    const channel = supabase.channel('admin_kanban')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, (payload) => {
        setChallenges(prev => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new];
          if (payload.eventType === 'UPDATE') return prev.map(c => c.id === payload.new.id ? payload.new : c);
          if (payload.eventType === 'DELETE') return prev.filter(c => c.id !== payload.old.id);
          return prev;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals' }, (payload) => {
        setProposals(prev => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new];
          if (payload.eventType === 'UPDATE') return prev.map(p => p.id === payload.new.id ? payload.new : p);
          if (payload.eventType === 'DELETE') return prev.filter(p => p.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMsg = chatQuery;
    setChatQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    try {
      const res = await fetch('/api/ai/admin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, challenges, proposals })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Error connecting to Impact Assistant.' }]);
    }
    setIsChatting(false);
  };

  const [isNudging, setIsNudging] = useState<string | null>(null);

  const handleNudge = async (challenge: any) => {
    setIsNudging(challenge.id);
    try {
      const res = await fetch('/api/ai/nudge-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge })
      });
      const data = await res.json();
      if (data.nudgedPartners && data.nudgedPartners.length > 0) {
        alert(`Smart Nudge Sent!\n\nAI determined these partners are the best fit:\n- ${data.nudgedPartners.map((p: any) => p.name).join('\n- ')}`);
      } else {
        alert('No highly relevant partners found for this challenge.');
      }
    } catch (e) {
      console.error(e);
      alert('Error triggering nudge engine.');
    }
    setIsNudging(null);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('challenges').update({ status: newStatus }).eq('id', id);
      const challenge = challenges.find(c => c.id === id);
      if (challenge && challenge.authorId) {
        await supabase.from('notifications').insert({
          userId: challenge.authorId,
          message: `Your challenge "${challenge.title}" status changed to ${newStatus}.`,
          read: false
        });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleProposalAction = async (proposal: any, action: 'Accepted' | 'Rejected') => {
    try {
      await supabase.from('proposals').update({ status: action }).eq('id', proposal.id);
      await supabase.from('notifications').insert({
        userId: proposal.authorId,
        message: `Your proposal for "${proposal.teamName}" has been ${action.toLowerCase()}.`,
        read: false
      });
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action.toLowerCase()} proposal`);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency === 'Critical') return 'bg-[#991B1B]/10 text-[#991B1B]';
    if (urgency === 'High') return 'bg-error-container text-on-error-container';
    if (urgency === 'Medium') return 'bg-warning-amber/10 text-warning-amber';
    return 'bg-surface-variant/50 text-on-surface-variant';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const getTopCategory = () => {
    if (challenges.length === 0) return 'None';
    const counts: Record<string, number> = {};
    challenges.forEach(c => {
      if (c.category) {
        counts[c.category] = (counts[c.category] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'None';
  };

  const exportCSV = () => {
    const headers = ['ID,Title,District,Category,Urgency,Status,Upvotes\n'];
    const rows = challenges.map(c => `"${c.id}","${c.title}","${c.district}","${c.category}","${c.urgency}","${c.status}","${c.upvotes || 0}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collabsolve_challenges_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl flex flex-col min-h-screen gap-md">
      
      {/* Header & Analytics */}
      <motion.section initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-md flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.h1 variants={itemVariants} className="font-headline-lg text-headline-lg text-on-surface">
            Admin Command Center
          </motion.h1>
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <button 
              onClick={generateProgressReport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors font-bold text-sm shadow-sm"
            >
              <FileText className="w-4 h-4" /> Generate AI Digest
            </button>
            <button 
              onClick={exportCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm shadow-sm"
            >
              <ClipboardList className="w-4 h-4" /> Export CSV Data
            </button>
          </motion.div>
        </div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {/* Analytics Card 1 */}
          <div className="bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-surface-variant flex flex-col gap-xs hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-sm">
              <ClipboardList className="w-5 h-5 text-primary" />
              <span>Total Challenges</span>
            </div>
            <div className="font-headline-lg text-4xl font-bold text-on-surface mt-2">{challenges.length}</div>
          </div>
          {/* Analytics Card 2 */}
          <div className="bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-surface-variant flex flex-col gap-xs hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-sm">
              <Briefcase className="w-5 h-5 text-secondary" />
              <span>Open for Proposals</span>
            </div>
            <div className="font-headline-lg text-4xl font-bold text-on-surface mt-2">{challenges.filter(c => c.status === 'Open for Proposals').length}</div>
          </div>
          {/* Analytics Card 3 */}
          <div className="bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-surface-variant flex flex-col gap-xs hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-sm">
              <CheckCircle className="w-5 h-5 text-success-green" />
              <span>Resolved</span>
            </div>
            <div className="font-headline-lg text-4xl font-bold text-success-green mt-2">{challenges.filter(c => c.status === 'Resolved').length}</div>
          </div>
          {/* Analytics Card 4 (Top Category) */}
          <div className="bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-surface-variant flex flex-col gap-xs hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-sm">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>Top Category</span>
            </div>
            <div className="font-headline-sm text-xl font-bold text-orange-700 mt-2 line-clamp-2 leading-tight">
              {getTopCategory()}
            </div>
          </div>
        </motion.div>
      </motion.section>
      
      {/* District Analytics Dashboard */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-variant">
        <h2 className="font-headline-md text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> District-wise Impact
        </h2>
        <div className="flex flex-col gap-3">
          {Object.entries(
            challenges.reduce((acc, c) => {
              acc[c.district] = (acc[c.district] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([district, count]: [string, any]) => (
            <div key={district} className="flex items-center gap-4">
              <span className="w-32 font-medium text-sm truncate">{district}</span>
              <div className="flex-grow bg-surface-variant/30 h-4 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(count as number / Math.max(1, challenges.length)) * 100}%` }}
                  className="bg-primary h-full rounded-full"
                />
              </div>
              <span className="w-8 text-right font-bold text-sm text-primary">{count as number}</span>
            </div>
          ))}
          {challenges.length === 0 && <p className="text-sm text-on-surface-variant">No data available yet.</p>}
        </div>
      </motion.section>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex bg-surface-container-low rounded-lg p-1 border border-surface-variant">
          <button 
            onClick={() => setViewMode('kanban')} 
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Kanban Board
          </button>
          <button 
            onClick={() => setViewMode('clusters')} 
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${viewMode === 'clusters' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            AI Clusters
          </button>
        </div>
        <button 
          onClick={runAiTriage}
          disabled={isClustering}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl font-bold shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {isClustering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />} 
          Run AI Triage
        </button>
      </div>

      {viewMode === 'kanban' ? (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="min-h-[500px] flex gap-md overflow-x-auto custom-scrollbar pb-md">
          {columns.map(col => {
            const colChallenges = challenges.filter(c => (c.status || 'Reported') === col);
            return (
              <div key={col} className="flex-shrink-0 w-80 flex flex-col gap-sm bg-surface-container-low rounded-2xl p-md border border-surface-variant h-full">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                  <h2 className="font-label-md text-sm font-bold text-on-surface uppercase tracking-wider">{col}</h2>
                  <span className="bg-surface-variant/50 text-on-surface-variant rounded-full px-2.5 py-0.5 text-xs font-bold">{colChallenges.length}</span>
                </div>
                <div className="flex flex-col gap-sm overflow-y-auto custom-scrollbar h-full pr-2 pt-2">
                  {colChallenges.map(challenge => (
                    <motion.div key={challenge.id} whileHover={{ y: -2 }} className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-variant flex flex-col gap-xs hover:shadow-md transition-all group relative">
                      <div className="flex justify-between items-start">
                        <span className={`${getUrgencyColor(challenge.urgency || 'Medium')} text-[10px] font-bold px-2 py-1 rounded-md tracking-wider uppercase`}>
                          {challenge.urgency || 'Medium'} URGENCY
                        </span>
                        <select 
                          value={challenge.status || 'Reported'}
                          onChange={(e) => updateStatus(challenge.id, e.target.value)}
                          className="text-xs bg-surface-container-low border border-outline-variant rounded p-1 outline-none font-bold text-primary cursor-pointer hover:bg-surface-variant/30"
                        >
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <Link href={`/challenges/${challenge.id}`}>
                        <h3 className="font-headline-md text-lg leading-tight font-semibold text-on-surface mt-2 hover:text-primary transition-colors cursor-pointer">{challenge.title}</h3>
                      </Link>
                      <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-sm mt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{challenge.district}</span>
                        </div>
                        <button 
                          onClick={() => handleNudge(challenge)}
                          disabled={isNudging === challenge.id}
                          className="bg-secondary/10 text-secondary hover:bg-secondary/20 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                          title="Smart Nudge Industry Partners"
                        >
                          <Bot className="w-3 h-3" />
                          {isNudging === challenge.id ? 'Nudging...' : 'Smart Nudge'}
                        </button>
                      </div>
                      {challenge.aiCategories && challenge.aiCategories.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-outline-variant/30 flex items-center gap-2 bg-primary/5 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                          <Bot className="w-4 h-4 text-primary" />
                          <span className="font-label-sm text-xs font-bold text-primary line-clamp-1" title={challenge.aiCategories.join(', ')}>
                            Matches: {challenge.aiCategories[0]}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.section>
      ) : (
        /* AI Clusters View */
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-[500px] flex flex-col gap-md">
          {!clusters ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded-2xl border border-surface-variant text-center">
              <Bot className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-xl font-bold text-on-surface mb-2">AI Clusters Not Generated</h3>
              <p className="text-on-surface-variant mb-6">Run AI Triage to automatically group similar challenges and assign urgency scores.</p>
              <button 
                onClick={runAiTriage}
                disabled={isClustering}
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isClustering ? <Loader2 className="w-5 h-5 animate-spin" /> : null} Generate Clusters Now
              </button>
            </div>
          ) : clusters.length === 0 ? (
            <div className="p-8 bg-surface-container-lowest rounded-2xl border border-surface-variant text-center font-bold text-on-surface-variant">No clusters returned.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clusters.map((cluster, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-2 h-full ${cluster.urgency === 'Critical' ? 'bg-red-600' : cluster.urgency === 'High' ? 'bg-orange-500' : cluster.urgency === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  
                  <div className="flex justify-between items-start pl-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{cluster.theme}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {cluster.district}</span>
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-700">{cluster.category}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cluster.urgency === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : cluster.urgency === 'High' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700'}`}>
                        {cluster.urgency} URGENCY
                      </span>
                      <span className="text-xs text-gray-500 italic">Sentiment: {cluster.sentiment}</span>
                    </div>
                  </div>
                  
                  <div className="pl-4">
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">{cluster.summary}</p>
                  </div>
                  
                  <div className="pl-4 border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                      <span>Affected Tickets ({cluster.challengeIds?.length || 0})</span>
                      <button className="text-blue-600 text-xs hover:underline">Merge & Escalate</button>
                    </h4>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {(cluster.challengeIds || []).map((id: string) => {
                        const ticket = challenges.find(c => c.id === id);
                        return ticket ? (
                          <div key={id} className="text-sm bg-white border border-gray-200 p-2 rounded-lg flex items-center justify-between">
                            <span className="truncate flex-1 font-medium text-gray-800">{ticket.title}</span>
                            <Link href={`/challenges/${ticket.id}`} className="text-blue-600 ml-2 whitespace-nowrap text-xs hover:underline">View</Link>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      )}
      
      {/* Proposals Section */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex-shrink-0 flex flex-col gap-md">
        <h2 className="font-headline-md text-xl font-bold text-on-surface">Proposals Review</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {proposals.filter(p => p.status === 'Under Review' || p.status === 'Accepted').map(proposal => {
            const challenge = challenges.find(c => c.id === proposal.challengeId);
            return (
              <div key={proposal.id} className="bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-surface-variant flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-sm text-lg font-bold">{proposal.teamName}</h3>
                    <p className="text-sm font-medium text-primary">{proposal.institution}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${proposal.status === 'Accepted' ? 'bg-success-green/10 text-success-green' : 'bg-warning-amber/10 text-warning-amber'}`}>
                    {proposal.status}
                  </span>
                </div>
                {challenge && (
                  <div className="text-xs text-on-surface-variant">
                    <span className="font-bold">Challenge:</span> {challenge.title}
                  </div>
                )}
                <p className="text-sm text-on-surface-variant line-clamp-3">{proposal.approach}</p>
                <div className="flex gap-2 mt-auto pt-2">
                  {proposal.status === 'Under Review' ? (
                    <>
                      <button 
                        onClick={() => handleProposalAction(proposal, 'Accepted')}
                        className="flex-1 bg-success-green/10 text-success-green hover:bg-success-green/20 py-1.5 rounded-lg text-sm font-bold transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleProposalAction(proposal, 'Rejected')}
                        className="flex-1 bg-error-container text-on-error-container hover:bg-error-container/80 py-1.5 rounded-lg text-sm font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => generateSolutionBrief(proposal, challenge)}
                      className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> AI Solution Brief
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {proposals.filter(p => p.status === 'Under Review' || p.status === 'Accepted').length === 0 && (
            <div className="col-span-full p-4 text-center text-sm text-on-surface-variant bg-surface-container-low rounded-xl border border-surface-variant">
              No active proposals to review.
            </div>
          )}
        </div>
      </motion.section>

      {/* Floating Impact Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-surface-container-lowest w-[380px] rounded-2xl shadow-xl border border-surface-variant flex flex-col overflow-hidden mb-4"
            >
              <div className="bg-primary p-4 flex justify-between items-center text-on-primary">
                <div className="flex items-center gap-2 font-headline-md font-bold text-lg">
                  <Bot className="w-6 h-6" /> Impact Assistant
                </div>
                <button onClick={() => setChatOpen(false)} className="hover:bg-on-primary/20 p-1 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              
              <div className="flex-1 h-80 overflow-y-auto p-4 flex flex-col gap-3 bg-surface">
                {chatHistory.length === 0 && (
                  <p className="text-on-surface-variant text-sm text-center my-auto px-4">
                    Ask me about the impact metrics, e.g., "How many water-related challenges are there?"
                  </p>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-on-primary self-end rounded-br-sm' : 'bg-surface-container text-on-surface self-start rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                ))}
                {isChatting && (
                  <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-surface-container text-on-surface self-start rounded-bl-sm flex gap-1">
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-150"></div>
                  </div>
                )}
              </div>

              <form onSubmit={handleChat} className="p-3 border-t border-surface-variant bg-surface-container-low flex gap-2">
                <input 
                  type="text" 
                  value={chatQuery} 
                  onChange={e => setChatQuery(e.target.value)}
                  placeholder="Ask about impact..."
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2 text-sm outline-none focus:border-primary"
                />
                <button disabled={isChatting || !chatQuery} type="submit" className="bg-primary text-on-primary w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative"
          >
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 bg-error-red w-4 h-4 rounded-full border-2 border-surface"></span>
          </button>
        )}
      </div>


      {/* Report Modal */}
      <AnimatePresence>
        {reportModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  {reportModal.title}
                </h3>
                <button onClick={() => setReportModal(prev => ({...prev, isOpen: false}))} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {reportModal.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-blue-600 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p className="font-medium text-gray-600">Gemini AI is generating your report...</p>
                  </div>
                ) : (
                  <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap font-medium">
                    {reportModal.content}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button 
                  onClick={() => setReportModal(prev => ({...prev, isOpen: false}))}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
