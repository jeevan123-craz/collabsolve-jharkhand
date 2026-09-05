'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { LayoutDashboard, LogOut, ArrowLeft, AlertTriangle, Users, Briefcase, FileText, ArrowUpCircle } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-surface-container-low border-r border-surface-variant flex flex-col hidden md:flex">
        <div className="p-6 border-b border-surface-variant">
          <Link href="/admin" className="font-headline-md font-bold text-primary flex items-center gap-2">
            CollabSolve <span className="bg-primary text-on-primary text-xs px-2 py-0.5 rounded">ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/admin' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-variant/50 text-on-surface-variant'}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/grievances" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes('/admin/grievances') ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-variant/50 text-on-surface-variant'}`}>
            <AlertTriangle className="w-5 h-5" /> Grievances
          </Link>
          <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes('/admin/users') ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-variant/50 text-on-surface-variant'}`}>
            <Users className="w-5 h-5" /> Users
          </Link>
          <Link href="/admin/resources" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes('/admin/resources') ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-variant/50 text-on-surface-variant'}`}>
            <Briefcase className="w-5 h-5" /> Resource Allocation
          </Link>
          <Link href="/admin/reports" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes('/admin/reports') ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-variant/50 text-on-surface-variant'}`}>
            <FileText className="w-5 h-5" /> AI Reports
          </Link>
          <Link href="/admin/escalations" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname.includes('/admin/escalations') ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-variant/50 text-on-surface-variant'}`}>
            <ArrowUpCircle className="w-5 h-5" /> Escalations
          </Link>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant/50 text-on-surface-variant transition-colors mt-auto border-t border-surface-variant pt-4">
            <ArrowLeft className="w-5 h-5" /> Back to Main Site
          </Link>
        </nav>
        
        {user && (
          <div className="p-4 border-t border-surface-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                {user.displayName?.charAt(0) || 'A'}
              </div>
              <div className="text-sm font-bold truncate max-w-[100px]">{user.displayName}</div>
            </div>
            <button onClick={logout} className="text-on-surface-variant hover:text-error transition-colors p-2">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>

      {/* Admin Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-surface-container-low border-b border-surface-variant p-4 flex justify-between items-center sticky top-0 z-50">
          <span className="font-bold text-primary">Admin Panel</span>
          <Link href="/" className="text-sm text-on-surface-variant">Back to Site</Link>
        </header>
        
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
