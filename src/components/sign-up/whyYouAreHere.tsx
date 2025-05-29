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
  
  const reason    = useSignUpStore(s => s.reason);
  const setReason = useSignUpStore(s => s.setReason);

  useEffect(() => onValidChange?.(reason !== null), [reason]);
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
                checked={reason === name}
                onChange={() => setReason(name)}
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
