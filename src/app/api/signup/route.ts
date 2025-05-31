// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

/* ── 1 ▸ Zod schemas (unchanged except we removed cookies/headers import) ── */
const dobSchema = z.object({
  day: z.string().regex(/^([0-2]?\d|3[01])$/),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/),
  year: z.string().regex(/^\d{4}$/),
});
const imageSchema = z.object({
  url: z.string().url(),
  url_sm: z.string().url().optional(),
  url_md: z.string().url().optional(),
  url_lg: z.string().url().optional(),
});
const payloadSchema = z.object({
  language: z.string().min(2).max(10).nullable(),
  gender:   z.enum(['male', 'female']).nullable(),
  name:     z.string().min(1).max(100),
  bio:      z.string().min(1).max(500),
  dob:      dobSchema,
  looking_for: z.string().max(255).nullable(),
  images: z.array(imageSchema).max(6),
});
type Payload = z.infer<typeof payloadSchema>;

/* ── 2 ▸ Supabase env vars ─────────────────────────────── */
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('Supabase env vars missing');
}

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  /* 2-1. validate JSON */
  let body: unknown;
  try { body = await req.json(); }
  catch { return bad(400, 'Body must be valid JSON'); }

  const val = payloadSchema.safeParse(body);
  if (!val.success) {
    return bad(422, 'Payload validation failed', val.error.format());
  }
  const payload: Payload = val.data;

  /* 2-2. extract Bearer token */
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return bad(401, 'Missing access token');

  /* 2-3. make server client with that token */
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  /* 2-4. verify token quick-check */
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return bad(401, 'Invalid or expired token');

  /* 2-5. ISO DOB */
  const { day, month, year } = payload.dob;
  const isoDob = new Date(Date.UTC(+year, +month - 1, +day)).toISOString().slice(0,10);

  /* 2-6. RPC call */
  const { data: profile, error } = await supabase
    .rpc('signup_with_images', {
      p_language:    payload.language,
      p_gender:      payload.gender,
      p_name:        payload.name,
      p_bio:         payload.bio,
      p_dob:         isoDob,
      p_looking_for: payload.looking_for,
      p_images:      payload.images,
    })
    .single();

  if (error) {
    const status = error.code?.startsWith('22') ? 400 : 500;
    return NextResponse.json(
      { type: 'database_error', detail: error.message },
      { status },
    );
  }

  return NextResponse.json(profile, { status: 201 });
}

/* helper */
function bad(status: number, detail: string, errors?: unknown) {
  return NextResponse.json(
    { type: httpText(status), detail, errors },
    { status },
  );
}
function httpText(c: number) {
  return {400:'Bad Request',401:'Unauthorized',422:'Unprocessable Entity',500:'Internal Server Error'}[c] ?? 'Error';
}
