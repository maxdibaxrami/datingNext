'use client';
import { Page } from '@/components/Page';
import { Accordion } from '@telegram-apps/telegram-ui';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { useTranslations } from 'next-intl';

export default function FAQPage() {
  const t = useTranslations('i18n');
  return (
    <Page back={true}>
      <div className="p-4">
        <h1 className="text-xl mb-4">{t('faqTitle')}</h1>
        <Accordion expanded onChange={function noRefCheck(){}}>
  <AccordionSummary>
    What is this app?
  </AccordionSummary>
  <AccordionContent>
    <div
      style={{
        padding: '10px 20px 20px'
      }}
    >
      Mull Mull is a dating app built for Telegram Mini Apps.
    </div>
  </AccordionContent>
            </Accordion>

            <Accordion expanded onChange={function noRefCheck(){}}>
            <AccordionSummary>
                How do I upgrade to premium?
            </AccordionSummary>
            <AccordionContent>
                <div
                style={{
                    padding: '10px 20px 20px'
                }}
                >
                You can upgrade from the profile page by selecting Go Premium.
                </div>
            </AccordionContent>
            </Accordion>

            <Accordion expanded onChange={function noRefCheck(){}}>
            <AccordionSummary>
                How do I earn points?
            </AccordionSummary>
            <AccordionContent>
                <div
                style={{
                    padding: '10px 20px 20px'
                }}
                >
                Complete daily tasks and interact with other users to earn points.
                </div>
            </AccordionContent>
            </Accordion>

            <Accordion expanded onChange={function noRefCheck(){}}>
            <AccordionSummary>
                How can I report an issue?
            </AccordionSummary>
            <AccordionContent>
                <div
                style={{
                    padding: '10px 20px 20px'
                }}
                >
                Please contact support via the Settings &gt; Help section.
                </div>
            </AccordionContent>
            </Accordion>

      </div>
    </Page>
  );
}