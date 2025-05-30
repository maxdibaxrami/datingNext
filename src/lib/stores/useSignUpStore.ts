// src/lib/stores/useSignUpStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Gender = 'male' | 'female';
export interface DOB { day: string; month: string; year: string; }
export interface ImageItem { id: string; url: string; file: File, url_md:string, url_lg:string, url_sm:string }

export interface SignUpState {
  language: string | null;
  gender:   Gender | null;
  name:     string;
  bio:      string;
  dob:      DOB;
  reason:   string | null;
  images:   ImageItem[];

  setLanguage: (lng: string)            => void;
  setGender:   (g: Gender)              => void;
  setName:     (v: string)              => void;
  setBio:      (v: string)              => void;
  setDOB:      (p: Partial<DOB>)        => void;
  setReason:   (r: string)              => void;
  addImages:   (files: ImageItem[])     => void;
  removeImage: (id: string)             => void;
}

export const useSignUpStore = create<SignUpState>()(
  persist(
    (set) => ({
      /* ─── initial data ─── */
      language: null,
      gender:   null,
      name:     '',
      bio:      '',
      dob:      { day: '', month: '', year: '' },
      reason:   null,
      images:   [],

      /* ─── actions ─── */
      setLanguage: (lng) => set({ language: lng }),
      setGender:   (g)   => set({ gender:   g   }),
      setName:     (v)   => set({ name:     v   }),
      setBio:      (v)   => set({ bio:      v   }),
      setDOB:      (p)   => set((st) => ({ dob: { ...st.dob, ...p } })),
      setReason:   (r)   => set({ reason:   r   }),
      addImages:   (imgs)=> set((st) => ({ images: [...st.images, ...imgs] })),
      removeImage: (id)  => set((st) => ({ images: st.images.filter(i => i.id !== id) })),
    }),
    {
      name:    'sign-up-wizard',
      storage: createJSONStorage(() => sessionStorage),
      // only persist id + url for images (File objects can’t be JSON’d)
      partialize: (state) => ({
        ...state,
        images: state.images.map(({ id, url, url_sm, url_md, url_lg }) => ({
          id,
          url,
          url_sm,
          url_md,
          url_lg,
        })),
      }),
    }
  )
);
