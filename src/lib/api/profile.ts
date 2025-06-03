import { api } from '../baseAxios';

export async function updateProfileField(field: string, value: unknown) {
  const { data } = await api.post('/api/profile/update-field', { field, value });
  return data as { success: boolean };
}