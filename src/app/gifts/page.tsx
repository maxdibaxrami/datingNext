'use client';
import { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import { List, Cell, Section } from '@telegram-apps/telegram-ui';
import { getGifts, Gift } from '@/lib/api/gifts';
import EmptyData from '@/components/EmptyData';
import { useTranslations } from 'next-intl';

export default function GiftsPage() {
  const t = useTranslations('i18n');
  const [gifts, setGifts] = useState<Gift[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getGifts();
        setGifts(data);
      } catch (e) {
        console.error('load gifts', e);
      }
    })();
  }, []);

  return (
    <Page back={true}>
      <div className="flex flex-col gap-4">
        <List>
          <Section header={t('giftListTitle')}>
            {gifts.length === 0 && <EmptyData text={t('noGifts')} />}
            {gifts.map((g) => (
              <Cell
                key={g.id}
                before={g.type.media_url ? (
                  <img src={g.type.media_url} alt={g.type.name} className="w-8 h-8 rounded" />
                ) : undefined}
                subtitle={`${t('giftSender')} ${g.sender_name}`}
              >
                {g.type.name}
              </Cell>
            ))}
          </Section>
        </List>
      </div>
    </Page>
  );
}