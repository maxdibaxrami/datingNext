'use client';

import { Section, Cell, Image, List, Spinner } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';

import { Link } from '@/components/Link/Link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher/LocaleSwitcher';
import { Page } from '@/components/Page';

import tonSvg from './_assets/ton.svg';
import { useEffect } from 'react';
import { useLoginOrRegister } from '@/hooks/useLoginOrRegister';
import { initData, useSignal } from '@telegram-apps/sdk-react';

export default function Home() {
  const t = useTranslations('i18n');
  const initDataUser = useSignal(initData.user);
  //@ts-ignore
  const { error } = useLoginOrRegister(`telegram${initDataUser?.id}@gmail.com`, initDataUser.id.toString())

  // 2) If there was an error during sign-in or sign-up, show it
  if (error) {
    console.log(error)
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'red',
          padding: '1rem',
        }}
      >
        <h2>Authentication Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <Page back={false}>
      <List>
        <Section
          className='flex items-center justify-center h-screen p-2'
          >
          <Spinner className='p-2' size="l" />

        </Section>
   
      </List>
    </Page>
  );
}
