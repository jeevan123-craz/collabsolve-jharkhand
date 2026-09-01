'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Briefcase, CheckCircle, MapPin, Bot, Users, Edit } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc } from '@/lib/mock-firebase';
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

  useEffect(() => {
    const unsubC = onSnapshot(query(collection(db, 'challenges')), (snapshot) => {
      setChallenges(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubP = onSnapshot(query(collection(db, 'proposals')), (snapshot) => {
      setProposals(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubC(); unsubP(); };
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
      await updateDoc(doc(db, 'challenges', id), { status: newStatus });
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
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

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl flex flex-col h-[calc(100vh-64px)] overflow-hidden gap-md">
      
      {/* Header & Analytics */}
      <motion.section initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-md flex-shrink-0">
        <motion.h1 variants={itemVariants} className="font-headline-lg text-headline-lg text-on-surface">Admin Kanban Board</motion.h1>
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-md">
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
        </motion.div>
      </motion.section>
      
      {/* Kanban Board */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex-grow flex gap-md overflow-x-auto custom-scrollbar pb-md">
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
    </div>
  );
}
