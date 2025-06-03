import { api } from '../baseAxios';

export interface UploadResponse { small: string; medium: string; large: string; }

export async function uploadAvatar(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.post<UploadResponse>('/api/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function addPhoto(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.post('/api/image/add-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as { id: number; small: string; medium: string; large: string; sort_order: number };
}

export async function deletePhoto(photoId: number) {
  await api.post('/api/image/delete-photo', { photoId });
}

export async function reorderPhotos(order: number[]) {
  await api.post('/api/image/reorder', { order });
}