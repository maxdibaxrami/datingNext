// src/type/userImage.ts

export interface UserImage {
  id: number;
  user_id: string | null;
  image_url: string;
  thumb_url: string | null;
  medium_url: string | null;
  sort_order: number | null;
  uploaded_at: string | null; // Supabase returns TIMESTAMP as ISO string
  is_active: boolean | null;
  small_url: string | null;
}
