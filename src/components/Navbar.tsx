'use client';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import { LogIn, LogOut, User as UserIcon, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const { role, setRole, lang, setLang, t, user, login, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  
  const toggleLanguage = () => setLang(lang === 'en' ? 'hi' : 'en');

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as any);
  };

  const roleLinks = {
    citizen: [
      { href: '/citizen', label: t('nav.citizen') || 'Report Issue' },
      { href: '/challenges', label: t('nav.challenges') || 'Challenges' },
    ],
    admin: [
      { href: '/admin', label: t('nav.admin') || 'Dashboard' },
      { href: '/challenges', label: t('nav.challenges') || 'Challenges' },
    ],
    researcher: [
      { href: '/researcher', label: t('nav.researcher') || 'Hub' },
      { href: '/challenges', label: t('nav.challenges') || 'Challenges' },
    ],
    industry: [
      { href: '/industry', label: t('nav.industry') || 'Portal' },
      { href: '/challenges', label: t('nav.challenges') || 'Challenges' },
    ]
  };

  const links = roleLinks[role] || [];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
        
        {/* Brand & Back Button */}
        <div className="flex items-center gap-4">
          {pathname !== '/' && (
            <button 
              onClick={() => router.back()} 
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg leading-none">C</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors hidden sm:inline">
              CollabSolve <span className="font-medium text-gray-500 dark:text-gray-400">Jharkhand</span>
            </span>
          </Link>
        </div>
        
        {/* Nav Links */}
        <div className="hidden md:flex space-x-8 items-center">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-fixed transition-colors">
              {link.label}
            </Link>
          ))}
          
          {/* Controls Container */}
          <div className="flex items-center space-x-4 pl-6 border-l border-gray-200 dark:border-gray-800">
            
            {/* Language Toggle */}
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" title="Toggle Language">
              <span className="material-symbols-outlined text-[16px]">language</span>
              {lang === 'en' ? 'HI' : 'EN'}
            </button>
            
            {/* Role Switcher */}
            <select 
              value={role} 
              onChange={handleRoleChange}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block px-3 py-1.5 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <option value="citizen">👤 Citizen</option>
              <option value="admin">🛡️ Govt Admin</option>
              <option value="researcher">🎓 Researcher</option>
              <option value="industry">🏭 Industry</option>
            </select>
            
            {/* Auth */}
            {user ? (
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900 px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[100px] truncate">{user.displayName}</span>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Log Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={login} className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow">
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
