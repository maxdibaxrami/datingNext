'use client';

import { Cell, List, Section, Selectable } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { getWhyYouAreHere } from '@/core/constant';
import { useSignUpStore } from '@/lib/stores/useSignUpStore';

type Props = { onValidChange?: (valid: boolean) => void };

export default function WhyYouAreHere({ onValidChange }: Props) {
  const t = useTranslations('i18n');
  const options = getWhyYouAreHere();
  
  const looking_for    = useSignUpStore(s => s.looking_for);
  const setlooking_for = useSignUpStore(s => s.setlooking_for);

  useEffect(() => onValidChange?.(looking_for !== null), [looking_for]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <List className="flex flex-col">
      <Section header={t('why_you_are_here')}>
        {options.map(({ key, name, description, icon }) => (
          <Cell
            key={key}
            Component="label"
            before={
              <Selectable
                name="group"
                value={name}
                checked={looking_for === name}
                onChange={() => setlooking_for(name)}
              />
            }
            description={t(description)}
            multiline
          >
            {t(key)} {icon}
          </Cell>
        ))}
      </Section>
    </List>
  );
}
