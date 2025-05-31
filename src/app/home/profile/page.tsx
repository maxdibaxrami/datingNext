'use client';
import { BlurIn } from '@/components/animation/BlurIn';
import { Page } from '@/components/Page';

export default function ProfilePage() {
  return (
    <Page back={false}>
      <BlurIn>Your Profile</BlurIn>
      {/* TODO: Photo gallery, prompts, subscription settings */}
    </Page>
  );
}
