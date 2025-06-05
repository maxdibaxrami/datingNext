'use client';

import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Subheadline,
} from '@telegram-apps/telegram-ui';
import { SidebarClose } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose';

type FilterModalProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  filters: Record<string, string>;
  setFilters: Dispatch<SetStateAction<Record<string, string>>>;
  onApply: () => void;
};

const genders = ['male', 'female', 'non_binary', 'other'] as const;
const lookingForOpts = ['chat', 'casual', 'long_term', 'friends', 'virtual'] as const;
const relationshipStatuses = [
  'single',
  'divorced',
  'widowed',
  'separated',
  'in_relationship',
  'open_relationship',
] as const;
const educationOpts = ['high_school', 'bachelors', 'masters', 'phd', 'other'] as const;
const smokingOpts = ['no', 'occasionally', 'regularly'] as const;
const drinkingOpts = ['no', 'socially', 'regularly'] as const;
const childrenOpts = ['no', 'yes_fulltime', 'yes_parttime', 'want_some_day'] as const;
const zodiacOpts = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;
const petsOpts = ['none', 'dog', 'cat', 'other', 'many'] as const;

export function FilterModal({
  open,
  onOpenChange,
  filters,
  setFilters,
  onApply,
}: FilterModalProps) {
  const t = useTranslations('i18n');

  // We can locally replicate the filters object so that “Cancel” truly reverts changes:
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(filters);

  useEffect(() => {
    if (open) {
      // When the modal opens, initialize with parent’s filters
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleCancel = () => {
    onOpenChange(false);
    // Discard local edits—parent’s filters remain unchanged
    setLocalFilters(filters);
  };

  const handleApply = () => {
    setFilters(localFilters);
    onOpenChange(false);
    onApply(); // Parent will re‐fetch profiles
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      header={
        <ModalHeader
          after={
            <ModalClose>
              <SidebarClose style={{ color: 'var(--tgui--plain_foreground)' }} />
            </ModalClose>
          }
        >
          {t('Filters')}
        </ModalHeader>
      }
      dismissible
    >
      <div className="space-y-4 p-4">
        {/* City */}
        <div>
          <label className="block text-sm mb-1">{t('City')}</label>
          <input
            className="border w-full p-1 rounded"
            value={localFilters.city || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, city: e.target.value }))
            }
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm mb-1">{t('Country')}</label>
          <input
            className="border w-full p-1 rounded"
            value={localFilters.country || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, country: e.target.value }))
            }
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm mb-1">{t('Gender')}</label>
          <select
            className="border w-full p-1 rounded"
            value={localFilters.gender || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, gender: e.target.value }))
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
            className="border w-full p-1 rounded"
            value={localFilters.looking_for || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                looking_for: e.target.value,
              }))
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

        {/* Relationship status */}
        <div>
          <label className="block text-sm mb-1">{t('relationship_status')}</label>
          <select
            className="border w-full p-1 rounded"
            value={localFilters.relationship_status || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                relationship_status: e.target.value,
              }))
            }
          >
            <option value="">{t('Any')}</option>
            {relationshipStatuses.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </select>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm mb-1">{t('Education')}</label>
          <select
            className="border w-full p-1 rounded"
            value={localFilters.education || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, education: e.target.value }))
            }
          >
            <option value="">{t('Any')}</option>
            {educationOpts.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </select>
        </div>

        {/* Smoking */}
        <div>
          <label className="block text-sm mb-1">{t('smoking')}</label>
          <select
            className="border w-full p-1 rounded"
            value={localFilters.smoking || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, smoking: e.target.value }))
            }
          >
            <option value="">{t('Any')}</option>
            {smokingOpts.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </select>
        </div>

        {/* Drinking */}
        <div>
          <label className="block text-sm mb-1">{t('drinking')}</label>
          <select
            className="border w-full p-1 rounded"
            value={localFilters.drinking || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, drinking: e.target.value }))
            }
          >
            <option value="">{t('Any')}</option>
            {drinkingOpts.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </select>
        </div>

        {/* Children */}
        <div>
          <label className="block text-sm mb-1">{t('children')}</label>
          <select
            className="border w-full p-1 rounded"
            value={localFilters.children || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, children: e.target.value }))
            }
          >
            <option value="">{t('Any')}</option>
            {childrenOpts.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </select>
        </div>

        {/* Zodiac */}
        <div>
          <label className="block text-sm mb-1">{t('zodiac')}</label>
          <select
            className="border w-full p-1 rounded"
            value={localFilters.zodiac || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, zodiac: e.target.value }))
            }
          >
            <option value="">{t('Any')}</option>
            {zodiacOpts.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </select>
        </div>

        {/* Pets */}
        <div>
          <label className="block text-sm mb-1">{t('pets')}</label>
          <select
            className="border w-full p-1 rounded"
            value={localFilters.pets || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, pets: e.target.value }))
            }
          >
            <option value="">{t('Any')}</option>
            {petsOpts.map((opt) => (
              <option key={opt} value={opt}>
                {t(opt)}
              </option>
            ))}
          </select>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button size="s" type="secondary" onClick={handleCancel}>
            {t('Cancel')}
          </Button>
          <Button size="s" onClick={handleApply}>
            {t('Apply')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
