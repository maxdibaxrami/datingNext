'use client';
import { BlurIn } from '@/components/animation/BlurIn';
import { Page } from '@/components/Page';

export default function MatchesPage() {
  return (
    <Page back={false}>
      <BlurIn>Matches</BlurIn>
      {/* TODO: Conversations list / incoming likes */}
    </Page>
  );
}