import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  token: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginPayload    { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; phone: string; password: string; }

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  loading: boolean;
  login:    (payload: LoginPayload)    => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout:   ()                         => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function buildAuthUser(supabaseUser: User, session: Session): AuthUser {
  const meta = supabaseUser.user_metadata as Record<string, string> | undefined;
  const appMeta = supabaseUser.app_metadata as Record<string, string> | undefined;
  const role: UserRole =
    (appMeta?.['role'] as UserRole | undefined) ??
    (meta?.['role']    as UserRole | undefined) ??
    'user';

  return {
    id:     supabaseUser.id,
    name:   meta?.['display_name'] ?? meta?.['name'] ?? supabaseUser.email ?? 'User',
    email:  supabaseUser.email ?? '',
    token:  session.access_token,
    role,
    avatar: meta?.['avatar_url'],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(buildAuthUser(session.user, session));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(buildAuthUser(session.user, session));
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async ({ email, password }: LoginPayload) => {
    // Check backend is reachable before allowing login
    try {
      const health = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/health`);
      if (!health.ok) throw new Error('Server is unavailable. Please try again later.');
    } catch (e) {
      if (e instanceof Error && e.message !== 'Server is unavailable. Please try again later.') {
        throw new Error('Cannot connect to server. Make sure the backend is running.');
      }
      throw e;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.session && data.user) {
      setUser(buildAuthUser(data.user, data.session));
    }
  };

  const register = async ({ name, email, phone, password }: RegisterPayload) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, phone },
      },
    });
    if (error) throw new Error(error.message);
    if (data.session && data.user) {
      setUser(buildAuthUser(data.user, data.session));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role ?? null,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
