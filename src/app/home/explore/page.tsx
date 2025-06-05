'use client';

import { useEffect, useState, useCallback } from 'react';
import { Page } from '@/components/Page';
import {
  fetchProfiles,
  DiscoverResult,
} from '@/lib/api/discover';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from '@/lib/api/favorites';
import { sendGift, getGiftTypes, GiftType } from '@/lib/api/gifts';
import { sendSuperlike } from '@/lib/api/superlike';
import { useProfileStore } from '@/lib/stores/useProfileStore';

import { ProfileCard } from '@/components/ProfileCard';

import { IconButton } from '@telegram-apps/telegram-ui';  // ← Make sure to import this
import { FilterIcon } from 'lucide-react';            // ← And this!
import { SuperlikeModal } from '@/components/modal/SuperlikeModal';
import { FilterModal } from '@/components/modal/FilterModal';
import { GiftModal } from '@/components/modal/GiftModal';

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<DiscoverResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Gift modal
  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  const [giftFor, setGiftFor] = useState<string | null>(null);

  // Superlike modal
  const [confirmSuperlike, setConfirmSuperlike] = useState<string | null>(null);

  const updatePoints = useProfileStore((s) => s.updatePoints);

  // Fetch profiles whenever filters change
  const loadProfiles = useCallback(async () => {
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

  // On mount: fetch initial data + favorites + gift types
  useEffect(() => {
    loadProfiles();
    (async () => {
      try {
        const favs = await getFavorites();
        setFavoriteIds(new Set(favs.map((f) => f.id)));
        const types = await getGiftTypes();
        setGiftTypes(types);
      } catch (e) {
        console.error('init load', e);
      }
    })();
  }, [loadProfiles]);

  // Favorite handlers
  const handleAddFavorite = async (id: string) => {
    try {
      await addFavorite(id);
      setFavoriteIds((prev) => new Set(prev).add(id));
    } catch (e) {
      console.error('add favorite', e);
    }
  };
  const handleRemoveFavorite = async (id: string) => {
    try {
      await removeFavorite(id);
      setFavoriteIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (e) {
      console.error('remove favorite', e);
    }
  };

  // Superlike handler (passed into SuperlikeModal)
  const handleConfirmSuperlike = async (profileId: string) => {
    try {
      const { newPoints } = await sendSuperlike(profileId);
      updatePoints(newPoints);
    } catch (e) {
      console.error('superlike', e);
    }
  };

  // Gift handler (passed into GiftModal)
  const handleSendGift = async (profileId: string, giftId: number) => {
    try {
      await sendGift(profileId, giftId);
    } catch (e) {
      console.error('send gift', e);
    }
  };

  return (
    <Page back={false}>
      {/* “Open Filters” floating button */}
      <div className="fixed right-2 top-10 z-50 flex justify-end p-2">
        <IconButton
          mode="gray"
          size="m"
          onClick={() => setShowFilters(true)}
        >
          <FilterIcon />
        </IconButton>
      </div>

      {/* The list of profile cards */}
      <div className="px-2 flex flex-col gap-4">
        {profiles.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            isFavorite={favoriteIds.has(p.id)}
            onAddFavorite={handleAddFavorite}
            onRemoveFavorite={handleRemoveFavorite}
            onSuperlike={(id) => setConfirmSuperlike(id)}
            onSendGift={(id) => setGiftFor(id)}
          />
        ))}
        {loading && <p className="text-center">Loading...</p>}
      </div>

      {/* 1) Filter modal */}
      <FilterModal
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        onApply={loadProfiles}
      />

      {/* 2) Superlike modal */}
      <SuperlikeModal
        open={confirmSuperlike}
        onClose={() => setConfirmSuperlike(null)}
        onConfirm={handleConfirmSuperlike}
      />

      {/* 3) Gift modal */}
      <GiftModal
        open={giftFor}
        onClose={() => setGiftFor(null)}
        giftTypes={giftTypes}
        onSend={handleSendGift}
      />
    </Page>
  );
}
