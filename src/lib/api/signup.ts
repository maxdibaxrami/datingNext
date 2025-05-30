// lib/api/signup.ts
import type { DOB, Gender, ImageItem } from '@/lib/stores/useSignUpStore';

export interface SignUpPayload {
  language: string | null;
  gender:   Gender | null;
  name:     string;
  bio:      string;
  dob:      DOB;
  reason:   string | null;
  images:   ImageItem[];              // keeps File objects
}

export type ApiProblem = {
  status: number;                     // HTTP status
  title:  string;                     // short error code e.g. “validation_error”
  detail?: string;                    // human-readable description
  fieldErrors?: Record<string,string>; // per-field validation messages
};

export async function signup(payload: SignUpPayload) {
  /* ---------- build multipart form --------- */
  const form = new FormData();
  form.append('data', JSON.stringify({                     // JSON part
    language: payload.language,
    gender:   payload.gender,
    name:     payload.name.trim(),
    bio:      payload.bio.trim(),
    dob:      payload.dob,
    reason:   payload.reason,
  }));

  // attach every File so the API can stream them to Supabase Storage
  payload.images.forEach(({ file }, idx) =>
    form.append(`image_${idx}`, file, file.name),
  );

  /* ------------- call API ------------------ */
  const res = await fetch('/api/signup', {
    method: 'POST',
    body:   form,
  });

  if (!res.ok) {
    // RFC-7807 style response from the API route we built earlier
    const problem: ApiProblem = await res.json();
    throw problem;
  }

  return (await res.json()) as { ok: true; profileId: string };
}
