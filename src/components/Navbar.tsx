'use client';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import { LogIn, LogOut, User as UserIcon, ArrowLeft, Bell, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from '@/lib/mock-firebase';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import GlobalSearch from './GlobalSearch';

function NotificationBell({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Manual sorting because mock-firebase might need it
      let notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const markAllAsRead = async () => {
    for (const n of notifications.filter(n => !n.read)) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100 "
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white "></span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white  rounded-2xl shadow-xl border border-gray-200  z-50 flex flex-col custom-scrollbar"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100  sticky top-0 bg-white/90  backdrop-blur-sm">
              <h3 className="font-bold text-gray-900 ">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-bold text-primary hover:text-primary/80">
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="flex flex-col">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500 ">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => { if(!notif.read) markAsRead(notif.id) }}
                    className={`p-4 border-b border-gray-100  last:border-0 cursor-pointer transition-colors ${!notif.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50 '}`}
                  >
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900 ' : 'text-gray-600 '}`}>
                      {notif.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
      { href: '/', label: t('nav.home') || 'Home' },
      { href: '/citizen', label: t('nav.citizen') || 'Report Issue' },
      { href: '/challenges', label: t('nav.challenges') || 'Browse Challenges' },
      { href: '/leaderboard', label: t('nav.leaderboard') || 'Leaderboard' },
      { href: '/impact', label: t('nav.impact') || 'Impact' },
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
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
        
        {/* Brand & Back Button */}
        <div className="flex items-center gap-4">
          {pathname !== '/' && (
            <button 
              onClick={() => router.back()} 
              className="p-2 -ml-2 rounded-full hover:bg-gray-100  text-gray-500 hover:text-primary transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg leading-none">C</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900  group-hover:text-primary transition-colors hidden sm:inline">
              CollabSolve <span className="font-medium text-gray-500 ">Jharkhand</span>
            </span>
          </Link>
        </div>
        
        {/* Nav Links */}
        <div className="hidden md:flex gap-4 lg:gap-8 items-center">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-bold whitespace-nowrap text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl border border-gray-200 shadow-sm active:scale-95 transition-all">
              {link.label}
            </Link>
          ))}
          
          {/* Controls Container */}
          <div className="flex items-center gap-3 pl-4 lg:pl-6 border-l border-gray-200 ">
            
            {/* Global Search */}
            <GlobalSearch />

            {/* Language Toggle */}
            <button onClick={toggleLanguage} className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-100 " title="Toggle Language">
              <span className="material-symbols-outlined text-[16px]">language</span>
              {lang === 'en' ? 'HI' : 'EN'}
            </button>
            
            {/* Role Switcher */}
            <select 
              value={role} 
              onChange={handleRoleChange}
              className="hidden lg:block bg-gray-50  border border-gray-200  text-gray-700  text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary px-3 py-1.5 outline-none cursor-pointer hover:bg-gray-100  transition-colors"
            >
              <option value="citizen">{t('role.citizen')}</option>
              <option value="admin">{t('role.admin')}</option>
              <option value="researcher">{t('role.researcher')}</option>
              <option value="industry">{t('role.industry')}</option>
            </select>
            
            {/* Auth */}
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell user={user} />
                <div className="flex items-center space-x-3 bg-gray-50  px-2.5 py-1.5 rounded-full border border-gray-200  shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full ring-2 ring-white " />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white flex items-center justify-center">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700  max-w-[100px] truncate hidden xl:inline-block">{user.displayName}</span>
                  <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Log Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm">
                <LogIn className="w-4 h-4" />
                {t('nav.signin')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
