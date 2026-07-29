// Auth is handled directly via Supabase in AuthContext.tsx.
// This file is kept for any extra profile-related calls to the Express API.

export interface LoginPayload    { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; phone: string; password: string; }

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  token: string;
  role: 'user' | 'admin';
}
