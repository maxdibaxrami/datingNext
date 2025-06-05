import { api } from '../baseAxios';

export async function sendSuperlike(targetId: string) {
  const { data } = await api.post('/api/superlike', { targetId });
  return data as { success: boolean; newPoints: number };
}