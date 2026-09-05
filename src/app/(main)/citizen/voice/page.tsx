'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Bot, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from '@/lib/mock-firebase';

export default function VoiceModePage() {
  const router = useRouter();

  const [conversation, setConversation] = useState<{role: 'user' | 'ai'; text: string}[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [started, setStarted] = useState(false);

  const [formState, setFormState] = useState({ title: '', description: '', district: '', category: '' });

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef(conversation);
  const formStateRef = useRef(formState);

  useEffect(() => { conversationRef.current = conversation; }, [conversation]);
  useEffect(() => { formStateRef.current = formState; }, [formState]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  // Use our backend TTS proxy which uses Google Translate's high-quality female Indian voice.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ---- init ---- */
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';
      rec.onresult = (e: any) => { const t = e.results[0][0].transcript; if (t) handleUserSpeech(t); };
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      recognitionRef.current = rec;
    }
    return () => { 
      recognitionRef.current?.abort(); 
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  /* ---- Auto Location via Geolocation + Nominatim ---- */
  const getAutoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode to get District
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          // Extract district from address
          const district = data.address.state_district || data.address.county || data.address.city || data.address.state;
          if (district) {
            setFormState(prev => ({ ...prev, district: district.replace(' District', '') }));
          }
        } catch (e) {
          console.error("Auto location failed", e);
        }
      }, (e) => {
        console.error("Geolocation denied", e);
      });
    }
  };

  /* ---- speak (returns a promise) ---- */
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise(resolve => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`);
      audioRef.current = audio;
      
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      
      audio.play().catch(e => {
        console.error("Audio playback failed", e);
        resolve(); // If audio blocked by browser, just resolve immediately so conversation can proceed
      });
    });
  }, []);

  /* ---- start button ---- */
  const handleStart = async () => {
    setStarted(true);
    getAutoLocation(); // Auto detect location when they start

    const greeting = 'Hello! What challenge have you faced today? Tell me about the issue and I will help you report it.';
    setConversation([{ role: 'ai', text: greeting }]);
    setIsAiSpeaking(true);
    await speak(greeting);
    setIsAiSpeaking(false);
    startListening();
  };

  /* ---- process user speech ---- */
  const handleUserSpeech = async (text: string) => {
    setConversation(prev => [...prev, { role: 'user', text }]);
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai/citizen-assistant-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, currentFormState: formStateRef.current, history: conversationRef.current }),
      });
      const data = await res.json();
      if (data.updated_fields) setFormState(prev => ({ ...prev, ...data.updated_fields }));
      if (data.bot_response) {
        setConversation(prev => [...prev, { role: 'ai', text: data.bot_response }]);
        setIsProcessing(false);
        setIsAiSpeaking(true);
        await speak(data.bot_response);
        setIsAiSpeaking(false);
        if (!data.is_complete) startListening();
      } else { setIsProcessing(false); }
    } catch {
      const err = 'Sorry, I had trouble processing that. Could you repeat?';
      setConversation(prev => [...prev, { role: 'ai', text: err }]);
      setIsProcessing(false);
      setIsAiSpeaking(true);
      await speak(err);
      setIsAiSpeaking(false);
      startListening();
    }
  };

  const startListening = () => { try { window.speechSynthesis.cancel(); recognitionRef.current?.start(); setIsListening(true); } catch {} };
  const stopListening  = () => { recognitionRef.current?.stop(); setIsListening(false); };
  const toggleListening = () => isListening ? stopListening() : startListening();

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'challenges'), { ...formState, urgency: 'Medium', status: 'Reported', authorId: 'voice-user', createdAt: serverTimestamp(), upvotes: 0, comments: 0 });
      const msg = 'Your challenge has been submitted successfully. Thank you!';
      setConversation(prev => [...prev, { role: 'ai', text: msg }]);
      setIsAiSpeaking(true); await speak(msg); setIsAiSpeaking(false);
      setTimeout(() => router.push('/citizen'), 2000);
    } catch (e) { console.error(e); }
  };

  /* ============================ RENDER ============================ */
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: '#fff' }}>

      {/* ---- header ---- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
        <Link href="/citizen" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft style={{ width: 20, height: 20 }} /> Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#2563eb', fontSize: 14 }}>
          <Bot style={{ width: 20, height: 20 }} /> Gemini 2.5 Flash
        </div>
      </div>

      {/* ---- body ---- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT — chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!started ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Bot style={{ width: 40, height: 40, color: '#2563eb' }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0', color: '#111' }}>Voice Assistant</h3>
                <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 15, maxWidth: 320, lineHeight: 1.5 }}>
                  Tap the button below to start. I will ask you about your issue and fill the form automatically.
                </p>
                <button
                  onClick={handleStart}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 999, fontWeight: 700, fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 14px rgba(37,99,235,.35)' }}
                >
                  <Mic style={{ width: 22, height: 22 }} /> Start Conversation
                </button>
              </div>
            ) : (
              <>
                {conversation.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      maxWidth: '82%',
                      padding: '12px 16px',
                      borderRadius: 18,
                      fontSize: 14,
                      lineHeight: 1.55,
                      wordBreak: 'break-word' as const,
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.role === 'user' ? '#2563eb' : '#f3f4f6',
                      color: msg.role === 'user' ? '#fff' : '#1f2937',
                      borderBottomRightRadius: msg.role === 'user' ? 6 : 18,
                      borderBottomLeftRadius: msg.role === 'ai' ? 6 : 18,
                    }}
                  >
                    {msg.text}
                  </motion.div>
                ))}
                {isProcessing && (
                  <div style={{ alignSelf: 'flex-start', background: '#f3f4f6', padding: '12px 18px', borderRadius: 18, borderBottomLeftRadius: 6, display: 'flex', gap: 5 }}>
                    {[0, 1, 2].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af', animation: 'bounce 1s infinite', animationDelay: `${n * 150}ms` }} />)}
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* mic bar */}
          {started && (
            <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {isAiSpeaking && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}>
                  {[12, 20, 16, 24, 14].map((h, i) => <div key={i} style={{ width: 3, height: h, background: '#3b82f6', borderRadius: 3, animation: 'pulse 1s infinite', animationDelay: `${i * 100}ms` }} />)}
                  <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginLeft: 8 }}>Speaking...</span>
                </div>
              )}
              {isListening && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                  <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Listening...</span>
                </div>
              )}
              <button
                onClick={toggleListening}
                disabled={isAiSpeaking || isProcessing}
                style={{
                  width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isListening ? '#ef4444' : '#2563eb', color: '#fff',
                  boxShadow: isListening ? '0 0 20px rgba(239,68,68,.4)' : '0 4px 14px rgba(37,99,235,.3)',
                  opacity: (isAiSpeaking || isProcessing) ? 0.4 : 1,
                  transition: 'all .2s',
                }}
              >
                {isListening ? <MicOff style={{ width: 28, height: 28 }} /> : <Mic style={{ width: 28, height: 28 }} />}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — form preview */}
        <div style={{ width: 380, flexShrink: 0, borderLeft: '1px solid #e5e7eb', background: '#f9fafb', padding: 28, overflowY: 'auto' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#111' }}>Live Form</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px 0' }}>Auto-fills as you speak</p>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="TITLE" value={formState.title} />
            <Field label="DESCRIPTION" value={formState.description} tall />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="DISTRICT" value={formState.district} />
              <Field label="CATEGORY" value={formState.category} />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!formState.title || !formState.description}
              style={{ marginTop: 8, width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: (!formState.title || !formState.description) ? 0.3 : 1, transition: 'opacity .2s' }}
            >
              Submit Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- simple field component ---- */
function Field({ label, value, tall }: { label: string; value: string; tall?: boolean }) {
  const filled = !!value;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{
        padding: 12, borderRadius: 10, minHeight: tall ? 80 : undefined, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' as const,
        background: filled ? '#eff6ff' : '#f9fafb',
        border: filled ? '1.5px solid #bfdbfe' : '1.5px dashed #d1d5db',
        color: filled ? '#1e3a5f' : '#9ca3af',
        transition: 'all .3s',
      }}>
        {value || 'Waiting for input...'}
      </div>
    </div>
  );
}
