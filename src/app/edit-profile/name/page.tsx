'use client';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { List, Section } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateProfileField } from '@/lib/api/profile';
import MainButton from '@/components/miniAppButtons/MainButton';
import SecondaryButton from '@/components/miniAppButtons/secondaryButton';
import { Page } from '@/components/Page';

export default function EditName() {
  const t = useTranslations('i18n');
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [name, setName] = useState<string>(profile?.name ?? '');

  const save = async () => {
    try {
      await updateProfileField('name', name);
      if (profile) setProfile({ ...profile, name });
      router.back();
    } catch (err) {
      console.error('update name', err);
    }
  };

  return (
    <Page back={true}>
      <List className="flex flex-col p-4">
        <Section header={t('field.name')}>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Section>
      </List>
      <MainButton text={t('button.save')} onClick={save} />
      <SecondaryButton text={t('button.cancel')} onClick={() => router.back()} />
    </Page>
  );
}