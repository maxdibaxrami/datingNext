'use client';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { List, Cell, Section } from '@telegram-apps/telegram-ui';
import MainButton from '@/components/miniAppButtons/MainButton';
import { useTranslations } from 'next-intl';
import { getReferrals } from '@/lib/api';

export default function ReferralPage() {
  const t = useTranslations('i18n');
  const [link, setLink] = useState('');
  const [users, setUsers] = useState<{id:string;name:string;referred_at:string}[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getReferrals();
        setLink(data.link);
        setUsers(data.referredUsers);
      } catch (e) {
        console.error('load referrals', e);
      }
    })();
  }, []);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ url: link });
      } else {
        await navigator.clipboard.writeText(link);
        alert(t('copy_link'));
      }
    } catch (e) {
      console.error('share', e);
    }
  };

  return (
    <Page back={true}>
      <div className="p-4 flex flex-col gap-4">
        <MainButton text={t('share_referral')} onClick={share} />
        <List>
          <Section header={t('invited_users')}>
            {users.map(u => (
              <Cell key={u.id}>{u.name}</Cell>
            ))}
          </Section>
        </List>
      </div>
    </Page>
  );
}