'use client';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { List, Section, Textarea } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateProfileField } from '@/lib/api/profile';
import MainButton from '@/components/miniAppButtons/MainButton';
import SecondaryButton from '@/components/miniAppButtons/secondaryButton';
import { Page } from '@/components/Page';
import { themeParams, useSignal } from '@telegram-apps/sdk-react';

export default function EditBio() {
  const t = useTranslations('i18n');
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [bio, setBio] = useState<string>(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const tp = useSignal(themeParams.state);

  const save = async () => {
    try {
            setSaving(true);
      await updateProfileField('bio', bio);
      if (profile) setProfile({ ...profile, bio });
      router.back();
    } catch (err) {
      console.error('update bio', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page back={true}>
      <List className="flex flex-col p-4">
        <Section header={t('field.bio')}>
          <Textarea
            className="w-full border rounded p-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Section>
      </List>
      <MainButton isLoaderVisible={saving} isEnabled={!saving} text={t('button.save')} onClick={save} />
      <SecondaryButton textColor={tp.section_header_text_color} backgroundColor={tp.bottom_bar_bg_color} text={t('button.cancel')} onClick={() => router.back()} />
    </Page>
  );
}