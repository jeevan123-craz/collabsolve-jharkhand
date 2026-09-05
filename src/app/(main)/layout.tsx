'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIChatbot from '@/components/AIChatbot';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/AppContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useApp();

  const isLoginPage = pathname === '/login';
  const isUnauthenticatedHome = pathname === '/' && !user;

  // Render clean full-screen layout without navbar/footer on login or entry gate
  if (isLoginPage || isUnauthenticatedHome) {
    return <main className="min-h-screen bg-surface">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <AIChatbot />
    </>
  );
}
