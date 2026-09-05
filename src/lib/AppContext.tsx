'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, translations } from './data';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Extend the Supabase User type with displayName for compatibility with existing components
export interface AppUser extends User {
  displayName?: string;
  photoURL?: string;
}

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => Promise<void>;
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
  t: (key: string) => string;
  user: AppUser | null;
  loading: boolean;
  login: (customUserData?: any) => Promise<void>;
  bypassLogin: () => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('citizen');
  const [lang, setLangState] = useState<'en' | 'hi'>('en');
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem('collabsolve-lang') as 'en' | 'hi';
    if (savedLang) setLangState(savedLang);

    // Bypass check for dev testing without real Supabase
    if (localStorage.getItem('collabsolve-dev-bypass') === 'true') {
      const savedRole = (localStorage.getItem('collabsolve-role') as UserRole) || 'citizen';
      setRoleState(savedRole);
      setUser({
        id: 'dev-bypass-user-123',
        email: 'demo@collabsolve.in',
        displayName: 'Demo User',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        role: savedRole,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleUserSession(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (supabaseUser: User | null) => {
    if (supabaseUser) {
      // Map supabase user metadata to AppUser structure expected by UI
      const appUser: AppUser = {
        ...supabaseUser,
        displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
        photoURL: supabaseUser.user_metadata?.avatar_url,
      };
      setUser(appUser);
      
      // Fetch role from public.users table
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', supabaseUser.id)
        .single();
        
      if (!error && data?.role) {
        setRoleState(data.role as UserRole);
      } else {
        // If row doesn't exist yet (e.g. trigger delay), use default
        const defaultRole = (localStorage.getItem('collabsolve-role') as UserRole) || 'citizen';
        setRoleState(defaultRole);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const setRole = async (r: UserRole) => {
    setRoleState(r);
    localStorage.setItem('collabsolve-role', r);
    if (user) {
      await supabase.from('users').update({ role: r }).eq('id', user.id);
    }
  };

  const setLang = (l: 'en' | 'hi') => {
    setLangState(l);
    localStorage.setItem('collabsolve-lang', l);
  };

  const login = async (customUserData?: any) => {
    try {
      // Supabase OAuth redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : undefined,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase Login error:", error);
    }
  };

  const bypassLogin = () => {
    // DEV MODE ONLY: Simulate a logged in user without hitting Supabase
    const fakeUser: AppUser = {
      id: 'dev-bypass-user-123',
      email: 'demo@collabsolve.in',
      displayName: 'Demo User',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
      role: role,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };
    setUser(fakeUser);
    localStorage.setItem('collabsolve-dev-bypass', 'true');
  };

  const logout = async () => {
    try {
      localStorage.removeItem('collabsolve-dev-bypass');
      await supabase.auth.signOut();
      setRoleState('citizen'); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const t = (key: string) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <AppContext.Provider value={{ role, setRole, lang, setLang, t, user, loading, login, bypassLogin, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
