import { api } from '../baseAxios';
import { Profile } from '@/type/profile';

export interface DiscoverResult extends Profile {
  image_url: string | null;
}

export async function fetchProfiles(filters: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.append(k, v);
  }
  const { data } = await api.get<DiscoverResult[]>(`/api/discover?${params}`);
  return data;
}