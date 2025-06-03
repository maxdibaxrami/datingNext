// src/components/ButtonListWithDraggableImagesContainer.tsx
import React, { useRef, FC } from "react";
import axios from "axios";
import { usePhotoStore } from "@/lib/stores/usePhotoStore";
import { DraggableImageGallery } from "./ButtonListWithDraggableImages";
import { UserImage } from "@/type/userImage";

export const ButtonListWithDraggableImagesContainer: FC<{
  uploadLoading: boolean;
}> = ({ uploadLoading }) => {
  const images = usePhotoStore((state) => state.photos);
  const setPhotos = usePhotoStore((state) => state.setPhotos);

  // Hidden file input for “update”
  const updateInputRef = useRef<HTMLInputElement | null>(null);
  const updatingPhotoIdRef = useRef<number | null>(null);

  // Called when user clicks an existing image
  const handleUpdateClick = (photoId: number) => {
    updatingPhotoIdRef.current = photoId;
    updateInputRef.current?.click();
  };

  // On file selection → call update-photo API
  const handleUpdateFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0] || updatingPhotoIdRef.current === null) return;
    const file = e.target.files[0];
    const photoId = updatingPhotoIdRef.current;
    updatingPhotoIdRef.current = null;
    e.target.value = "";

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("photoId", photoId.toString());

      const { data } = await axios.post<{
        small: string;
        medium: string;
        large: string;
      }>("/api/image/update-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Build the updated array explicitly
      const updated: UserImage[] = images.map((img) =>
        img.id === photoId
          ? {
              ...img,
              thumb_url: data.small,
              medium_url: data.medium,
              image_url: data.large,
            }
          : img
      );
      setPhotos(updated);
    } catch (err) {
      console.error("Failed to update photo:", err);
      // Optionally show a toast or error message
    }
  };

  // “Delete” callback
  const handleDeleteClick = async (photoId: number) => {
    try {
      const { data } = await axios.post<{ success: boolean; error?: string }>(
        "/api/image/delete-photo",
        { photoId },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.success) {
        // Build the filtered array explicitly
        const filtered: UserImage[] = images.filter((img) => img.id !== photoId);
        setPhotos(filtered);
      } else {
        console.error("Delete‐photo error:", data.error);
      }
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
        ref={updateInputRef}
        onChange={handleUpdateFileChange}
      />

      <DraggableImageGallery
        images={images}
        uploadLoading={uploadLoading}
        onUpdatePhoto={handleUpdateClick}
        onUploadPhoto={(slotIdx) => {
          /* your existing upload logic here */
        }}
        onDeletePhoto={handleDeleteClick}
      />
    </>
  );
};
