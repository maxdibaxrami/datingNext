'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Page } from '@/components/Page';

import { 
  Cell, 
  List, 
  Section, 
  Text, 
  Subheadline 
} from '@telegram-apps/telegram-ui';

import { Image } from '@telegram-apps/telegram-ui';

import {
  ChevronLeft,
  ChevronRight,
  PenBoxIcon,
  Crown,
  UserPlus,
  Star,
  Gift,
  Settings,
  HelpCircle,
  Globe,
  Layout,
} from 'lucide-react';

import { useTranslations } from 'next-intl';
import { ColoredIcon } from '@/components/ColoredIcon';


// 1️⃣ Import the photo store and UserImage type
import { usePhotoStore } from '@/lib/stores/usePhotoStore';
import { UserImage } from '@/type/userImage';

// Zustand profile store
import { useProfileStore } from '@/lib/stores/useProfileStore';
import { useRouter } from 'next/navigation';

function useDirection() {
  const activeLocale = useLocale() as string;
  const [isRtl, setIsRtl] = useState<boolean>(
    ['ar', 'fa'].includes(activeLocale)
  );

  useEffect(() => {
    setIsRtl(['ar', 'fa'].includes(activeLocale));
  }, [activeLocale]);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl]);

  return isRtl;
}

function ChevronByDirection({ isRtl }: { isRtl: boolean }) {
  return isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />;
}

function calculateAge(birthDateString: string): number {
  const today = new Date();
  const birth = new Date(birthDateString);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function ProfilePage() {
  const t = useTranslations('i18n');
  const isRtl = useDirection();
  const router = useRouter();

  // 2️⃣ Read profile and photos from Zustand
  const profile = useProfileStore((state) => state.profile);
  const photos  = usePhotoStore((state) => state.photos);

  const [age, setAge] = useState<number | null>(null);

  // Compute age from birth_date
  useEffect(() => {
    if (profile && profile.birth_date) {
      setAge(calculateAge(profile.birth_date));
    }
  }, [profile]);

  // If profile isn’t loaded yet, show a basic loading state
  if (!profile) {
    return (
      <Page back={false}>
        <div className="flex items-center justify-center h-64">
          <Text weight="2">Loading profile…</Text>
        </div>
      </Page>
    );
  }

  return (
    <Page back={false}>
      {/* ============================ */}
      {/* 1. Top Avatar & Name       */}
      {/* ============================ */}
      <div className="flex flex-col items-center justify-center">
        <Image
          size={96}
          src={
            // If your Profile type has an avatar_url, use that instead of placeholder
            photos[0].small_url || undefined
          }
        />
        <Subheadline level="1" weight="1" className="mt-2">
          {profile.name}
          {age !== null ? `, ${age}` : ''}
        </Subheadline>
      </div>

      {/* ============================ */}
      {/* 3. Bottom List              */}
      {/* ============================ */}
      <div className="mt-2">
        <List
          style={{
            background: 'var(--tgui--secondary_bg_color)',
            borderRadius: 8,
            paddingBottom: 8,
          }}
        >
          <Section>
            {/* Edit Profile (Turquoise #33C2BA) */}
            <Cell
              onClick={()=> router.push("/edit-profile")}
              before={
                <ColoredIcon color="#33C2BA">
                  <PenBoxIcon size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('editProfile')}
            </Cell>
          </Section>

          <Section header={t('main')}>
            {/* Premium (Gold #FF7A85) */}
            <Cell
              before={
                <ColoredIcon color="#FF7A85">
                  <Crown size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('labelPremium')}
            </Cell>

            {/* Referral (Deep Sky Blue #4ADE80) */}
            <Cell
              before={
                <ColoredIcon color="#4ADE80">
                  <UserPlus size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('labelReferral')}
            </Cell>

            {/* Score (Hot Pink #EF4444) */}
            <Cell
              before={
                <ColoredIcon color="#EF4444">
                  <Star size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('labelScore')}
            </Cell>
          </Section>

          <Section header={t('More')}>
            {/* Gift List (Blue Violet #8A2BE2) */}
            <Cell
              before={
                <ColoredIcon color="#8A2BE2">
                  <Gift size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('labelGiftList')}
            </Cell>

            {/* Settings (Teal #20B2AA) */}
            <Cell
              before={
                <ColoredIcon color="#20B2AA">
                  <Settings size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('labelSettings')}
            </Cell>

            {/* FAQ (Orange Red #FF4500) */}
            <Cell
              before={
                <ColoredIcon color="#FF4500">
                  <HelpCircle size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('labelFAQ')}
            </Cell>

            {/* Language Support (Lime Green #32CD32) */}
            <Cell
              before={
                <ColoredIcon color="#32CD32">
                  <Globe size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('labelLanguage')}
            </Cell>

            {/* Appearance (Telegram Blue #229ED9) */}
            <Cell
              before={
                <ColoredIcon color="#229ED9">
                  <Layout size={23} color="white" strokeWidth={2} />
                </ColoredIcon>
              }
              after={<ChevronByDirection isRtl={isRtl} />}
            >
              {t('labelAppearance')}
            </Cell>
          </Section>
        </List>
      </div>
    </Page>
  );
}
