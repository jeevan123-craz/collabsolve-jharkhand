'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User } from 'lucide-react';

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'ai', text: 'Namaste! 🙏 I\'m CollabSolve AI. I can help you report issues, track complaints, find challenges, or answer questions about the platform. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickActions = [
    '📝 How to report an issue?',
    '🔍 Track my complaint',
    '📊 Show statistics',
    '🏛️ Available departments',
  ];

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    // Smart local responses for common queries
    const lower = msg.toLowerCase();
    let reply = '';

    if (lower.includes('report') || lower.includes('submit') || lower.includes('file')) {
      reply = '📝 To report an issue:\n\n1. Go to **Report Issue** page\n2. Enter a clear title and description\n3. Select your district and category\n4. Attach photos, videos, or documents\n5. Our AI will auto-categorize and check for duplicates\n6. Submit and receive your **Tracking ID**!\n\n👉 [Click here to report](/citizen)';
    } else if (lower.includes('track') || lower.includes('status') || lower.includes('complaint')) {
      reply = '🔍 To track your challenge:\n\n1. Go to the **Track** page\n2. Enter your Tracking ID\n3. See real-time status updates with a visual timeline\n\n👉 [Track now](/track)';
    } else if (lower.includes('statistic') || lower.includes('data') || lower.includes('number')) {
      reply = '📊 Platform Statistics:\n\n• Active challenges across 24 districts\n• 87% SLA compliance rate\n• Average resolution: 12 days\n• 13 AI features powering the platform\n\n👉 [View Impact Dashboard](/impact)\n👉 [View Leaderboard](/leaderboard)';
    } else if (lower.includes('department') || lower.includes('university') || lower.includes('institution')) {
      reply = '🏛️ Partner Institutions:\n\n• **BIT Mesra** — Engineering & Technology\n• **IIT ISM Dhanbad** — Mining & Environment\n• **NIT Jamshedpur** — Infrastructure\n• **XLRI** — Management & Policy\n• **Ranchi University** — Social Sciences\n• **Birsa Agricultural University** — Agriculture\n\nOur AI automatically routes challenges to the best-fit institution!';
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste')) {
      reply = 'Namaste! 🙏 Welcome to CollabSolve Jharkhand. I\'m here to help you navigate the platform. What would you like to do?';
    } else {
      // Call AI for complex queries
      try {
        const res = await fetch('/api/ai/admin-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: msg, challenges: [], proposals: [] })
        });
        const data = await res.json();
        reply = data.reply || 'I\'m sorry, I couldn\'t process that. Could you try rephrasing?';
      } catch {
        reply = 'I can help with:\n\n• 📝 Reporting issues\n• 🔍 Tracking complaints\n• 📊 Viewing statistics\n• 🏛️ Finding departments\n\nTry asking about any of these!';
      }
    }

    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 gradient-bg rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-bg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">CollabSolve AI Assistant</h3>
                <p className="text-white/70 text-xs">Powered by Gemini AI</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[200px] max-h-[320px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-secondary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-primary text-on-primary rounded-br-md' 
                      : 'bg-surface-container-low text-on-surface rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="bg-surface-container-low rounded-2xl px-4 py-3 rounded-bl-md">
                    <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickActions.map(action => (
                  <button
                    key={action}
                    onClick={() => handleSend(action)}
                    className="text-xs bg-surface-variant/50 hover:bg-primary/10 text-on-surface-variant hover:text-primary px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-surface-variant flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary text-on-primary p-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
