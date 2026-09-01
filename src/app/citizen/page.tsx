'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, AlertTriangle, Clock, ThumbsUp, Send, Loader2, Sparkles, Bot } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from '@/lib/mock-firebase';
import { useApp } from '@/lib/AppContext';

export default function Page() {
  const { user, login } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiSkills, setAiSkills] = useState<string[]>([]);
  const [aiInstitutions, setAiInstitutions] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [trending, setTrending] = useState<any[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    // Simulate GPS detection
    setTimeout(() => {
      setDistrict('Ranchi');
      setIsDetectingLocation(false);
    }, 1200);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice dictation.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Can be changed for Hindi 'hi-IN'
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'challenges'), orderBy('upvotes', 'desc'), limit(3));
    const unsub = onSnapshot(q, snap => {
      setTrending(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleSuggestCategories = async () => {
    if (!title || !description) return;
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/ai/suggest-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const data = await res.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
        if (data.suggestions.length > 0 && !category) {
          setCategory(data.suggestions[0]);
        }
      }
      if (data.skills) setAiSkills(data.skills);
      if (data.institutions) setAiInstitutions(data.institutions);
    } catch (e) {
      console.error(e);
    }
    setIsSuggesting(false);
  };

  const handleImproveDescription = async () => {
    if (!description) return;
    setIsImproving(true);
    try {
      const res = await fetch('/api/ai/improve-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const data = await res.json();
      if (data.improvedDescription) {
        setDescription(data.improvedDescription);
      }
    } catch (e) {
      console.error(e);
    }
    setIsImproving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first to submit a challenge.");
      login();
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Fetch recent challenges for duplicate check
      const { getDocs, query, collection, orderBy, limit } = await import('@/lib/mock-firebase');
      const recentQ = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'), limit(15));
      const recentSnap = await getDocs(recentQ);
      const existingChallenges = recentSnap.docs.map(d => ({ id: d.id, title: d.data().title, description: d.data().description }));
      
      // 2. Ask AI if there is a duplicate
      const dupRes = await fetch('/api/ai/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, existingChallenges })
      });
      const dupData = await dupRes.json();
      
      if (dupData.duplicateId) {
        const confirmMsg = `AI detected a highly similar challenge already exists!\nReason: ${dupData.reason}\n\nDo you want to submit anyway?`;
        if (!window.confirm(confirmMsg)) {
          setIsSubmitting(false);
          return;
        }
      }

      // 3. Save to Firestore
      await addDoc(collection(db, 'challenges'), {
        title,
        description,
        category: category || (aiSuggestions[0] || 'General'),
        district,
        urgency,
        status: 'Reported',
        authorId: user.uid,
        createdAt: serverTimestamp(),
        photoBase64,
        upvotes: 0,
        comments: 0,
        aiCategories: aiSuggestions,
        aiSkills: aiSkills,
        aiInstitutions: aiInstitutions
      });
      setSuccess(true);
      setTitle('');
      setDescription('');
      setCategory('');
      setDistrict('');
      setPhotoBase64(null);
      setAiSuggestions([]);
      setAiSkills([]);
      setAiInstitutions([]);
    } catch (error) {
      console.error("Error submitting challenge:", error);
      alert("Failed to submit challenge.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <motion.div 
        className="flex flex-col md:flex-row gap-lg"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Side (60%): Report a Challenge Form */}
        <motion.section variants={itemVariants} className="w-full md:w-3/5 flex flex-col gap-md">
          <div className="mb-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Report a Challenge</h1>
            <p className="text-on-surface-variant text-body-lg">Submit detailed information about local issues to mobilize community solvers and state resources.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-md rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant flex flex-col gap-md relative overflow-hidden">
            {success && (
              <div className="absolute inset-0 bg-surface-container-lowest/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-success-green/20 rounded-full flex items-center justify-center mb-4">
                  <ThumbsUp className="w-8 h-8 text-success-green" />
                </div>
                <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-2">Challenge Submitted!</h3>
                <p className="text-on-surface-variant mb-6">Your challenge has been successfully reported and is now visible to researchers and innovators.</p>
                <button type="button" onClick={() => setSuccess(false)} className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold">
                  Submit Another
                </button>
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-primary/5 border border-primary/20 rounded-xl p-md mt-sm">
                <p className="font-label-md text-sm font-bold text-primary mb-xs flex items-center gap-1.5"><Bot className="w-4 h-4" /> AI Analysis Complete</p>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-on-surface-variant my-auto">Categories:</span>
                      {aiSuggestions.map(s => (
                        <span key={s} className="bg-white text-primary border border-primary/20 px-3 py-1 rounded-full font-label-sm text-xs shadow-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                    {aiSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-on-surface-variant my-auto">Needed Skills:</span>
                          {aiSkills.map(s => (
                            <span key={s} className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full font-label-sm text-xs shadow-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                    )}
                    {aiInstitutions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-on-surface-variant my-auto">Matched Solvers:</span>
                          {aiInstitutions.map(s => (
                            <span key={s} className="bg-tertiary/10 text-tertiary border border-tertiary/20 px-3 py-1 rounded-full font-label-sm text-xs shadow-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                    )}
                </div>
              </motion.div>
            )}

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="title">Title <span className="text-error">*</span></label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-outline bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full outline-none" id="title" placeholder="Brief, descriptive title of the issue" type="text" />
            </div>
            
            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="description">Description <span className="text-error">*</span></label>
                <div className="flex gap-4">
                  <button type="button" onClick={startVoiceDictation} className={`text-xs font-bold flex items-center gap-1 hover:underline ${isRecording ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-sm">{isRecording ? 'mic' : 'mic_none'}</span>
                    {isRecording ? 'Listening...' : 'Dictate'}
                  </button>
                  <button type="button" onClick={handleImproveDescription} disabled={isImproving || !description} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50">
                    {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Improve with AI
                  </button>
                </div>
              </div>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-outline bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full resize-y outline-none" id="description" placeholder="Provide detailed context, current impact, and location specifics..." rows={5}></textarea>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="photoUpload" className="cursor-pointer text-xs font-bold text-primary flex items-center gap-1 hover:underline border border-primary/20 px-3 py-1.5 rounded-full bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                    {photoBase64 ? 'Change Photo' : 'Attach Photo'}
                  </label>
                  <input id="photoUpload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {photoBase64 && <span className="text-xs text-green-600 font-medium">Photo attached!</span>}
                </div>
                <button type="button" onClick={handleSuggestCategories} disabled={isSuggesting || !title || !description} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50">
                  {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Auto-suggest Category
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="category">Category <span className="text-error">*</span></label>
                <div className="relative">
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="appearance-none px-4 py-3 border border-outline-variant rounded-xl text-body-md text-on-surface bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full pr-10 outline-none" id="category">
                    <option disabled value="">Select Category</option>
                    {aiSuggestions.length > 0 && (
                      <optgroup label="AI Suggestions">
                        {aiSuggestions.map(s => <option key={s} value={s}>{s}</option>)}
                      </optgroup>
                    )}
                    <optgroup label="All Categories">
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Agriculture">Agriculture & Farming</option>
                      <option value="Water Management">Water & Sanitation</option>
                      <option value="Environment">Environment</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Public Service">Public Service</option>
                      <option value="Tribal Welfare">Tribal Welfare</option>
                    </optgroup>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="district">District <span className="text-error">*</span></label>
                  <button type="button" onClick={handleDetectLocation} disabled={isDetectingLocation} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50">
                    {isDetectingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    Detect Location
                  </button>
                </div>
                <div className="relative">
                  <select required value={district} onChange={e => setDistrict(e.target.value)} className="appearance-none px-4 py-3 border border-outline-variant rounded-xl text-body-md text-on-surface bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full pr-10 outline-none" id="district">
                    <option disabled value="">Select District</option>
                    <option value="Ranchi">Ranchi</option>
                    <option value="Chatra">Chatra</option>
                    <option value="Bokaro">Bokaro</option>
                    <option value="Dhanbad">Dhanbad</option>
                    <option value="Hazaribagh">Hazaribagh</option>
                    <option value="Simdega">Simdega</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="urgency">Urgency</label>
              <div className="relative">
                  <select value={urgency} onChange={e => setUrgency(e.target.value)} className="appearance-none px-4 py-3 border border-outline-variant rounded-xl text-body-md text-on-surface bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full pr-10 outline-none" id="urgency">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
            
            <div className="mt-sm flex justify-end">
              <button disabled={isSubmitting} type="submit" className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
              </button>
            </div>
          </form>
        </motion.section>

        {/* Right Side (40%): Trending Local Challenges Feed */}
        <motion.aside variants={itemVariants} className="w-full md:w-2/5 flex flex-col gap-md h-auto md:h-[calc(100vh-120px)] mt-8 md:mt-0">
          <div className="flex justify-between items-center mb-xs">
            <h2 className="font-headline-md text-headline-md text-on-surface">Trending Locally</h2>
            <Link href="/challenges" className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full transition-colors hover:bg-primary/20">
              View Map <MapPin className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Feed Container */}
          <div className="flex flex-col gap-sm overflow-y-auto custom-scrollbar pr-2 pb-sm">
            {trending.length === 0 ? (
              <div className="flex flex-col gap-4">
                <div className="text-on-surface-variant text-sm flex h-32 items-center justify-center border border-dashed border-outline-variant rounded-2xl">
                  No trending challenges yet.
                </div>
                <button 
                  onClick={async () => {
                    const { addDoc, collection, serverTimestamp } = await import('@/lib/mock-firebase');
                    const { db } = await import('@/lib/firebase');
                    await addDoc(collection(db, 'challenges'), { title: 'Potholes causing accidents near Main Road', description: 'Deep potholes have formed after the recent rains, leading to multiple two-wheeler accidents.', category: 'Infrastructure', district: 'Ranchi', urgency: 'High', status: 'Reported', authorId: 'dev-user', createdAt: serverTimestamp(), upvotes: 12, comments: 3 });
                    await addDoc(collection(db, 'challenges'), { title: 'Drinking water shortage in Village Sector', description: 'The local borewell has dried up, leaving 50+ families without drinking water.', category: 'Water Management', district: 'Chatra', urgency: 'Critical', status: 'In Progress', authorId: 'dev-user', createdAt: serverTimestamp(), upvotes: 45, comments: 12 });
                    await addDoc(collection(db, 'challenges'), { title: 'Lack of medical supplies in rural clinic', description: 'Primary health center is out of basic paracetamol and first aid kits.', category: 'Healthcare', district: 'Simdega', urgency: 'Critical', status: 'Reported', authorId: 'dev-user', createdAt: serverTimestamp(), upvotes: 28, comments: 5 });
                  }}
                  className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  [DEV] Seed Mock Data
                </button>
              </div>
            ) : (
              trending.map((tChallenge, idx) => (
                <Link key={tChallenge.id} href={`/challenges/${tChallenge.id}`}>
                  <motion.div whileHover={{ y: -2 }} className="bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-surface-variant hover:shadow-md transition-all group cursor-pointer h-full flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md ${tChallenge.urgency === 'Critical' ? 'bg-[#991B1B]/10 text-[#991B1B]' : tChallenge.urgency === 'High' ? 'bg-error-container text-on-error-container' : tChallenge.urgency === 'Medium' ? 'bg-warning-amber/10 text-warning-amber' : 'bg-surface-variant/50 text-on-surface-variant'} font-label-sm text-xs font-bold gap-1 uppercase tracking-wider`}>
                        <AlertTriangle className="w-3.5 h-3.5" /> {tChallenge.urgency || 'Medium'} Priority
                      </span>
                      <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 bg-surface-variant/50 px-2.5 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5" /> {tChallenge.district || 'Jharkhand'}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-xl leading-tight font-semibold text-on-surface mb-2 group-hover:text-primary transition-colors">{tChallenge.title}</h3>
                    <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 leading-relaxed flex-1">{tChallenge.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-surface-variant/50 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-surface hover:bg-primary-container hover:text-on-primary-container transition-colors text-on-surface-variant">
                          <ThumbsUp className="w-4 h-4" />
                        </div>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">{tChallenge.upvotes || 0}</span>
                      </div>
                      <span className="text-xs text-outline font-bold uppercase tracking-wider">{tChallenge.category || 'General'}</span>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </motion.aside>
      </motion.div>
    </div>
  );
}
