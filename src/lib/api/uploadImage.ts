import axios from 'axios';

export interface UploadResponse { small: string; medium: string; large: string; }

export async function uploadAvatar(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('avatar', file);

  const { data } = await axios.post<UploadResponse>(
    // <-- new endpoint
    '/api/image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return data;
}