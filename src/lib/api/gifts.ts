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

export async function getGiftTypes() {
  const { data } = await api.get<{ giftTypes: GiftType[] }>('/api/gift-types');
  return data.giftTypes;
}

export async function sendGift(receiverId: string, giftTypeId: number, message?: string) {
  const { data } = await api.post('/api/gifts/send', { receiverId, giftTypeId, message });
  return data as { success: boolean };
}