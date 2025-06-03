// src/lib/stores/usePhotoStore.ts
import {create} from 'zustand';
import { UserImage } from '@/type/userImage';

interface PhotoState {
  photos: UserImage[];                     // now an array of full UserImage objects
  setPhotos: (imgs: UserImage[]) => void;
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoState>((set) => ({
  photos: [],
  setPhotos: (imgs: UserImage[]) => set({ photos: imgs }),
  clearPhotos: () => set({ photos: [] }),
}));
