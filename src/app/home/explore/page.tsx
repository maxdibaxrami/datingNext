'use client';
import { BlurIn } from '@/components/animation/BlurIn';
import { Page } from '@/components/Page';

export default function ExplorePage() {
  return (
    <Page back={false}>
      <BlurIn>Explore</BlurIn>
      {/* TODO: Filters, map view, topic collections */}
    </Page>
  );
}
