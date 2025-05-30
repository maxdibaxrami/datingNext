// lib/api/signup.ts
import type { DOB, Gender } from '@/lib/stores/useSignUpStore';

/* ──────────────────────────────────────────────────────────────
 * 1. Payload that the back-end expects
 *    (only metadata, the actual files are already in Supabase)
 * ──────────────────────────────────────────────────────────── */
export interface ImagePayload {
  id:  string;
  url: string;          // medium / original
  url_sm?: string;
  url_md?: string;
  url_lg?: string;
}

export interface SignUpPayload {
  language: string | null;
  gender:   Gender | null;
  name:     string;
  bio:      string;
  dob:      DOB;
  reason:   string | null;
  images:   ImagePayload[];     // ←-- NO File objects here!
}

/* ──────────────────────────────────────────────────────────────
 * 2. RFC-7807 style error object
 * ──────────────────────────────────────────────────────────── */
export type ApiProblem = {
  status: number;
  title:  string;
  detail?: string;
  fieldErrors?: Record<string, string>;
};

/* ──────────────────────────────────────────────────────────────
 * 3. Helper that POSTs JSON to /api/signup
 * ──────────────────────────────────────────────────────────── */
export async function signup(payload: SignUpPayload) {
  const res = await fetch('/api/signup', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    const problem: ApiProblem = await res.json();
    throw problem;
  }

  // { ok: true, profileId: '…' }
  return (await res.json()) as { ok: true; profileId: string };
}
