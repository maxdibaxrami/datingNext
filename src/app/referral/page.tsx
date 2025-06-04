'use client';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { List, Cell, Section } from '@telegram-apps/telegram-ui';
import MainButton from '@/components/miniAppButtons/MainButton';
import { useTranslations } from 'next-intl';
import { getReferrals } from '@/lib/api';
import AddFriendsDialog from '@/components/AddFriendsDialog';
import EmptyData from '@/components/EmptyData';

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
      <div className="flex flex-col gap-4">
         {link && <AddFriendsDialog referral={link} />}

        <List>
          <Section header={t('invited_users')}>
            {users.length === 0 && <EmptyData/>}
            
            {users.length !== 0 && users.map(u => (
              <Cell key={u.id}>{u.name}</Cell>
            ))}
          </Section>
        </List>
      </div>
    </Page>
  );
}