'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  User, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ArrowLeft, 
  Check,
  Shield,
  MapPin,
  Cpu,
  UserPlus,
  Terminal
} from 'lucide-react';

type UserIntent = 'solver' | 'submitter' | 'funder';

interface SolverAnswers {
  institution: string;
  domains: string[];
  teamType: string;
  experienceLevel: string;
}

interface SubmitterAnswers {
  district: string;
  category: string;
  submitterType: string;
}

export default function SignInGate({ onComplete }: { onComplete?: () => void }) {
  const { user, login, bypassLogin, setRole } = useApp();
  const router = useRouter();

  const [intent, setIntent] = useState<UserIntent>('solver');
  const [step, setStep] = useState<'intent' | 'account' | 'questions'>('intent');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Solver specific questions state
  const [solverData, setSolverData] = useState<SolverAnswers>({
    institution: 'BIT Mesra, Ranchi',
    domains: ['💧 Water Resource & Ground Water Monitoring', '🤖 AI, IoT, GIS & Smart Sensors'],
    teamType: 'Student Capstone / Research Team',
    experienceLevel: 'Undergraduate / B.Tech'
  });

  // Submitter specific questions state
  const [submitterData, setSubmitterData] = useState<SubmitterAnswers>({
    district: 'Ranchi',
    category: 'Water Management',
    submitterType: 'Local Resident / Citizen'
  });

  const institutionsList = [
    'BIT Mesra, Ranchi',
    'IIT (ISM) Dhanbad',
    'NIT Jamshedpur',
    'Birsa Agricultural University (BAU), Ranchi',
    'Rajendra Institute of Medical Sciences (RIMS)',
    'XLRI Jamshedpur / XISS',
    'Ranchi University / Central University of Jharkhand',
    'Vinoba Bhave University, Hazaribagh',
    'Other Engineering / Research Institute'
  ];

  const solverDomainsList = [
    '💧 Water Resource & Ground Water Monitoring',
    '🤖 AI, IoT, GIS & Smart Sensors',
    '🌾 Agriculture & Precision Soil Tech',
    '🏥 Rural Healthcare & Telemedicine Systems',
    '⛏️ Mining Safety & Environmental Sensors',
    '🛣️ Smart Civil & Rural Road Infrastructure',
    '🎓 EdTech & Tribal Language Preservation'
  ];

  const districtsList = [
    'Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Hazaribagh', 
    'Deoghar', 'Dumka', 'Giridih', 'Ramgarh', 'Palamu', 'West Singhbhum'
  ];

  const handleRealLogin = async () => {
    const targetRole = 
      intent === 'solver' ? 'researcher' :
      intent === 'submitter' ? 'citizen' : 'industry';

    // Optimistically save the role so AppContext assigns it when OAuth returns
    localStorage.setItem('collabsolve-role', targetRole);
    
    await login();
  };

  const toggleSolverDomain = (domain: string) => {
    setSolverData(prev => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter(d => d !== domain)
        : [...prev.domains, domain]
    }));
  };

  const finishSetup = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f4f9] text-slate-900 flex flex-col justify-between items-center py-8 px-4 font-sans">
      
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center font-black text-xl text-white shadow-md">
            C
          </div>
          <div>
            <span className="font-extrabold text-xl text-blue-950 block leading-tight">CollabSolve</span>
            <span className="text-xs text-blue-700 font-bold tracking-wider uppercase block">Jharkhand State Portal</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-xs font-bold text-blue-900 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>SIH 2026 &middot; PS: SIH26043</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-2xl my-auto">
        <div style={{ width: '100%', textAlign: 'center', marginBottom: '28px' }}>
          <h1 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-2.5">
            Jharkhand&apos;s Problems. <span className="text-blue-700">India&apos;s Brightest Minds.</span>
          </h1>
          <p className="text-base text-slate-600 w-full mx-auto leading-relaxed px-4" style={{ maxWidth: '600px' }}>
            A unified platform for citizens, innovators, and industry to build a smarter, safer Jharkhand.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-slate-100">
          
          {/* STEP 1: CHOOSE INTENT */}
          {step === 'intent' && (
            <div className="p-6 sm:p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">How do you want to contribute?</h2>
                <p className="text-sm text-slate-500">Select your role to customize your dashboard</p>
              </div>

              <div className="space-y-4">
                {/* 1. Innovator / Solver */}
                <button
                  type="button"
                  onClick={() => setIntent('solver')}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    intent === 'solver'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base sm:text-lg text-slate-900">
                          I am a Problem Solver
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded-full">
                          Innovator
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        University students, researchers, and startups submitting proposals to solve civic challenges.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {intent === 'solver' ? (
                      <CheckCircle2 className="w-6 h-6 fill-blue-700 text-white" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </button>

                {/* 2. Citizen / Submitter */}
                <button
                  type="button"
                  onClick={() => setIntent('submitter')}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    intent === 'submitter'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-700 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base sm:text-lg text-slate-900">
                          I want to Report / Submit an Issue
                        </span>
                        <span className="text-[10px] font-bold text-orange-700 uppercase bg-orange-100 px-2 py-0.5 rounded-full">
                          Citizen
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Citizens, NGOs, or local government officials reporting local ground-level challenges.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {intent === 'submitter' ? (
                      <CheckCircle2 className="w-6 h-6 fill-blue-700 text-white" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </button>

                {/* 3. Industry Sponsor */}
                <button
                  type="button"
                  onClick={() => setIntent('funder')}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    intent === 'funder'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base sm:text-lg text-slate-900">
                          Industry / CSR Sponsor
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                          Enterprise
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Corporate partners funding student innovations, providing mentorship, and disbursing CSR grants.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {intent === 'funder' ? (
                      <CheckCircle2 className="w-6 h-6 fill-blue-700 text-white" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                {/* Continue with Google Button */}
                <button
                  type="button"
                  onClick={handleRealLogin}
                  className="w-full py-3.5 px-4 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                    <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Bypass Button for Local Testing */}
                <button
                  type="button"
                  onClick={() => {
                    const targetRole = 
                      intent === 'solver' ? 'researcher' :
                      intent === 'submitter' ? 'citizen' : 'industry';
                    setRole(targetRole);
                    bypassLogin();
                    finishSetup();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:shadow-md cursor-pointer"
                >
                  <Terminal className="w-5 h-5 text-slate-500" />
                  Bypass (Dev Mode)
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={finishSetup}
                  className="text-xs text-slate-500 hover:text-blue-700 transition-colors underline cursor-pointer"
                >
                  Explore / Preview as Guest
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ADAPTIVE QUESTIONNAIRE */}
          {step === 'questions' && (
            <div>
              {/* Authenticated User Pill */}
              {user && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 mb-6">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full ring-2 ring-blue-600/30" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      {user.displayName} <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">✓ Google Verified</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 px-2.5 py-1 bg-blue-100 border border-blue-200 rounded-lg">
                    {intent === 'solver' ? 'Problem Solver' : intent === 'submitter' ? 'Citizen' : 'Industry'}
                  </span>
                </div>
              )}

              {/* ----------------- ADAPTIVE QUESTIONS FOR PROBLEM SOLVERS ----------------- */}
              {intent === 'solver' && (
                <div>
                  <div className="mb-6">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
                      Problem Solver Profile &middot; Technical Setup
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                      Tell us about your team &amp; technical domain
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Our AI engine uses these answers to route matching societal challenges and faculty mentors directly to your team workspace.
                    </p>
                  </div>

                  {/* Q1: Higher Education Institution */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1. Select Your Affiliated University / Research Institution
                    </label>
                    <select
                      value={solverData.institution}
                      onChange={e => setSolverData(s => ({ ...s, institution: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
                    >
                      {institutionsList.map(inst => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>

                  {/* Q2: Technical Domains (Multiple selection) */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      2. Technical Specializations (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {solverDomainsList.map(domain => {
                        const isSelected = solverData.domains.includes(domain);
                        return (
                          <button
                            key={domain}
                            type="button"
                            onClick={() => toggleSolverDomain(domain)}
                            className={`text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span>{domain}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q3: Team Structure */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      3. Team Configuration
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {['Student Capstone / Research Team', 'Faculty-led Lab Group', 'Independent Innovator'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSolverData(s => ({ ...s, teamType: type }))}
                          className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                            solverData.teamType === type
                              ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q4: Experience Level */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      4. Current Academic / Research Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Undergraduate / B.Tech', 'Postgraduate / M.Tech', 'PhD Researcher', 'Faculty Mentor'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSolverData(s => ({ ...s, experienceLevel: lvl }))}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                            solverData.experienceLevel === lvl
                              ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- ADAPTIVE QUESTIONS FOR CITIZENS / SUBMITTERS ----------------- */}
              {intent === 'submitter' && (
                <div>
                  <div className="mb-6">
                    <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block mb-1">
                      Citizen &middot; Community Reporting Setup
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                      Where are you reporting challenges from?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      This configures your local district feed and GPS auto-tagging.
                    </p>
                  </div>

                  {/* Q1: District */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1. Select Your District in Jharkhand
                    </label>
                    <select
                      value={submitterData.district}
                      onChange={e => setSubmitterData(s => ({ ...s, district: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
                    >
                      {districtsList.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Q2: Primary Sector of Concern */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      2. Primary Area of Societal Concern
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Water Management', 'Healthcare & Sanitation', 'Agriculture & Soil', 'Roads & Infrastructure', 'Education & Schools', 'Mining Safety'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSubmitterData(s => ({ ...s, category: cat }))}
                          className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                            submitterData.category === cat
                              ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3: Submitting as */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      3. Submitting as
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {['Local Resident / Citizen', 'Panchayat / Village Head', 'Community NGO / Social Worker'].map(subType => (
                        <button
                          key={subType}
                          type="button"
                          onClick={() => setSubmitterData(s => ({ ...s, submitterType: subType }))}
                          className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                            submitterData.submitterType === subType
                              ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {subType}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- ADAPTIVE FOR INDUSTRY ----------------- */}
              {intent === 'funder' && (
                <div className="mb-6">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    Industry Partner &middot; CSR Setup
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                    Industry CSR &amp; Sponsorship Focus
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4">
                    Configure your corporate grant allocations and CSR focus sectors for Jharkhand.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setStep('intent')}
                  className="px-5 py-3.5 rounded-2xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
                </button>
                <button
                  type="button"
                  onClick={finishSetup}
                  className="flex-1 py-4 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 transition-all cursor-pointer"
                >
                  Enter CollabSolve Platform <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="w-full max-w-4xl mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-3.5 h-3.5 text-blue-700" /> 24 Jharkhand Districts</span>
          <span className="flex items-center gap-1.5 font-medium"><Cpu className="w-3.5 h-3.5 text-blue-700" /> 13 AI Modules</span>
          <span className="flex items-center gap-1.5 font-medium"><Shield className="w-3.5 h-3.5 text-blue-700" /> SIH26043 Compliant</span>
        </div>
        <p className="text-slate-400">Government of Jharkhand &middot; Dept of Higher &amp; Technical Education</p>
      </footer>
    </div>
  );
}
