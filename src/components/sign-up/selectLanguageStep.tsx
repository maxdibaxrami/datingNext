'use client';

import { useEffect, useState, useCallback } from 'react';

import { LocaleSwitcher } from '../LocaleSwitcher/LocaleSwitcher';
import { SparklesText } from '../animation/spark-text';
import { Locale } from '@/core/i18n/types';
import { useTranslations } from 'next-intl';
import { Subheadline } from '@telegram-apps/telegram-ui';

type Props = {
  /** Informs the parent when the whole form becomes valid / invalid. */
  onValidChange?: (valid: boolean) => void;
};

export default function SelectLanguage({ onValidChange }: Props) {
  const [picked, setPicked] = useState(true);
  const t = useTranslations('i18n');

  /* propagates validity upward whenever it changes */
  useEffect(() => onValidChange?.(picked), [picked]);

  /* single callback passed down to LocaleSwitcher */
  const handleSelect = useCallback((_locale: Locale) => setPicked(true), []);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-8">
      <SparklesText className="text-5xl" text="Mull Mull !" />
       <Subheadline
          level="1"
          weight="3"
          className='text-center px-3'
        >
          {t("login_description")}
        </Subheadline>
      <LocaleSwitcher onSelect={handleSelect} />
    </div>
  );
}
