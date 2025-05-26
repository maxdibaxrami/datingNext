'use client';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Cell, Chip, Input, List, Placeholder, Radio, Section, Selectable, Textarea } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
export default function SignUpFinalStep() {
  const t = useTranslations('i18n');
  
  return (
        <List className='h-screen flex flex-col'>
               <Placeholder
                    description={t('may_it_take_a_while_please_wait')}
                    header={t('uploading')}
                >
                    <DotLottieReact
                      src="/animations/uploadAnimation.lottie"
                      loop
                      autoplay
                      style={{
                        width: 350,    // pixels
                        height: 350,   // pixels
                      }}
                    />
                </Placeholder>

        </List>
   
  );      

}
