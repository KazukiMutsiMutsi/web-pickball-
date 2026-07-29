import { supabase } from '@/src/lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  /** Pass a token explicitly, or leave blank to auto-attach the Supabase session token */
  token?: string;
}

/** Get the current Supabase access token (returns null if not logged in) */
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token: explicitToken, ...fetchOptions } = options;

  // Auto-resolve token from Supabase session if not provided
  const token = explicitToken ?? (await getAccessToken());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error((body as { error?: string }).error ?? `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}
