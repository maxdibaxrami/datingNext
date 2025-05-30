'use client';
import { signup } from '@/lib/api/signup';
import { useSignUpStore } from '@/lib/stores/useSignUpStore';
import { toSignupPayload } from '@/lib/stores/serializeForSignup';
import { Placeholder, List } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function SignUpFinalStep() {
  const t = useTranslations('i18n');

  /** Zustand persist is async; wait until it’s ready */
  const hasHydrated = useSignUpStore.persist.hasHydrated();
  const state       = useSignUpStore();

  useEffect(() => {
    if (!hasHydrated) return;               // guard 🔑

    async function submit() {
      try {
        await signup(toSignupPayload(state));
        // e.g. router.push('/') …
      } catch (err) {
        /* surface API errors */
        console.error(err);
      }
    }

    submit();
  }, [hasHydrated, state]);

  return (
    <List className="h-screen flex flex-col items-center justify-center">
      <Placeholder
        header={t('verifying_data')}
        description={t('may_it_take_a_second_please_wait')}
      />
    </List>
  );
}
