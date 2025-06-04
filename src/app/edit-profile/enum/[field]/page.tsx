'use client';
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { List, Section, Cell, Selectable } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { updateProfileField } from '@/lib/api/profile';
import { Page } from '@/components/Page';

const optionsMap: Record<string, string[]> = {
  gender: ['male', 'female', 'non_binary', 'other'],
  smoking: ['no', 'occasionally', 'regularly'],
  drinking: ['no', 'socially', 'regularly'],
  education: ['high_school', 'bachelors', 'masters', 'phd', 'other'],
  children: ['no', 'yes_fulltime', 'yes_parttime', 'want_some_day'],
  relationship_status: ['single','divorced','widowed','separated','in_relationship','open_relationship'],
  looking_for: ['chat','casual','long_term','friends','virtual'],
  religion: ['atheist','agnostic','christian','muslim','jewish','hindu','buddhist','spiritual','other'],
  zodiac: ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'],
  pets: ['none','dog','cat','other','many'],
};

export default function EnumEditPage({ params }: any) {
  const { field } = params;
  const t = useTranslations('i18n');
  const router = useRouter();
  const profile = useProfileStore(s => s.profile);
  const setProfile = useProfileStore(s => s.setProfile);
  const [saving, setSaving] = useState(false);

  const options = optionsMap[field];

  const handleSelect = useCallback(async (val: string) => {
    try {
      setSaving(true);
      updateProfileField(field, val);
      if (profile) setProfile({ ...profile, [field]: val } as any);
      router.back();

    } catch (err) {
      console.error('update field error', err);
    }finally {
      setSaving(false);
    }
  }, [field, profile, setProfile, router]);

  if (!options) return <p>Unknown field</p>;
  const current = (profile as any)?.[field] ?? null;

  return (
    <Page back={true}>   
        <List className="flex flex-col">
        <Section header={t(`field.${field}`)}>
            {options.map(opt => (
            <Cell key={opt}
                Component="label"
                before={
                <Selectable
                    name="enum"
                    checked={current === opt}
                    onChange={() => handleSelect(opt)}
                />
                }
            >
                {t(opt)}
            </Cell>
            ))}
        </Section>
        </List>
    </Page>
  );
}