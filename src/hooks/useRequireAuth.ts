// hooks/useRequireAuth.ts
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useRequireAuth() {
  const router  = useRouter();
  const supa    = createClientComponentClient();

  useEffect(() => {
    const { data: { subscription } } = supa.auth.onAuthStateChange(
      async (_, session) => {
        if (session) router.replace('/');
        else         router.replace('/sign-up');
      },
    );

    // tidy up on unmount
    return () => subscription.unsubscribe();
  }, [router, supa]);
}
