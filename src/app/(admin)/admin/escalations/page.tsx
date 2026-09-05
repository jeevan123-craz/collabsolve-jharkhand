'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Clock, ArrowUpCircle, CheckCircle, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function EscalationPage() {
  const [escalations, setEscalations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .in('status', ['Reported', 'Validated', 'In Progress']);

      if (data) {
        const today = new Date();
        const esc = data.map(c => {
          const createdAt = new Date(c.createdAt || Date.now());
          const daysOpen = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
          const isCritical = c.urgency === 'Critical';
          const slaLimit = isCritical ? 7 : 14;
          
          let status = 'On Track';
          if (daysOpen > slaLimit) status = 'Breached';
          else if (daysOpen > slaLimit - 3) status = 'At Risk';

          let level = 1; // Dept Head
          if (daysOpen > slaLimit + 7) level = 3; // Commissioner
          else if (daysOpen > slaLimit + 3) level = 2; // Director

          return {
            ...c,
            daysOpen,
            slaLimit,
            status,
            level,
            assignedTo: c.category || 'General Dept'
          };
        }).filter(e => e.status !== 'On Track').sort((a, b) => b.daysOpen - a.daysOpen);
        
        setEscalations(esc);
      }
    };
    fetchData();

    const channel = supabase.channel('admin_escalations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const levelLabel = (l: number) => {
    if (l >= 3) return { text: 'Commissioner Level', color: 'bg-[#991B1B] text-white' };
    if (l === 2) return { text: 'Director Level', color: 'bg-error/10 text-error' };
    return { text: 'Dept Head Level', color: 'bg-warning-amber/10 text-warning-amber' };
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg text-3xl font-bold text-on-surface flex items-center gap-3">
          <ArrowUpCircle className="w-8 h-8 text-error" /> SLA Escalation Manager
        </h1>
        <p className="text-on-surface-variant">Auto-escalated challenges that breached or are at risk of breaching SLA timelines.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-error/10 p-5 rounded-2xl border border-error/20">
          <div className="text-3xl font-black text-error">{escalations.filter(e => e.status === 'Breached').length}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mt-1">SLA Breached</div>
        </div>
        <div className="bg-warning-amber/10 p-5 rounded-2xl border border-warning-amber/20">
          <div className="text-3xl font-black text-warning-amber">{escalations.filter(e => e.status === 'At Risk').length}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mt-1">At Risk</div>
        </div>
        <div className="bg-success-green/10 p-5 rounded-2xl border border-success-green/20">
          <div className="text-3xl font-black text-success-green">87%</div>
          <div className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mt-1">Overall SLA Compliance</div>
        </div>
      </div>

      <div className="space-y-4">
        {escalations.map((esc, i) => {
          const level = levelLabel(esc.level);
          const overdue = esc.daysOpen - esc.slaLimit;
          return (
            <motion.div
              key={esc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-surface-container-lowest rounded-2xl border shadow-sm overflow-hidden ${esc.status === 'Breached' ? 'border-error/30' : 'border-warning-amber/30'}`}
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${esc.status === 'Breached' ? 'bg-error/10' : 'bg-warning-amber/10'}`}>
                  <AlertTriangle className={`w-6 h-6 ${esc.status === 'Breached' ? 'text-error' : 'text-warning-amber'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface">{esc.title}</h3>
                  <p className="text-sm text-on-surface-variant">{esc.district} &middot; Assigned to {esc.assignedTo}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-on-surface-variant" />
                    <span className="font-bold">{esc.daysOpen}d open</span>
                    {overdue > 0 && <span className="text-error font-bold">(+{overdue}d overdue)</span>}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${level.color}`}>
                    ↑ Escalated: {level.text}
                  </span>
                  <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                    <Bell className="w-4 h-4" /> Notify
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
