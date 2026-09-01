'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, translations } from './data';
import { auth, db, googleProvider } from '@/lib/mock-firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User, signInAnonymously } from '@/lib/mock-firebase';
import { doc, getDoc, setDoc } from '@/lib/mock-firebase';

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => Promise<void>;
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
  t: (key: string) => string;
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('citizen');
  const [lang, setLangState] = useState<'en' | 'hi'>('en');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem('collabsolve-lang') as 'en' | 'hi';
    if (savedLang) setLangState(savedLang);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setRoleState(userDoc.data().role as UserRole);
          } else {
            // New user, save default role
            const defaultRole = (localStorage.getItem('collabsolve-role') as UserRole) || 'citizen';
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              role: defaultRole
            });
            setRoleState(defaultRole);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setRole = async (r: UserRole) => {
    setRoleState(r);
    localStorage.setItem('collabsolve-role', r);
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { role: r }, { merge: true });
    }
  };

  const setLang = (l: 'en' | 'hi') => {
    setLangState(l);
    localStorage.setItem('collabsolve-lang', l);
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Login failed:", error);
      if (error.code === 'auth/unauthorized-domain') {
        console.log("Domain unauthorized for Google Auth. Attempting anonymous login fallback...");
        try {
          await signInAnonymously(auth);
          alert("Logged in as Anonymous Guest due to domain restrictions.");
        } catch (anonErr: any) {
          console.error("Anonymous login also failed:", anonErr);
          if (confirm("Firebase Auth is blocked on localhost. Do you want to use a Mock User for local testing? (Note: You must set Firestore Rules to 'allow read, write: if true;' for this to work!)")) {
            const mockUser = {
              uid: 'local-dev-mock-uid',
              displayName: 'Local Dev User',
              email: 'dev@localhost',
              photoURL: 'https://ui-avatars.com/api/?name=Local+Dev',
            } as User;
            setUser(mockUser);
            setRoleState('citizen'); // Set default role
          }
        }
      } else {
        alert("Login failed: " + error.message);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setRoleState('citizen'); // Reset to default on logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const t = (key: string) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <AppContext.Provider value={{ role, setRole, lang, setLang, t, user, loading, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
