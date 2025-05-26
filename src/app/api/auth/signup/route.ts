// pages/api/signup.js

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    birth_date,
    gender,
    bio,
    smoking,
    drinking,
    education,
    children,
    relationship_status,
    looking_for,
    zodiac,
    pets,
    height_cm,
    is_visible,
    latitude,
    longitude,
    city,
    country,
    app_language,
    points,
    referred_by,
    email,
    password
  } = req.body;

  // 1. Create Auth user
  const { user, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: String(email),
    password: String(password),
    email_confirm: true
  });
  if (authError) {
    return res.status(500).json({ error: authError.message });
  }

  // 2. Insert profile record into your existing table (assumed "profiles")
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert([{
      id: user.id,
      name,
      birth_date,
      gender,
      bio,
      smoking,
      drinking,
      education,
      children,
      relationship_status,
      looking_for,
      zodiac,
      pets,
      height_cm,
      is_verified: false,
      is_visible,
      latitude,
      longitude,
      location: `POINT(${longitude} ${latitude})`,
      city,
      country,
      app_language,
      points,
      referred_by
    }])
    .single();
  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  return res.status(200).json({ user: profile });
}