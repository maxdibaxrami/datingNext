'use client';
import { BlurIn } from '@/components/animation/BlurIn';
import { Page } from '@/components/Page';

export default function DiscoverPage() {
  return (
    <Page back={false}>
      <BlurIn>Discover</BlurIn>
      {/* TODO: Inject card‑stack of profiles here */}
    </Page>
  );
}