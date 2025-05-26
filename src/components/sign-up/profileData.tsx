'use client';

import {
  Chip, Input, List, Radio, Section, Textarea,
} from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo, useEffect, ChangeEvent } from 'react';
import { useSignUpStore } from '@/lib/stores/useSignUpStore';
import { shallow } from 'zustand/shallow';

const YEAR_MIN = 1900;
const YEAR_MAX = new Date().getFullYear();

type Props = { onValidChange?: (valid: boolean) => void };

export default function ProfileData({ onValidChange }: Props) {
  const t = useTranslations('i18n');

  // ⬇ pull only once with shallow to avoid selector loops
  const gender    = useSignUpStore(s => s.gender);
   const name      = useSignUpStore(s => s.name);
   const bio       = useSignUpStore(s => s.bio);
   const dob       = useSignUpStore(s => s.dob);

   const setGender = useSignUpStore(s => s.setGender);
   const setName   = useSignUpStore(s => s.setName);
   const setBio    = useSignUpStore(s => s.setBio);
   const setDOB    = useSignUpStore(s => s.setDOB);

  const restrictToDigits = useCallback(
    (max: number) => (e: ChangeEvent<HTMLInputElement>) =>
      e.target.value.slice(0, max).replace(/[^0-9]/g, ''),
    []
  );

  const isValidDate = useMemo(() => {
    const d = Number(dob.day), m = Number(dob.month), y = Number(dob.year);
    if ([d,m,y].some(isNaN) || y < YEAR_MIN || y > YEAR_MAX || m < 1 || m > 12 || d < 1 || d > 31)
      return false;
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear()===y && dt.getMonth()===m-1 && dt.getDate()===d;
  }, [dob]);

  const validName = useMemo(() => name.trim().length >= 2 && name.trim().length <= 15, [name]);
  const validBio  = useMemo(() => bio.trim().length  >= 3 && bio.trim().length  <= 100, [bio]);
  const isStepValid = validName && validBio && isValidDate && gender !== null;

  // ↘︎ effect only watches the boolean
  useEffect(() => onValidChange?.(isStepValid), [isStepValid]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <List className="h-screen flex flex-col gap-4 p-2">
      <Section header={t('Iam')}>
        <div className="flex gap-2 p-2">
          {(['male','female'] as const).map(g => (
            <Chip
              key={g}
              mode="mono"
              className="w-full"
              Component="label"
              before={<Radio checked={gender === g} name="gender" onChange={() => setGender(g)} />}
            >
              {t(g === 'male' ? 'Male' : 'Female')}
            </Chip>
          ))}
        </div>
      </Section>

      <Section 
        header={t('Fillprofiledata')}
        footer={<>
         {!validName && name && (
          <p className="text-xs text-red-500 pt-1">
            {t('name_length_error') || 'Name must be 2–15 chars.'}
          </p>
        )}

        {!validBio && bio && (
          <p className="text-xs text-red-500 pt-1">
            {t('bio_length_error') || 'Bio must be 3–100 chars.'}
          </p>
        )}

        </>}    
      >
        <Input
          placeholder={t('name')}
          value={name}
          onChange={e => setName(e.target.value)}
        />
       

        <Textarea
          placeholder={t('EnteryourBio')}
          value={bio}
          onChange={e => setBio(e.target.value)}
        />

      </Section>

      <Section
        header={t('enter_date_of_birth')}
        footer={
          !isValidDate && (dob.day||dob.month||dob.year) && (
            <p className="text-xs text-red-500 pt-1">
              {t('invalid_dob') || 'Enter a valid date of birth.'}
            </p>
          )
        }
      >
        <div className="flex">
          <Input
            placeholder={t('day')}
            value={dob.day}
            onChange={e => setDOB({ day: restrictToDigits(2)(e) })}
          />
          <Input
            placeholder={t('month')}
            value={dob.month}
            onChange={e => setDOB({ month: restrictToDigits(2)(e) })}
          />
          <Input
            placeholder={t('year')}
            value={dob.year}
            onChange={e => setDOB({ year: restrictToDigits(4)(e) })}
          />
        </div>
      </Section>
    </List>
  );
}
