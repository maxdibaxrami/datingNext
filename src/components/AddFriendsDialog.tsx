'use client';
import { shareURL } from '@telegram-apps/sdk-react';
import { useTranslations } from 'next-intl';
import MainButton from './miniAppButtons/MainButton';

interface Props {
  referral: string;
}

export default function AddFriendsDialog({ referral }: Props) {
  const t = useTranslations('i18n');

  const handleShare = () => {
    if (shareURL && referral) {
      try {
        shareURL(referral, t('share_link'));
      } catch (e) {
        console.error('shareURL error', e);
      }
    } else {
      console.error('shareURL is not available or referral data is missing');
    }
  };

  return <MainButton text={t('share_referral')} onClick={handleShare} />;
}