import { api } from '../baseAxios';

export interface Favorite {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  image_url: string | null;
}

export async function getFavorites() {
  const { data } = await api.get<{ favorites: Favorite[] }>('/api/favorites');
  return data.favorites;
}

export async function addFavorite(id: string) {
  await api.post('/api/favorites', { targetId: id });
}

export async function removeFavorite(id: string) {
  await api.delete('/api/favorites', { data: { targetId: id } });
}