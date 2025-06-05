'use client';

import { Dispatch, SetStateAction } from 'react';
import { Button, Modal, Subheadline } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';

type SuperlikeModalProps = {
  open: string | null; // profile ID, or null if closed
  onClose: () => void;
  onConfirm: (profileId: string) => Promise<void>;
};

export function SuperlikeModal({ open, onClose, onConfirm }: SuperlikeModalProps) {
  const t = useTranslations('i18n');

  if (!open) return null;

  const handleSend = async () => {
    await onConfirm(open);
    onClose();
  };

  return (
    <Modal open={!!open} onOpenChange={(value)=>{
      if(!value){
        onClose()
      }
    }}>
      <div className="p-4 space-y-4">
        <Subheadline level="1">{t('Superlike')}?</Subheadline>
        <Button size="s" onClick={handleSend}>
          {t('Send')}
        </Button>
      </div>
    </Modal>
  );
}
