import { api } from '../baseAxios';

export interface GiftType {
  id: number;
  name: string;
  media_url: string | null;
}

export interface Gift {
  id: number;
  sent_at: string;
  message: string | null;
  sender_name: string;
  type: GiftType;
}

export async function getGifts() {
  const { data } = await api.get<{ gifts: Gift[] }>('/api/gifts');
  return data.gifts;
}