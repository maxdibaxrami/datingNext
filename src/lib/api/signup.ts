// lib/api/signup.ts
import type { DOB, Gender } from '@/lib/stores/useSignUpStore';
import { api } from '../baseAxios';

export interface ImagePayload {
  id:  string;
  url: string;
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
  looking_for: string | null;
  images:   ImagePayload[];
}

export type ApiProblem = {
  status: number;
  title:  string;
  detail?: string;
  fieldErrors?: Record<string, string>;
};

export async function signup(payload: SignUpPayload) {
  try {
    const { data } = await api.post('/api/signup', payload);
    return data as { ok: true; profileId: string };
  } catch (err: any) {
    throw (err.response?.data ?? err) as ApiProblem;
  }
}
