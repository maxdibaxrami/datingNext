'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

import { Profile } from '@/type/profile';
import { useProfileStore } from '@/lib/stores/useProfileStore';

// 1️⃣ Import the UserImage type and photo store
import { UserImage } from '@/type/userImage';
import { usePhotoStore } from '@/lib/stores/usePhotoStore';

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
  const router                = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // 2️⃣ Grab both setProfile and setPhotos (and clearPhotos if needed)
  const { setProfile }            = useProfileStore.getState();
  const { setPhotos, clearPhotos } = usePhotoStore.getState();

  useEffect(() => {
    if (!email || !password) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function authFlow() {
      setLoading(true);
      setError(null);

      // ─── 1 ▸ Attempt sign‐in first ─────────────────────────────────
      const { data: si, error: siErr } =
        await supabase.auth.signInWithPassword({ email, password });

      if (cancelled) return;

      if (!siErr && si.user) {
        // 1a) Save JWT & set user
        saveToken(si.session ?? (await supabase.auth.getSession()).data.session);
        setUser(si.user);

        // 1b) Redirect based on whether profile exists
        await handleProfileRedirect(si.user.id);
        setLoading(false);
        return;
      }

      // ─── 2 ▸ If “user not found” or bad credentials, try sign‐up ───────
      const { data: su, error: suErr } =
        await supabase.auth.signUp({ email, password });

      if (cancelled) return;

      if (suErr) {
        setError(suErr.message);
        setLoading(false);
        return;
      }

      // 2a) On successful signUp, store JWT and user (new users have no profile)
      const session =
        su.session ?? (await supabase.auth.getSession()).data.session;
      saveToken(session);

      if (su.user) {
        setUser(su.user);

        // New users never have a profile yet → clear any old photos and send to sign-up
        clearPhotos();
        router.replace('/sign-up');
      }

      setLoading(false);
    }

    /* ─── helper: check if the user has a profile and redirect ───────── */
    async function handleProfileRedirect(uid: string) {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      console.log('Checking profile for UID:', uid);

      if (profileErr) {
        console.error(
          'Supabase error fetching profile:',
          profileErr.message
        );
        // Treat as “no profile”; clear photos & send to sign-up
        clearPhotos();
        router.replace('/sign-up');
        return;
      }

      if (data) {
        // 3a) Profile exists → stash it in Zustand
        setProfile(data as Profile);

        // 4️⃣ Fetch this user’s full user_images rows:
        const { data: imagesData, error: imagesErr } = await supabase
          .from('user_images')      // <UserImage>
          .select('*')                         // all columns
          .eq('user_id', uid)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (imagesErr) {
          console.error(
            'Supabase error fetching user images:',
            imagesErr.message
          );
          clearPhotos();
        } else if (imagesData) {
          // imagesData is typed as UserImage[]
          console.log(imagesData)
          setPhotos(imagesData);
        }

        // 5️⃣ Finally, send them to /home
        router.replace('/home');
      } else {
        // 3b) No profile row → new user must fill out their profile
        clearPhotos();
        router.replace('/sign-up');
      }
    }

    authFlow();
    return () => {
      cancelled = true;
    };
  }, [email, password, router, setProfile, setPhotos, clearPhotos]);

  return { user, loading, error };
}
