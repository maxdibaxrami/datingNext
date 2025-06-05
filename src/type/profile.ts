// src/types/profile.ts

// 1. Mirror each ENUM as a string union
export type Gender =
  | 'male'
  | 'female'
  | 'non_binary'
  | 'other';

export type Smoking =
  | 'no'
  | 'occasionally'
  | 'regularly';

export type Drinking =
  | 'no'
  | 'socially'
  | 'regularly';

export type Education =
  | 'high_school'
  | 'bachelors'
  | 'masters'
  | 'phd'
  | 'other';

export type Children =
  | 'no'
  | 'yes_fulltime'
  | 'yes_parttime'
  | 'want_some_day';

export type RelationshipStatus =
  | 'single'
  | 'divorced'
  | 'widowed'
  | 'separated'
  | 'in_relationship'
  | 'open_relationship';

export type LookingFor =
  | 'chat'
  | 'casual'
  | 'long_term'
  | 'friends'
  | 'virtual';

export type Zodiac =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type Pets =
  | 'none'
  | 'dog'
  | 'cat'
  | 'other'
  | 'many';

// 2. Define the Profile interface that matches every column:
export interface Profile {
  id: string;                   // UUID from auth.users
  name: string;
  birth_date: string | null;    // DATE in DB; supabase-js returns strings
  gender: Gender | null;
  bio: string | null;
  smoking: Smoking | null;
  drinking: Drinking | null;
  education: Education | null;
  children: Children | null;
  relationship_status: RelationshipStatus | null;
  looking_for: LookingFor | null;
  zodiac: Zodiac | null;
  pets: Pets | null;
  height_cm: number | null;
  is_verified: boolean;
  is_visible: boolean;
  latitude: number | null;
  longitude: number | null;
  // location: unknown; // supabase-js typically won’t deserialize a PostGIS GEOGRAPHY column automatically
  city: string | null;
  country: string | null;
  last_seen_at: string | null;      // TIMESTAMP → string
  app_language: string | null;
  points: number;
  referred_by: string | null;       // UUID
  is_banned: boolean;
  is_admin: boolean;
  created_at: string;               // TIMESTAMP → string
}
