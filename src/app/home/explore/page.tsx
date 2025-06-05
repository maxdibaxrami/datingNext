'use client';

import { useEffect, useState, useCallback } from 'react';
import { Page } from '@/components/Page';
import {
  Card,
  Button,
  Chip,
  Subheadline,
  InlineButtons,
  IconButton,
  Modal,
} from '@telegram-apps/telegram-ui';
import { CardCell } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell';
import {
  CardChip,
} from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip';
import { fetchProfiles, DiscoverResult } from '@/lib/api/discover';
import { getIconForField } from '@/components/profileIcons';
import {
  FilterIcon,
  Gift,
  Heart,
  SidebarClose,
  Star,
  VerifiedIcon,
} from 'lucide-react';
import { InlineButtonsItem } from '@telegram-apps/telegram-ui/dist/components/Blocks/InlineButtons/components/InlineButtonsItem/InlineButtonsItem';
import { useTranslations } from 'next-intl';
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose';

const genders = ['male', 'female', 'non_binary', 'other'] as const;
const lookingForOpts = ['chat', 'casual', 'long_term', 'friends', 'virtual'] as const;

function ageFromDOB(dob?: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<DiscoverResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const t = useTranslations('i18n');

  // useCallback prevents recreating load() unless filters change
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProfiles(filters);
      setProfiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // initial fetch on mount
  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page back={false}>
      {/* Filters button */}
      <div className="fixed right-2 top-10 z-50 flex justify-end p-2">
        <IconButton
          mode="gray"
          size="m"
          onClick={() => setShowFilters(true)}
        >
          <FilterIcon />
        </IconButton>
      </div>

      {/* Profile cards */}
      <div className="px-2 flex flex-col gap-4">
        {profiles.map((p) => {
          const age = p.birth_date ? ageFromDOB(p.birth_date) : null;
          return (
            <Card key={p.id} className="overflow-hidden rounded-xl" type="plain">
              {p.image_url && (
                <img
                  src={p.image_url}
                  className="w-full object-cover aspect-square"
                  alt={p.name}
                />
              )}
              <CardChip>
                {[p.city, p.country].filter(Boolean).join(', ')}
              </CardChip>
              <CardCell readOnly description={p.bio}>
                <div className="flex items-center">
                  {p.name}
                  {age !== null ? `, ${age}` : ''}
                  {p.is_verified && (
                    <VerifiedIcon size={30} className="px-1" />
                  )}
                </div>
              </CardCell>

              <div className="flex px-4 flex-wrap gap-1 py-1">
                {p.looking_for && (
                  <Chip mode="mono" before={getIconForField('field.lookingFor')}>
                    {p.looking_for}
                  </Chip>
                )}
                {p.smoking && (
                  <Chip mode="mono" before={getIconForField('field.smoking')}>
                    {p.smoking}
                  </Chip>
                )}
                {p.drinking && (
                  <Chip mode="mono" before={getIconForField('field.drinking')}>
                    {p.drinking}
                  </Chip>
                )}
                {p.education && (
                  <Chip mode="mono" before={getIconForField('field.education')}>
                    {p.education}
                  </Chip>
                )}
              </div>

              <div className="px-4 py-2">
                <InlineButtons mode="bezeled">
                  <InlineButtonsItem text={t('Superlike')}>
                    <Star />
                  </InlineButtonsItem>
                  <InlineButtonsItem text={t('Send_Gift')}>
                    <Gift />
                  </InlineButtonsItem>
                  <InlineButtonsItem text={t('Add_to_Favorite')}>
                    <Heart />
                  </InlineButtonsItem>
                </InlineButtons>
              </div>
            </Card>
          );
        })}

        {loading && <p className="text-center">Loading...</p>}
      </div>

      {/* Filters Modal */}
      <Modal
        open={showFilters}
        onOpenChange={setShowFilters}      
        header={                                  
          <ModalHeader after={
            <ModalClose>
              <SidebarClose style={{ color: 'var(--tgui--plain_foreground)' }} />
            </ModalClose>
          }>
            {t('Filters')}
          </ModalHeader>
        }
        dismissible={true}                  
      >
        <div className="space-y-2 p-4">
          {/* City */}
          <div>
            <label className="block text-sm mb-1">{t('City')}</label>
            <input
              className="border w-full p-1"
              value={filters.city || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, city: e.target.value }))
              }
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm mb-1">{t('Country')}</label>
            <input
              className="border w-full p-1"
              value={filters.country || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, country: e.target.value }))
              }
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm mb-1">{t('Gender')}</label>
            <select
              className="border w-full p-1"
              value={filters.gender || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option value="">{t('Any')}</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {t(g)}
                </option>
              ))}
            </select>
          </div>

          {/* Looking for */}
          <div>
            <label className="block text-sm mb-1">{t('Looking_for')}</label>
            <select
              className="border w-full p-1"
              value={filters.looking_for || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, looking_for: e.target.value }))
              }
            >
              <option value="">{t('Any')}</option>
              {lookingForOpts.map((opt) => (
                <option key={opt} value={opt}>
                  {t(opt)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              size="s"
              type="secondary"
              onClick={() => setShowFilters(false)}  
            >
              {t('Cancel')}
            </Button>
            <Button
              size="s"
              onClick={() => {
                setShowFilters(false);
                load();                               {/* Apply fetches with updated filters */}
              }}
            >
              {t('Apply')}
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}
