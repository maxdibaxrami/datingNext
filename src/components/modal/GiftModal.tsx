'use client';

import { useState } from 'react';
import { Button, Modal, Subheadline } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';
import type { GiftType } from '@/lib/api/gifts';

type GiftModalProps = {
  open: string | null; // profile ID, or null if closed
  onClose: () => void;
  giftTypes: GiftType[];
  onSend: (profileId: string, giftId: number) => Promise<void>;
};

export function GiftModal({ open, onClose, giftTypes, onSend }: GiftModalProps) {
  const t = useTranslations('i18n');
  const [selectedGift, setSelectedGift] = useState<number | null>(null);

  if (!open) return null;

  const handleSend = async () => {
    if (selectedGift === null) return;
    await onSend(open, selectedGift);
    setSelectedGift(null);
    onClose();
  };

  return (
    <Modal open={!!open} onOpenChange={(value)=>{
      if(!value){
        onClose()
      }
    }}>
      <div className="p-4 space-y-3">
        <Subheadline level="1">{t('Select_Gift')}</Subheadline>
        <select
          className="border w-full p-1 rounded"
          value={selectedGift ?? ''}
          onChange={(e) => setSelectedGift(Number(e.target.value))}
        >
          <option value="">{t('Select')}</option>
          {giftTypes.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <Button size="s" onClick={handleSend}>
          {t('Send')}
        </Button>
      </div>
    </Modal>
  );
}
