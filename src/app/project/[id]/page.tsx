'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from '@/lib/mock-firebase';
import { useParams } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import Link from 'next/link';

export default function Page() {
  const params = useParams();
  const { user } = useApp();
  const [challenge, setChallenge] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: updates.slice(0, 10), // send last 10 updates
          challengeTitle: challenge.title,
          challengeDescription: challenge.description
        })
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (e) {
      console.error(e);
      setSummary('Failed to summarize.');
    }
    setIsSummarizing(false);
  };

  useEffect(() => {
    if (!params.id) return;
    getDoc(doc(db, 'challenges', params.id as string)).then(snap => {
      if (snap.exists()) setChallenge({ id: snap.id, ...snap.data() });
    });

    const q = query(collection(db, 'challenges', params.id as string, 'updates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [params.id]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim() || !user) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'challenges', params.id as string, 'updates'), {
        content: newUpdate,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
      });
      setNewUpdate('');
    } catch (err) {
      console.error(err);
    }
    setIsPosting(false);
  };

  if (!challenge) return <div className="pt-16 p-md">Loading project workspace...</div>;

  const statuses = ['Reported', 'Validated', 'Open for Proposals', 'In Progress', 'Resolved'];
  const currentIndex = statuses.indexOf(challenge.status || 'Reported');

  return (
    <div className="pt-16">
      
      {/* Header Section */}
      <header className="mb-xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-md">{challenge.title}</h1>
        {/* Progress Pipeline */}
        <div className="bg-surface-container-lowest rounded-lg p-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant mt-lg overflow-x-auto">
          <div className="min-w-[700px] flex justify-between items-center relative">
            <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-outline-variant -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-primary -translate-y-1/2 z-0" style={{ right: `${100 - (currentIndex / 4) * 80}%`}}></div>
            
            {statuses.map((status, idx) => (
              <div key={status} className="flex flex-col items-center z-10 w-[20%] relative">
                {idx === currentIndex && <div className="absolute -inset-2 bg-primary-fixed rounded-full animate-pulse opacity-50 z-[-1]"></div>}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-xs ${idx <= currentIndex ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high border-2 border-outline-variant text-outline'} ${idx === currentIndex ? 'ring-4 ring-primary-fixed shadow-md' : ''}`}>
                  <span className="material-symbols-outlined text-sm">{idx < currentIndex ? 'check' : idx === currentIndex ? 'engineering' : 'done_all'}</span>
                </div>
                <span className={`font-label-sm text-label-sm ${idx === currentIndex ? 'text-primary font-bold' : idx < currentIndex ? 'text-on-surface' : 'text-on-surface-variant'}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </header>
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-lg">
          {/* Progress Updates Feed */}
          <section className="bg-surface-container-lowest rounded-lg p-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-headline-md text-headline-md text-on-surface">Updates Feed</h2>
              <div className="flex gap-2">
                <button onClick={handleSummarize} disabled={isSummarizing || updates.length === 0} className="text-secondary hover:text-primary font-label-md text-label-md flex items-center gap-xs bg-secondary/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span> {isSummarizing ? 'Summarizing...' : 'AI Summary'}
                </button>
                <button className="text-primary hover:text-secondary font-label-md text-label-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">filter_list</span> Filter
                </button>
              </div>
            </div>

            {summary && (
              <div className="mb-md p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <h4 className="font-label-md text-sm font-bold text-primary mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">summarize</span> AI Executive Summary
                </h4>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{summary}</p>
              </div>
            )}
            
            <form onSubmit={handlePostUpdate} className="mb-md bg-surface-container-low p-sm rounded-lg flex flex-col gap-sm border border-outline-variant/30">
                <textarea 
                  value={newUpdate}
                  onChange={e => setNewUpdate(e.target.value)}
                  placeholder="Post a project update or milestone..." 
                  className="w-full bg-surface border border-outline-variant rounded p-3 text-body-md outline-none focus:border-primary resize-none"
                  rows={2}
                  required
                />
                <div className="flex justify-end">
                    <button disabled={isPosting} type="submit" className="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                        {isPosting ? 'Posting...' : 'Post Update'}
                    </button>
                </div>
            </form>

            <div className="space-y-md">
              {updates.length === 0 && <p className="text-on-surface-variant text-sm">No updates posted yet.</p>}
              {updates.map(update => (
                <article key={update.id} className="flex gap-sm pb-md border-b border-surface-variant last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md font-bold shrink-0">
                    <span className="material-symbols-outlined text-sm">update</span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-xs mb-xs">
                      <h4 className="font-label-md text-label-md text-on-surface">{update.authorName || 'Project Team'}</h4>
                      <span className="text-xs text-outline font-body-md">
                        {update.createdAt ? new Date(update.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">{update.content}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
        {/* Right Column (30%) */}
        <div className="lg:col-span-4 flex flex-col gap-lg">
{/* Project Team Section */}
<section className="bg-surface-container-lowest rounded-lg p-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant">
<h2 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-xs">
<span className="material-symbols-outlined text-primary">groups</span>
                        Project Team
                    </h2>
<div className="space-y-sm">
{/* Citizen Reporter */}
<div className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-surface-variant cursor-pointer">
<img className="w-12 h-12 rounded-full object-cover bg-surface-variant" data-alt="A candid, warm portrait of a local community member standing outdoors in a bright, sunlit environment. The background shows a modern civic space slightly out of focus. The mood is trustworthy and optimistic. The lighting is natural and flattering." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJn8zPeVnyjtHvIq5SkVpIdqK-u3DtW0v_zsBGo2bqJj0MibX93TVs1GxV_2oTo-h4llfh8VgX3NBloPm70yDEvgs0s6QMIY94Kay46r7brDzuC6MqAdnzt-MyjwV6JhwkvkLcuUOicJpJQKqmpf-me2YAqKLOekTTJD-3Dhyuf6p5MUgV1tTh7RlUUsKhUo08mvozJlCJBbKQKh9FsbAOd-NsRvxdSDGE4yiGvIHfn28Rqs4ITaQA5C-Bc-GzULXUG4WuS63q9BJx"/>
<div className="flex-1">
<h3 className="font-label-md text-label-md text-on-surface">A. Kumar</h3>
<p className="text-xs font-label-sm text-primary uppercase tracking-wider">Citizen Reporter</p>
</div>
<button className="text-outline hover:text-primary transition-colors p-xs">
<span className="material-symbols-outlined text-sm">mail</span>
</button>
</div>
{/* University Team */}
<div className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-surface-variant cursor-pointer">
<div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center text-outline overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A clean, modern logo featuring an abstract representation of water and technology, utilizing sharp geometric shapes. The logo is presented on a stark white background. The colors used are deep primary blue and a subtle cyan accent. The overall look is academic yet highly professional." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYc9V3kH881HhBnldxHIwM0g_cBgaiubxVns9EP4xtuTT7KFFlXaBj2lVIHdphhkIWbEjQoZtdwFgsIpUBW_6uLys67Nve2TJy96wpR467Lb-srVgX2n_vMsxvKIJAfTFenqsy98sH1Lt3ZpJxByJpjQev0q4E8mfMWGotcv81GR-GtDOeFNV3O2nCnloW8hTvafejiXJBFCffr_XyXspE2NkjEFeXkwRuAtD_kN0sCyXEnckhSkv3OQ8Jo-9M5KQp2GEeAGuzbm8l"/>
</div>
<div className="flex-1">
<h3 className="font-label-md text-label-md text-on-surface">AquaTech Innovators</h3>
<p className="text-xs font-label-sm text-secondary uppercase tracking-wider">BIT Mesra Team</p>
</div>
<button className="text-outline hover:text-primary transition-colors p-xs">
<span className="material-symbols-outlined text-sm">open_in_new</span>
</button>
</div>
{/* Industry Sponsor */}
<div className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-surface-variant cursor-pointer">
<div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center text-outline overflow-hidden">
<img className="w-full h-full object-cover p-1 bg-white" data-alt="A crisp, high-resolution rendering of a corporate sponsor logo displayed against a minimal, light-mode background. The logo signifies industrial strength and reliability, utilizing bold, dark typography and a structured icon. The scene is brightly lit to emphasize transparency." src="https://lh3.googleusercontent.com/aida-public/AB6AXuChf4eWpTZTgQjU_0P0lLIz8PJnj1EGnXwKVnAcG8cMGHubPFIva5vodNufc4HO3VIBd4ywDtrGHDt-DyCCfxavgBhYQoHkm7lNyr68Keenc25-DfafHHEBZjnRT5pNn9xgSoceYAUwKFaXODO70jH46Mpad8ooDeTnLOPiA85sKoyG9JVHpj56SvV9baWbfgCRVpdY_a455Qz5VkeevREZXTknzDqn-3oEYExSFM1gPYOcSxTnpc1jzTVH6WwvpipHUK8QW-nxuLau"/>
</div>
<div className="flex-1">
<h3 className="font-label-md text-label-md text-on-surface">Tata Steel</h3>
<p className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">Industry Sponsor</p>
</div>
</div>
</div>
<button className="w-full mt-md py-sm border border-outline-variant text-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed/30 transition-colors">
                        View All Contributors
                    </button>
</section>
{/* Data Summary Widget (Example of Data Viz Layer) */}
<section className="bg-data-viz-bg rounded-lg p-md shadow-lg border border-[#374151]">
<h2 className="font-headline-md text-headline-md text-on-primary mb-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-inverse-primary">analytics</span>
                        Project Metrics
                    </h2>
<div className="grid grid-cols-2 gap-sm mb-md">
<div className="bg-[#374151] rounded p-sm border border-[#4B5563]">
<p className="text-xs text-outline-variant uppercase tracking-wider mb-xs">Sensors Active</p>
<p className="font-display-lg-mobile text-inverse-primary">12<span className="text-sm text-outline-variant font-body-md ml-1">/ 20</span></p>
</div>
<div className="bg-[#374151] rounded p-sm border border-[#4B5563]">
<p className="text-xs text-outline-variant uppercase tracking-wider mb-xs">Data Points</p>
<p className="font-display-lg-mobile text-inverse-primary">4.2k</p>
</div>
</div>
<div className="h-24 w-full bg-[#374151] rounded relative overflow-hidden flex items-end p-2 gap-1 border border-[#4B5563]">
{/* Simulated Chart Bars */}
<div className="w-1/6 bg-secondary-fixed-dim/40 rounded-t h-[30%]"></div>
<div className="w-1/6 bg-secondary-fixed-dim/60 rounded-t h-[50%]"></div>
<div className="w-1/6 bg-secondary-fixed-dim/80 rounded-t h-[40%]"></div>
<div className="w-1/6 bg-inverse-primary rounded-t h-[70%] relative group cursor-pointer hover:bg-primary-fixed transition-colors">
<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-on-surface text-[10px] px-2 py-1 rounded shadow hidden group-hover:block whitespace-nowrap z-20">Peak: 7am</div>
</div>
<div className="w-1/6 bg-secondary-fixed-dim/50 rounded-t h-[45%]"></div>
<div className="w-1/6 bg-secondary-fixed-dim/30 rounded-t h-[20%]"></div>
</div>
</section>
</div>
</div>

    </div>
  );
}
