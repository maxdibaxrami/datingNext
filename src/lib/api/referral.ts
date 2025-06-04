import { api } from '../baseAxios';

export interface ReferralInfo {
  link: string;
  referredUsers: { id: string; name: string; referred_at: string }[];
}

export async function getReferrals() {
  const { data } = await api.get<ReferralInfo>('/api/referrals');
  return data;
}