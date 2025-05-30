'use client';
import { signup } from '@/lib/api/signup';
import { useSignUpStore } from '@/lib/stores/useSignUpStore';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Cell, Chip, Input, List, Placeholder, Radio, Section, Selectable, Textarea } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
export default function SignUpFinalStep() {
  const t = useTranslations('i18n');
  
   async function handleSubmit() {
    try {
      await signup(useSignUpStore.getState());
      console.log(useSignUpStore.getState())
      // Logged-in user now has a profile → router.push('/')
    } catch (err) {
      // err is ApiProblem – surface fieldErrors etc.
    }
  }
  useEffect(()=>{
      handleSubmit()
  },[])
  
  return (
        <List className='h-screen flex flex-col items-center justify-center'>
               <Placeholder
                    description={t('may_it_take_a_second_please_wait')}
                    header={t("verifying_data")}
                >
                </Placeholder>
        </List>
   
  );      

}
