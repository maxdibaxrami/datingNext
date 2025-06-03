// src/components/ButtonListWithDraggableImages.tsx
import React, { useEffect, useRef, FC } from "react";
import Sortable from "sortablejs";
import { Button } from "@telegram-apps/telegram-ui";
import { usePhotoStore } from "@/lib/stores/usePhotoStore";
import { UserImage } from "@/type/userImage";
import cn from "classnames";

// Predefined Tailwind classes for grid placement
const imageClasses = [
  "col-span-2 row-span-2", // Index 0
  "col-start-3 row-start-1", // Index 1
  "col-start-3 row-start-2", // Index 2
  "col-start-1 row-start-3", // Index 3
  "col-start-2 row-start-3", // Index 4
  "col-start-3 row-start-3", // Index 5
];

interface DraggableImageGalleryProps {
  images: UserImage[];
  uploadLoading: boolean;
  onUpdatePhoto: (photoId: number) => void;
  onUploadPhoto: (slotIndex: number) => void;
  onDeletePhoto: (photoId: number) => void;
  onReorder?: (newOrder: UserImage[]) => void;

}

export const DraggableImageGallery: FC<DraggableImageGalleryProps> = ({
  images,
  uploadLoading,
  onUpdatePhoto,
  onUploadPhoto,
  onDeletePhoto,
  onReorder,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const setPhotos = usePhotoStore((state) => state.setPhotos);

  // Initialize Sortable
  useEffect(() => {
    if (listRef.current && images.length > 0) {
      const sortable = Sortable.create(listRef.current, {
        animation: 150,
        handle: ".drag-handle",
        onEnd: () => {
          const newOrderIds = Array.from(
            listRef.current!.querySelectorAll("[data-id]")
          ).map((el) => parseInt((el as HTMLElement).dataset.id!, 10));

          const reordered = newOrderIds.map((id) =>
            images.find((img) => img.id === id)!
          );
          setPhotos(reordered);
          onReorder?.(reordered);
        },
      });
      return () => sortable.destroy();
    }
  }, [images, setPhotos]);

  const placeholders = Math.max(0, 6 - images.length);

  return (
    <div ref={listRef} className="grid w-full grid-cols-3 grid-rows-3 gap-4">
      {images
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((photo, index) => {
          if (index >= 6) return null;
          return (
            <div
              key={photo.id}
              data-id={photo.id}
              className={cn("relative drag-handle w-full h-full", imageClasses[index])}
            >
              {/* Delete “✕” */}
              <button
                onClick={() => onDeletePhoto(photo.id)}
                className="absolute top-1 right-1 z-10 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                aria-label="Delete photo"
                type="button"
              >
                ✕
              </button>

              {/* Clicking image = update */}
              <div
                onClick={() => onUpdatePhoto(photo.id)}
                className="w-full h-full cursor-pointer"
              >
                <img
                  src={photo.thumb_url ?? photo.medium_url ?? ''}
                  alt={`Image ${index + 1}`}
                  className="rounded-lg aspect-square object-cover w-full h-full"
                />
              </div>
            </div>
          );
        })}

      {Array.from({ length: placeholders }).map((_, idx) => {
        const slotIndex = images.length + idx;
        if (slotIndex >= 6) return null;
        return (
          <div
            key={`placeholder-${slotIndex}`}
            className={cn(imageClasses[slotIndex], "aspect-square")}
          >
            <Button
              onClick={() => onUploadPhoto(slotIndex)}
              className="aspect-square bg-neutral/10 rounded-lg w-full h-full"
              aria-label="Add photo"
              color="default"
            >
                <span className="text-xl font-bold">+</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
};
