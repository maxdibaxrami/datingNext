'use client';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Cell, Chip, Input, List, Placeholder, Radio, Section, Selectable, Textarea } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
export default function SignUpFinalStep() {
  const t = useTranslations('i18n');
  
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
