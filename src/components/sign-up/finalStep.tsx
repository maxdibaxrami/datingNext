'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';                // ← npm i canvas-confetti
import { Placeholder, List, Spinner } from '@telegram-apps/telegram-ui';

import { signup } from '@/lib/api/signup';
import { useSignUpStore } from '@/lib/stores/useSignUpStore';
import { toSignupPayload } from '@/lib/stores/serializeForSignup';

export default function SignUpFinalStep() {
  const t        = useTranslations('i18n');
  const router   = useRouter();
  const hydrated = useSignUpStore.persist.hasHydrated();
  const state    = useSignUpStore();

  const [profileCreated, setProfileCreated] = useState<boolean>(false)

  useEffect(() => {
    if (!hydrated) return;

    (async () => {
      try {
        await signup(toSignupPayload(state));

        /* 🎉 Fire confetti */
        confetti({
          particleCount: 180,
          spread: 70,
          origin: { y: 0.6 },
        });
        setProfileCreated(true)
        /* ⏰ Redirect after 2 s */
        setTimeout(() => router.push('/home'), 3000);  // ← adjust path
      } catch (err) {
        console.error(err); // TODO: surface a user-friendly error
      }
    })();
  }, [hydrated, state, router]);

  return (
    <List className="h-screen flex flex-col items-center justify-center">
      <Placeholder
        header={
          <div className="flex justify-center items-center gap-2">
            
            
            {!profileCreated && <Spinner className='mx-0.5' size="m" /> }
            {profileCreated? `✅ ${t('profile_created')}` : `${t('verifying_data')}` }
          </div>
        }
        description={!profileCreated && t('may_it_take_a_second_please_wait')}
      />
    </List>
  );
}
