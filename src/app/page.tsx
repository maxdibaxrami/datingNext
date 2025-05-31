'use client';

import { Section, Cell, Image, List } from '@telegram-apps/telegram-ui';
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
  const { user, loading, error } = useLoginOrRegister(`telegram${initDataUser?.id}@gmail.com`, initDataUser.id.toString())

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <p>Authenticating…</p>
        {/* You can replace this with a spinner component if desired */}
      </div>
    )
  }

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
          header="Features"
          footer="You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects"
        >
          <Link href="/ton-connect">
            <Cell
              before={
                <Image
                  src={tonSvg.src}
                  style={{ backgroundColor: '#007AFF' }}
                  alt="TON Logo"
                />
              }
              subtitle="Connect your TON wallet"
            >
              TON Connect
            </Cell>
          </Link>
        </Section>
        <Section
          header="Application Launch Data"
          footer="These pages help developer to learn more about current launch information"
        >
          <Link href="/init-data">
            <Cell subtitle="User data, chat information, technical data">
              Init Data
            </Cell>
          </Link>
          <Link href="/launch-params">
            <Cell subtitle="Platform identifier, Mini Apps version, etc.">
              Launch Parameters
            </Cell>
          </Link>
          <Link href="/theme-params">
            <Cell subtitle="Telegram application palette information">
              Theme Parameters
            </Cell>
          </Link>

          <Link href="/sign-up">
            <Cell subtitle="Telegram application palette information">
              sign up
            </Cell>
          </Link>
        </Section>

        
        <Section header={t('header')} footer={t('footer')}>
          <LocaleSwitcher />
        </Section>
      </List>
    </Page>
  );
}
