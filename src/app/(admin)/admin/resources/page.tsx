'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Download, DollarSign, Users, Target, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminResourcesPage() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      const { data } = await supabase
        .from('proposals')
        .select('*, challenges(title, category)')
        .in('status', ['Accepted', 'Disbursed'])
        .order('createdAt', { ascending: false });
      
      if (data) {
        setAllocations(data);
      }
      setLoading(false);
    };

    fetchAllocations();

    const channel = supabase.channel('admin_resources')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals', filter: 'status=in.(Accepted,Disbursed)' }, fetchAllocations)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalFunds = allocations.reduce((acc, curr) => {
    const amount = parseFloat(curr.budgetRequest.replace(/[^0-9.-]+/g, '')) || 0;
    return acc + amount;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const markAsDisbursed = async (id: string) => {
    await supabase.from('proposals').update({ status: 'Disbursed' }).eq('id', id);
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, status: 'Disbursed' } : a));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-3xl font-bold text-on-surface flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-secondary" /> Resource Allocation & Reports
          </h1>
          <p className="text-on-surface-variant">Track industry funding and resource grants to approved problem-solvers.</p>
        </div>
        <button className="bg-surface-variant/50 text-on-surface px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-surface-variant transition-colors border border-outline-variant shadow-sm whitespace-nowrap">
          <Download className="w-4 h-4" /> Export Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="bg-success-green/10 p-6 rounded-2xl border border-success-green/20">
          <DollarSign className="w-8 h-8 text-success-green mb-2" />
          <div className="text-3xl font-black text-success-green">{formatCurrency(totalFunds)}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mt-1">Total Funds Allocated</div>
        </div>
        <div className="bg-secondary/10 p-6 rounded-2xl border border-secondary/20">
          <Users className="w-8 h-8 text-secondary mb-2" />
          <div className="text-3xl font-black text-secondary">{allocations.length}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mt-1">Active Sponsorships</div>
        </div>
        <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
          <Target className="w-8 h-8 text-primary mb-2" />
          <div className="text-3xl font-black text-primary">{new Set(allocations.map(a => a.teamName)).size}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mt-1">Unique Teams Funded</div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden mt-4">
        <div className="p-4 border-b border-surface-variant">
          <h2 className="font-headline-md font-bold">Approved Project Allocations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-variant/20 text-on-surface-variant font-label-md uppercase tracking-wider text-sm">
                <th className="p-4 border-b border-surface-variant">Project / Challenge</th>
                <th className="p-4 border-b border-surface-variant">Problem Solver (Team)</th>
                <th className="p-4 border-b border-surface-variant">Requested Budget</th>
                <th className="p-4 border-b border-surface-variant">Status</th>
                <th className="p-4 border-b border-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">Loading allocations...</td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">No accepted proposals yet. Approve proposals in the Command Center first.</td>
                </tr>
              ) : allocations.map((item, index) => (
                <motion.tr 
                  key={item.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-surface-variant hover:bg-surface-variant/10 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold text-on-surface">{item.challenges?.title || 'Unknown Challenge'}</div>
                    <div className="text-xs text-on-surface-variant mt-1">Proposal ID: {item.id.substring(0,8)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{item.teamName}</div>
                    <div className="text-xs text-on-surface-variant">{item.institution}</div>
                  </td>
                  <td className="p-4 font-bold text-success-green">{item.budgetRequest}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      item.status === 'Disbursed' 
                        ? 'bg-success-green/10 text-success-green border border-success-green/20'
                        : 'bg-warning-amber/10 text-warning-amber border border-warning-amber/20'
                    }`}>
                      {item.status === 'Disbursed' ? 'Funds Disbursed' : 'Pending Transfer'}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.status !== 'Disbursed' ? (
                      <button 
                        onClick={() => markAsDisbursed(item.id)}
                        className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        Mark Disbursed
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-success-green flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
