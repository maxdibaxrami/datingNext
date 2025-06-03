// src/components/ButtonListWithDraggableImagesContainer.tsx
import React, { useRef, FC } from "react";
import { addPhoto, deletePhoto, reorderPhotos } from "@/lib/api/image";
import { usePhotoStore } from "@/lib/stores/usePhotoStore";
import { DraggableImageGallery } from "./ButtonListWithDraggableImages";
import { UserImage } from "@/type/userImage";

export const ButtonListWithDraggableImagesContainer: FC<{
  uploadLoading: boolean;
}> = ({ uploadLoading }) => {
  const images = usePhotoStore((state) => state.photos);
  const setPhotos = usePhotoStore((state) => state.setPhotos);

  // Hidden file input for “update”
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const uploadSlotRef = useRef<number | null>(null);

  // Called when user clicks an existing image
  const handleUploadClick = (slotIdx: number) => {
    uploadSlotRef.current = slotIdx;
    uploadInputRef.current?.click();
  };
  

  // On file selection → call update-photo API
  const handleUploadFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0] || uploadSlotRef.current === null) return;
    const file = e.target.files[0];
    uploadSlotRef.current = null;
    e.target.value = '';
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const data = await addPhoto(file);
      const newPhoto: UserImage = {
        id: data.id,
        user_id: null,
        image_url: data.large,
        thumb_url: data.small,
        medium_url: data.medium,
        sort_order: data.sort_order,
        uploaded_at: new Date().toISOString(),
        is_active: true,
        small_url: null,
      };
      setPhotos([...images, newPhoto]);
    } catch (err) {
      console.error('Failed to upload photo:', err);
    }
  };

  const handleReorder = async (ordered: UserImage[]) => {
    setPhotos(ordered);
    try {
      await reorderPhotos(ordered.map((p) => p.id));
    } catch (err) {
      console.error('Reorder API error:', err);
    }
  };

  // “Delete” callback
  const handleDeleteClick = async (photoId: number) => {
    try {
      await deletePhoto(photoId);
        // Build the filtered array explicitly
        const filtered: UserImage[] = images.filter((img) => img.id !== photoId);
        setPhotos(filtered);
      
    } catch (err) {
      console.error("API error on delete:", err);
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={uploadInputRef}
        onChange={handleUploadFileChange}
      />

      <DraggableImageGallery
        images={images}
        uploadLoading={uploadLoading}
        onUpdatePhoto={handleUploadClick}
        onUploadPhoto={handleUploadClick}
        onDeletePhoto={handleDeleteClick}
        onReorder={handleReorder}
      />
    </>
  );
};
