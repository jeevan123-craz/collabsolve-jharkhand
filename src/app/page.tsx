'use client';

import Link from 'next/link';
import { motion, Variants } from 'motion/react';
import { useApp } from '@/lib/AppContext';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from '@/lib/mock-firebase';

export default function Home() {
  const { t } = useApp();
  const [stats, setStats] = useState({ reported: 0, proposals: 0, resolved: 0, partners: 0 });
  const [districtCounts, setDistrictCounts] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    const unsubC = onSnapshot(collection(db, 'challenges'), snap => {
      let resolved = 0;
      const counts: Record<string, number> = {};
      snap.forEach(d => {
        const data = d.data();
        if (data.status === 'Resolved') resolved++;
        if (data.district) {
          counts[data.district] = (counts[data.district] || 0) + 1;
        }
      });
      setStats(s => ({ ...s, reported: snap.size, resolved }));
      
      const sortedDistricts = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      setDistrictCounts(sortedDistricts);
    });
    const unsubP = onSnapshot(collection(db, 'proposals'), snap => {
      let accepted = 0;
      snap.forEach(d => {
        if (d.data().status === 'Accepted') accepted++;
      });
      setStats(s => ({ ...s, proposals: snap.size, partners: accepted }));
    });
    return () => { unsubC(); unsubP(); };
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary py-xl lg:py-[120px] px-gutter">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ "backgroundImage": "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", "backgroundSize": "32px 32px" }}></div>
        <motion.div 
          className="max-w-container-max mx-auto relative z-10 flex flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            variants={itemVariants}
            className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-primary mb-md max-w-4xl tracking-tight"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="font-body-lg text-body-lg text-primary-fixed-dim mb-xl max-w-2xl"
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-md">
            <Link href="/citizen">
              <button className="font-label-md text-label-md bg-on-primary text-primary px-8 py-3 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition-all active:scale-95 w-full sm:w-auto">
                {t('hero.cta1')}
              </button>
            </Link>
            <Link href="/researcher">
              <button className="font-label-md text-label-md bg-transparent border-2 border-on-primary text-on-primary px-8 py-3 rounded-lg hover:bg-on-primary/10 transition-all active:scale-95 w-full sm:w-auto">
                {t('hero.cta2')}
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section (Bento Grid Style) */}
      <section className="max-w-container-max mx-auto px-gutter -mt-xl relative z-20 pb-xl">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Stat Card 1 */}
          <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant flex items-start space-x-sm hover:shadow-md transition-shadow">
            <div className="p-xs bg-error-container rounded-lg text-error-red flex-shrink-0">
              <span className="material-symbols-outlined">report</span>
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-on-surface mb-base">
                {stats.reported}
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant">{t('stats.reported')}</div>
            </div>
          </motion.div>
          {/* Stat Card 2 */}
          <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant flex items-start space-x-sm hover:shadow-md transition-shadow">
            <div className="p-xs bg-primary-fixed rounded-lg text-primary flex-shrink-0">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-on-surface mb-base">
                {stats.proposals}
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant">{t('stats.proposals')}</div>
            </div>
          </motion.div>
          {/* Stat Card 3 */}
          <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant flex items-start space-x-sm hover:shadow-md transition-shadow">
            <div className="p-xs bg-[#DCFCE7] rounded-lg text-success-green flex-shrink-0">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-on-surface mb-base">
                {stats.resolved}
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant">{t('stats.resolved')}</div>
            </div>
          </motion.div>
          {/* Stat Card 4 */}
          <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant flex items-start space-x-sm hover:shadow-md transition-shadow">
            <div className="p-xs bg-secondary-container rounded-lg text-secondary flex-shrink-0">
              <span className="material-symbols-outlined">handshake</span>
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-on-surface mb-base">
                {stats.partners}
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant">{t('stats.partners')}</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-xl bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-gutter">
          <motion.div 
            className="text-center mb-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="font-headline-md text-headline-md md:font-headline-lg md:text-headline-lg text-on-surface mb-sm">{t('how.title')}</motion.h2>
          </motion.div>
          
          <motion.div 
            className="flex flex-col lg:flex-row items-center justify-between gap-md relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant -z-10 -translate-y-1/2"></div>
            
            {/* Step 1 */}
            <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant w-full lg:w-1/4 relative z-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md mb-sm shadow-sm ring-4 ring-surface-container-lowest">1</div>
              <h3 className="font-label-md text-label-md text-on-surface mb-base">{t('how.step1')}</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{t('how.step1desc')}</p>
            </motion.div>
            
            {/* Arrow (Mobile) */}
            <div className="block lg:hidden text-outline-variant">
              <span className="material-symbols-outlined">arrow_downward</span>
            </div>
            
            {/* Step 2 */}
            <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant w-full lg:w-1/4 relative z-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-secondary text-on-primary flex items-center justify-center font-headline-md text-headline-md mb-sm shadow-sm ring-4 ring-surface-container-lowest">2</div>
              <h3 className="font-label-md text-label-md text-on-surface mb-base">{t('how.step2')}</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{t('how.step2desc')}</p>
            </motion.div>
            
            {/* Arrow (Mobile) */}
            <div className="block lg:hidden text-outline-variant">
              <span className="material-symbols-outlined">arrow_downward</span>
            </div>
            
            {/* Step 3 */}
            <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant w-full lg:w-1/4 relative z-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-tertiary text-on-primary flex items-center justify-center font-headline-md text-headline-md mb-sm shadow-sm ring-4 ring-surface-container-lowest">3</div>
              <h3 className="font-label-md text-label-md text-on-surface mb-base">{t('how.step3')}</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{t('how.step3desc')}</p>
            </motion.div>
            
            {/* Arrow (Mobile) */}
            <div className="block lg:hidden text-outline-variant">
              <span className="material-symbols-outlined">arrow_downward</span>
            </div>
            
            {/* Step 4 */}
            <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant w-full lg:w-1/4 relative z-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-success-green text-on-primary flex items-center justify-center font-headline-md text-headline-md mb-sm shadow-sm ring-4 ring-surface-container-lowest">4</div>
              <h3 className="font-label-md text-label-md text-on-surface mb-base">{t('how.step4')}</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{t('how.step4desc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Heatmap Section (Data Viz) */}
      <section className="py-xl bg-data-viz-bg text-on-primary">
        <div className="max-w-container-max mx-auto px-gutter">
          <motion.div 
            className="mb-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-headline-md text-headline-md text-on-primary mb-xs">{t('heatmap.title')}</h2>
            <p className="font-body-md text-body-md text-outline-variant">Real-time visualization of reported civic issues across Jharkhand's 24 districts.</p>
          </motion.div>
          
          {/* Chart Container */}
          <motion.div 
            className="bg-surface-dark rounded-xl p-md border border-outline/20"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-64 sm:h-96 flex items-end justify-between gap-1 sm:gap-2 pb-sm border-b border-outline-variant relative">
              {/* Y-Axis Label */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 font-label-sm text-label-sm text-outline-variant tracking-wider uppercase">
                Challenge Count
              </div>
              
              {/* Y-axis Grid Lines (Decorative) */}
              <div className="absolute inset-x-0 top-0 h-px bg-outline/10"></div>
              <div className="absolute inset-x-0 top-1/4 h-px bg-outline/10"></div>
              <div className="absolute inset-x-0 top-2/4 h-px bg-outline/10"></div>
              <div className="absolute inset-x-0 top-3/4 h-px bg-outline/10"></div>
              
              {/* Bar Data (Dynamic 24 Districts) */}
              {districtCounts.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-outline-variant font-label-md">No challenges reported yet.</div>
              ) : (
                districtCounts.map((district, i) => {
                  const maxCount = Math.max(...districtCounts.map(d => d.count), 1);
                  const heightPercent = Math.max((district.count / maxCount) * 85, 5); // min 5%, max 85% height
                  let colorClass = 'bg-[#FBBF24]/50 hover:bg-[#FBBF24]';
                  if (i === 0) colorClass = 'bg-error-red/80 hover:bg-error-red';
                  else if (i < 3) colorClass = 'bg-warning-amber/80 hover:bg-warning-amber';
                  
                  return (
                    <motion.div 
                      key={district.name}
                      initial={{ height: 0 }} 
                      whileInView={{ height: `${heightPercent}%` }} 
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }} 
                      className={`w-full ${colorClass} rounded-t-sm chart-bar relative group transition-colors`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-lowest text-on-surface font-label-sm text-label-sm px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity z-10 whitespace-nowrap">
                        {district.name}: {district.count}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            
            {/* X-Axis Label */}
            <div className="mt-xs text-center font-label-sm text-label-sm text-outline-variant tracking-wider uppercase">
              24 Districts
            </div>
            
            {/* Legend */}
            <div className="mt-md flex flex-wrap items-center justify-center gap-md font-label-sm text-label-sm text-outline-variant">
              <div className="flex items-center"><div className="w-3 h-3 bg-[#FBBF24]/60 rounded-sm mr-xs"></div> Low Density</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-warning-amber/60 rounded-sm mr-xs"></div> Medium Density</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-error-red/80 rounded-sm mr-xs"></div> High Density</div>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
