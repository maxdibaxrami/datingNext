'use client';

import { FC, useEffect, useState } from 'react';
import { Section, List, Cell, Image, Radio } from '@telegram-apps/telegram-ui';
import { useLocale, useTranslations } from 'next-intl';

import { localesMap } from '@/core/i18n/config';
import { setLocale } from '@/core/i18n/locale';
import { Locale } from '@/core/i18n/types';
import { FontHandller } from './fontHandler';
import { useSignUpStore } from '@/lib/stores/useSignUpStore';

type Props = {
  /** Fires each time the user explicitly selects a language. */
  onSelect?: (locale: Locale) => void;
};

export const LocaleSwitcher: FC<Props> = ({ onSelect }) => {
  const activeLocale = useLocale() as Locale;
  const [selectedLang, setSelectedLang] = useState<Locale>(activeLocale);
  const setLanguage = useSignUpStore(s => s.setLanguage);

  const t = useTranslations('i18n');

  /* keep local state in sync with external locale changes */
  useEffect(() => setSelectedLang(activeLocale), [activeLocale]);

  /* apply side-effects when selection changes */
  useEffect(() => {
    if (selectedLang !== activeLocale) {
      setLocale(selectedLang);
      document.documentElement.lang = selectedLang;
      document.documentElement.dir = ['ar', 'fa'].includes(selectedLang) ? 'rtl' : 'ltr';
      onSelect?.(selectedLang);          // ★ notify parent
      setLanguage(selectedLang);
    }
    FontHandller();
  }, [selectedLang, activeLocale]);

  return (
    <List>
      <Section header={t('Selectlanguageforcontinue')} footer={t('privacy_policy')}>
        {localesMap.map(({ key, title, flag }) => (
          <Cell
            key={key}
            before={flag && <Image src={flag} width={24} height={24} alt={key} />}
            after={<Radio checked={selectedLang === key} />}
            onClick={() => setSelectedLang(key as Locale)}
            className="py-2"
          >
            {title}
          </Cell>
        ))}
      </Section>
    </List>
  );
};
