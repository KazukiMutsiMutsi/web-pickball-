import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import type { AdminUser } from '../types';

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const appMeta  = session.user.app_metadata  as Record<string, string> | undefined;
        const userMeta = session.user.user_metadata as Record<string, string> | undefined;
        const role = appMeta?.['role'] ?? userMeta?.['role'];

        if (role === 'admin') {
          setUser({
            id:    session.user.id,
            name:  userMeta?.['display_name'] ?? userMeta?.['name'] ?? 'Admin',
            email: session.user.email ?? '',
            role:  'admin',
          });
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        return;
      }
      const appMeta  = session.user.app_metadata  as Record<string, string> | undefined;
      const userMeta = session.user.user_metadata as Record<string, string> | undefined;
      const role = appMeta?.['role'] ?? userMeta?.['role'];
      if (role === 'admin') {
        setUser({
          id:    session.user.id,
          name:  userMeta?.['display_name'] ?? userMeta?.['name'] ?? 'Admin',
          email: session.user.email ?? '',
          role:  'admin',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    // Check backend is reachable before allowing login
    try {
      const health = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/health`);
      if (!health.ok) return 'Server is unavailable. Please try again later.';
    } catch {
      return 'Cannot connect to server. Make sure the backend is running.';
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return error.message;
    if (!data.user) return 'Login failed.';

    const appMeta  = data.user.app_metadata  as Record<string, string> | undefined;
    const userMeta = data.user.user_metadata as Record<string, string> | undefined;
    const role = appMeta?.['role'] ?? userMeta?.['role'];

    if (role !== 'admin') {
      await supabase.auth.signOut();
      return 'Access denied. Admin accounts only.';
    }

    setUser({
      id:    data.user.id,
      name:  userMeta?.['display_name'] ?? userMeta?.['name'] ?? 'Admin',
      email: data.user.email ?? '',
      role:  'admin',
    });
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
