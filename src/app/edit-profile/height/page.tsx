'use client';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { List, Section } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import MainButton from '@/components/miniAppButtons/MainButton';
import SecondaryButton from '@/components/miniAppButtons/secondaryButton';
import { Page } from '@/components/Page';

export default function EditHeight() {
  const t = useTranslations('i18n');
  const router = useRouter();
  const profile = useProfileStore(s => s.profile);
  const setProfile = useProfileStore(s => s.setProfile);
  const [height, setHeight] = useState<number>(profile?.height_cm ?? 170);

  const save = async () => {
    try {
      await axios.post('/api/profile/update-field', { field: 'height_cm', value: height });
      if (profile) setProfile({ ...profile, height_cm: height });
      router.back();
    } catch (err) {
      console.error('update height', err);
    }
  };

  return (
    <Page back>
      <List className="flex flex-col p-4">
        <Section header={t('field.height')}>
          <input
            type="range"
            min={100}
            max={250}
            value={height}
            onChange={e => setHeight(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center mt-2">{height} cm</div>
        </Section>
      </List>
      <MainButton text={t('button.save')} onClick={save} />
      <SecondaryButton text={t('button.cancel')} onClick={() => router.back()} />
    </Page>
  );
}
