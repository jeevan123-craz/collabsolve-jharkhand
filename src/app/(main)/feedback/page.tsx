'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Send, CheckCircle, MessageSquare } from 'lucide-react';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-20">
          <div className="w-20 h-20 bg-success-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success-green" />
          </div>
          <h1 className="font-headline-lg text-3xl font-bold mb-3">Thank You!</h1>
          <p className="text-on-surface-variant text-lg">Your feedback helps us improve CollabSolve for everyone in Jharkhand.</p>
          <div className="flex justify-center gap-1 mt-4">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-8 h-8 ${s <= rating ? 'text-warning-amber fill-warning-amber' : 'text-surface-variant'}`} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-8 px-gutter max-w-container-max mx-auto pb-xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-4xl font-black text-on-surface mb-3 flex items-center justify-center gap-3">
            <MessageSquare className="w-9 h-9 text-primary" /> Give Feedback
          </h1>
          <p className="text-on-surface-variant text-lg">Help us improve the platform. Rate your experience and share suggestions.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm p-8 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block font-bold text-on-surface mb-3 text-center">How would you rate your experience?</label>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star className={`w-10 h-10 transition-colors ${s <= (hover || rating) ? 'text-warning-amber fill-warning-amber' : 'text-surface-variant'}`} />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-on-surface-variant mt-2">
              {rating === 0 ? 'Click to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-on-surface mb-2">What is your feedback about?</label>
            <select 
              value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-xl p-3 outline-none focus:border-primary"
            >
              <option value="general">General Experience</option>
              <option value="reporting">Issue Reporting</option>
              <option value="tracking">Challenge Tracking</option>
              <option value="ai">AI Features</option>
              <option value="resolution">Resolution Quality</option>
              <option value="ui">Design & Usability</option>
            </select>
          </div>

          {/* Text */}
          <div>
            <label className="block font-bold text-on-surface mb-2">Your suggestions (optional)</label>
            <textarea
              value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Tell us what we can improve..."
              rows={4}
              className="w-full bg-surface border border-outline-variant rounded-xl p-3 outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={rating === 0}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" /> Submit Feedback
          </button>
        </form>
      </motion.div>
    </div>
  );
}
