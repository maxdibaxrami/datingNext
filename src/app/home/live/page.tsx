'use client';
import { BlurIn } from '@/components/animation/BlurIn';
import { Page } from '@/components/Page';

export default function LivePage() {
  return (
    <Page back={false}>
      <BlurIn>Live Events</BlurIn>
      {/* TODO: Live video grid, upcoming mixers */}
    </Page>
  );
}
