'use client';

import {
  Card,

  Avatar,
  Badge,
  InlineButtons,
  Chip,
} from '@telegram-apps/telegram-ui';
import { Gift, Heart, Star, VerifiedIcon } from 'lucide-react';
import { getIconForField } from '@/components/profileIcons';
import type { DiscoverResult } from '@/lib/api/discover';
import { CardChip } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip';
import { CardCell } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell';
import { InlineButtonsItem } from '@telegram-apps/telegram-ui/dist/components/Blocks/InlineButtons/components/InlineButtonsItem/InlineButtonsItem';

type ProfileCardProps = {
  profile: DiscoverResult;
  isFavorite: boolean;
  onAddFavorite: (id: string) => void;
  onRemoveFavorite: (id: string) => void;
  onSuperlike: (id: string) => void;
  onSendGift: (id: string) => void;
};

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

export function ProfileCard({
  profile: p,
  isFavorite,
  onAddFavorite,
  onRemoveFavorite,
  onSuperlike,
  onSendGift,
}: ProfileCardProps) {
  const age = ageFromDOB(p.birth_date);

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
        <div className="flex items-center space-x-1">
          <span>
            {p.name}
            {age !== null ? `, ${age}` : ''}
          </span>
          {p.is_verified && <VerifiedIcon size={24} className="text-blue-500" />}
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
          <InlineButtonsItem text="Superlike" onClick={() => onSuperlike(p.id)}>
            <Star />
          </InlineButtonsItem>

          <InlineButtonsItem text="Send_Gift" onClick={() => onSendGift(p.id)}>
            <Gift />
          </InlineButtonsItem>

          {isFavorite ? (
            <InlineButtonsItem text="Remove_Favorite" onClick={() => onRemoveFavorite(p.id)}>
              <Heart className="text-red-500" />
            </InlineButtonsItem>
          ) : (
            <InlineButtonsItem text="Add_to_Favorite" onClick={() => onAddFavorite(p.id)}>
              <Heart />
            </InlineButtonsItem>
          )}
        </InlineButtons>
      </div>
    </Card>
  );
}
