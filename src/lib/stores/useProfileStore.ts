// src/stores/useProfileStore.ts
import { create } from 'zustand';
import { Profile } from '@/type/profile';

interface ProfileState {
  profile: Profile | null;

  // Action to set the profile
  setProfile: (p: Profile) => void;

  // Action to clear (e.g. on sign-out)
  clearProfile: () => void;

  updatePoints: (points: number) => void;

}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,

  setProfile: (p: Profile) =>
    set(() => ({
      profile: p,
    })),

  clearProfile: () =>
    set(() => ({
      profile: null,
    })),
    
  updatePoints: (points: number) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, points } : state.profile,
    })),
    
}));
