'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

/* ─── what the hook returns ─────────────────────────────────────────── */
interface UseLoginOrRegisterResult {
  user:    User | null;
  loading: boolean;
  error:   string | null;
}

/* ─── tiny helper: stash JWT in localStorage ────────────────────────── */
function saveToken(session: Session | null) {
  if (typeof window === 'undefined') return;          // SSR guard
  if (session?.access_token) {
    localStorage.setItem('sb-access-token', session.access_token);
  }
}

/* ─── the hook itself ───────────────────────────────────────────────── */
export function useLoginOrRegister(
  email: string,
  password: string
): UseLoginOrRegisterResult {
  const router          = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!email || !password) { setLoading(false); return; }

    let cancelled = false;

    async function authFlow() {
      setLoading(true); setError(null);

      // 1 ▸ sign-in first
      const { data: si, error: siErr } =
        await supabase.auth.signInWithPassword({ email, password });

      if (cancelled) return;

      if (!siErr && si.user) {
        saveToken(si.session ?? (await supabase.auth.getSession()).data.session);
        setUser(si.user);
        console.log(si.user)
        await handleProfileRedirect(si.user.id);       // 🔑 redirect
        router.replace('/sign-up');
        setLoading(false);
        return;
      }

      // 2 ▸ on “user not found”, fallback to sign-up
      const { data: su, error: suErr } =
        await supabase.auth.signUp({ email, password });

      if (cancelled) return;

      if (suErr) { setError(suErr.message); setLoading(false); return; }

      const session =
        su.session ?? (await supabase.auth.getSession()).data.session;
      saveToken(session);

      if (su.user) {
        setUser(su.user);
        // new users never have a profile yet → go to sign-up flow
      }

      setLoading(false);
    }

    /* ─── helper: decide where to send them ─────────────────────────── */
    async function handleProfileRedirect(uid: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      console.error(uid)
      if (error) { 
        router.replace('/sign-up');
        return; 
      }

      if (data) {
        router.replace('/home');        // profile exists ✔
      } else {
        router.replace('/sign-up');     // no profile yet
      }
    }

    authFlow();
    return () => { cancelled = true; };
  }, [email, password, router]);

  return { user, loading, error };
}
