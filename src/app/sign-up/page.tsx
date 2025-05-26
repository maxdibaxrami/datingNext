'use client';

import { Steps } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import React, { useState, useCallback, useMemo } from 'react';

import { Page } from '@/components/Page';
import MainButton from '@/components/miniAppButtons/MainButton';
import SecondaryButton from '@/components/miniAppButtons/secondaryButton';
import SelectLanguage from '@/components/sign-up/selectLanguageStep';
import ProfileData from '@/components/sign-up/profileData';
import WhyYouAreHere from '@/components/sign-up/whyYouAreHere';
import UploadImageStep from '@/components/sign-up/uploadImage';
import SignUpFinalStep from '@/components/sign-up/finalStep';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { SparklesText } from '@/components/animation/spark-text';

enum Step {
  Language,
  Profile,
  Reason,
  Photos,
  Final,
}

const stepCount = Object.values(Step).filter(v => typeof v === 'number').length;

export default function SignUp() {
  const t = useTranslations('i18n');
  const [active, setActive] = useState<Step>(Step.Language);
  const [isValidArr, setIsValidArr] = useState<boolean[]>(Array(stepCount).fill(false));
  const lp = useLaunchParams();

  const markValid = useCallback((idx: Step, val: boolean) => {
    setIsValidArr(prev => {
      if (prev[idx] === val) return prev;
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }, []);

  const onValid = useMemo(
    () => Array.from({ length: stepCount }, (_, i) => (v: boolean) => markValid(i as Step, v)),
    [markValid]
  );

  const canGoNext = isValidArr[active] || active === Step.Final;

  return (
    <Page back={false}>
      {
        active !== Step.Language ?
        ['android', 'ios'].includes(lp.platform as string) ? 
          <div className="fixed top-0 w-full flex items-center justify-center top-bar-height safe-area-top text-center"> 
            <SparklesText sparklesCount={5} className="text-xl" text="FACE MATCH" /> 
          </div> 
          :
          <div style={{marginTop:"20px", height:"20px"}} className="flex w-full items-center justify-center text-center"> 
            <SparklesText sparklesCount={5} className="text-xl" text="FACE MATCH" /> 
          </div> 
        :
        null
        }
      {active !== Step.Language && active !== Step.Final && <Steps count={stepCount -2} progress={active} /> }

      {active === Step.Language && <SelectLanguage   onValidChange={onValid[Step.Language]} />}
      {active === Step.Profile  && <ProfileData      onValidChange={onValid[Step.Profile]}  />}
      {active === Step.Reason   && <WhyYouAreHere    onValidChange={onValid[Step.Reason]}   />}
      {active === Step.Photos   && <UploadImageStep onValidChange={onValid[Step.Photos]}   />}
      {active === Step.Final    && <SignUpFinalStep /> }

      <MainButton
        text={t('next')}
        backgroundColor={canGoNext ? "#1FB6A8" : "#20807D"}
        textColor="#FFFFFF"
        hasShineEffect={canGoNext}
        isEnabled={canGoNext}
        onClick={() => canGoNext && setActive(prev => prev < Step.Final ? (prev + 1) as Step : prev)}
      />

      <SecondaryButton
        text={t('previous')}
        backgroundColor="#000000"
        textColor="#FFFFFF"
        hasShineEffect={false}
        isVisible={active > Step.Language}
        onClick={() => setActive(prev => prev > Step.Language ? (prev - 1) as Step : prev)}
      />
    </Page>
  );
}
