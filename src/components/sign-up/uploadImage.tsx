'use client';

import React, {
  useRef,
  useCallback,
  ChangeEvent,
  useEffect,
  useState,
} from 'react';
import { useTranslations } from 'next-intl';
import {
  DeleteIcon,
  PhotoIcon,
  PlusIcon,
} from '@/icon';
import {
  ButtonCell,
  Cell,
  Section,
  List,
  Card,
  IconButton,
  Spinner,
} from '@telegram-apps/telegram-ui';
import { ImageItem, useSignUpStore } from '@/lib/stores/useSignUpStore';
import { uploadAvatar, UploadResponse } from '@/lib/api/uploadImage';

type Props = { onValidChange?: (valid: boolean) => void };

export default function UploadImageStep({ onValidChange }: Props) {
  const t = useTranslations('i18n');
  const inputRef = useRef<HTMLInputElement>(null);

  /* ─────────────── global store ─────────────── */
  const images = useSignUpStore((s) => s.images);
  const addImages = useSignUpStore((s) => s.addImages);
  const removeImage = useSignUpStore((s) => s.removeImage);

  /* ─────────────── constants ─────────────── */
  const MIN_IMAGES = 2;
  const MAX_IMAGES = 6;

  /* ─────────────── local state ─────────────── */
  const [uploading, setUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /* After 5 s of “uploading”, flip to “analyzing” */
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (uploading) {
      setIsAnalyzing(false);
      timer = setTimeout(() => setIsAnalyzing(true), 5_000);
    } else {
      setIsAnalyzing(false);
    }
    return () => timer && clearTimeout(timer);
  }, [uploading]);

  /* notify parent of validity */
  useEffect(() => {
    onValidChange?.(images.length >= MIN_IMAGES);
  }, [images.length, onValidChange]);

  /* ─────────────── handlers ─────────────── */
  const handleSelectClick = () => inputRef.current?.click();

  const handleFilesSelected = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = Array.from(e.target.files).slice(
        0,
        MAX_IMAGES - images.length
      );
      if (!files.length) return;

      setUploading(true);
      const successfulItems: ImageItem[] = [];

      await Promise.all(
        files.map(async (file) => {
          const id = crypto.randomUUID();
          try {
            const urls: UploadResponse = await uploadAvatar(file);
            successfulItems.push({
              id,
              url: urls.medium,
              url_md:urls.medium,
              url_sm:urls.small,
              url_lg:urls.large,
              file,
            });
          } catch (err: any) {
            console.error('Upload failed', err);
            alert(
              `${t('upload_failed')}: ${
                err.response?.data?.error || err.message
              }`
            );
          }
        })
      );

      if (successfulItems.length) {
        addImages(successfulItems);
      }

      setUploading(false);
      e.target.value = '';
    },
    [images.length, addImages, t]
  );

  const handleDelete = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img && img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }
    removeImage(id);
  };

  /* ─────────────── render ─────────────── */
  const busy = uploading; // shorthand for read-ability

  return (
    <List className="flex flex-col">
      <Section header={t('Upload_Profile_Images')}>
        <Cell
          before={<PhotoIcon className="h-7 w-7 text-emerald-500" fill="#1FB6A8" />}
          subtitle={t('description_profile_photo')}
          readOnly
        >
          {t('profile_image')}
        </Cell>

        <ButtonCell
          before={busy ? <Spinner size="s" /> : <PlusIcon className="h-7 w-7 text-emerald-500" fill="#1FB6A8" />}
          disabled={images.length >= MAX_IMAGES || busy}
          onClick={handleSelectClick}
        >
          {busy
            ? isAnalyzing
              ? t('analayzing_image')   // after 5 s
              : t('uploading')          // first 5 s
            : images.length >= MAX_IMAGES
            ? t('images_limit_reached', { max: MAX_IMAGES })
            : t('Upload_Profile_Images')}
        </ButtonCell>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFilesSelected}
        />
      </Section>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map(({ id, url }) => (
            <Card key={id} className="relative overflow-hidden">
              <img
                src={url}
                alt={t('selected_image_alt')}
                className="w-full aspect-square object-cover"
              />
              <IconButton
                mode="outline"
                size="s"
                className="absolute right-1 top-1"
                aria-label={t('delete_image')}
                onClick={() => handleDelete(id)}
              >
                <DeleteIcon className="h-7 w-7 text-emerald-500" />
              </IconButton>
            </Card>
          ))}
        </div>
      )}

      {images.length < MIN_IMAGES && (
        <p className="text-sm text-red-500 px-4 pb-4">
          {t('need_min_images', { min: MIN_IMAGES, count: images.length }) ||
            `Please upload at least ${MIN_IMAGES} images (currently ${images.length}).`}
        </p>
      )}
    </List>
  );
}
