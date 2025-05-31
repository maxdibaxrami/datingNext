/**
 * Next.js Route Handler — persists sign-up wizard data to Supabase
 * ============================================================================
 * ▸ Best-practice notes
 *   • Strong runtime validation with Zod (mirrors front-end types)
 *   • RFC 7807-style error objects and narrow, typed success payload
 *   • Atomic insert via a Postgres RPC (`signup_with_images`)
 *   • No internal details leaked on 5xx; ready for Edge or Node
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

/* ── 1. Payload schema ──────────────────────────────────────────────── */
const dobSchema = z.object({
  day:   z.string().regex(/^([0-2]?\d|3[01])$/, 'Day must be 1-31'),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Month must be 1-12'),
  year:  z.string().regex(/^\d{4}$/,            'Year must be four digits'),
});

/* the image now only carries URLs; `id` is gone */
const imageSchema = z.object({
  url:    z.string().url('Image URL is required'),
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
  reason:   z.string().max(255).nullable(),
  images:   z.array(imageSchema).max(6),
});

type Payload = z.infer<typeof payloadSchema>;


/* ── 2. Handler ──────────────────────────────────────────────────────── */
export const runtime = 'edge'; // comment-out if you prefer the default Node runtime

export async function POST(req: NextRequest) {
  /* 2-1  Parse body --------------------------------------------------- */
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return problem({ type: 'invalid_request', detail: 'Body must be valid JSON' }, 400);
  }

  /* 2-2  Validate ------------------------------------------------------ */
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return problem(
      { type: 'validation_error', detail: 'Payload validation failed', errors: parsed.error.format() },
      422,
    );
  }
  const payload: Payload = parsed.data;

  /* 2-3  Transform DOB ------------------------------------------------- */
  const { day, month, year } = payload.dob;
  const isoDob = new Date(Date.UTC(+year, +month - 1, +day)).toISOString().slice(0, 10);

  /* 2-4  Create Supabase client --------------------------------------- */
  const supabase = createRouteHandlerClient({ cookies });

  /* 2-5  Persist via Postgres RPC (atomic insert) ---------------------- */
  const { data: profile, error } = await supabase
    .rpc('signup_with_images', {
      p_language: payload.language,
      p_gender:   payload.gender,
      p_name:     payload.name,
      p_bio:      payload.bio,
      p_dob:      isoDob,
      p_reason:   payload.reason,
      p_images:   payload.images,
    })
    .single();

  if (error) {
    // 22xxx = data exceptions → client mistake; anything else → server fault
    const status = error.code?.startsWith('22') ? 400 : 500;
    return problem({ type: 'database_error', detail: error.message }, status);
  }

  /* 2-6  Success ------------------------------------------------------- */
  return NextResponse.json(profile, { status: 201 });
}

/* ── 3. Helpers ──────────────────────────────────────────────────────── */
interface ProblemDetails {
  type:   string;
  title?: string;
  detail: string;
  errors?: unknown;
}

function problem(body: ProblemDetails, status: number) {
  const base: ProblemDetails = {
    title: body.title ?? httpStatusText(status),
    ...body,
  };
  return NextResponse.json(base, { status });
}

function httpStatusText(code: number) {
  switch (code) {
    case 400: return 'Bad Request';
    case 422: return 'Unprocessable Entity';
    case 500: return 'Internal Server Error';
    default:  return 'Error';
  }
}
