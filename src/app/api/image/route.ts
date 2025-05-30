// src/app/api/image/upload-photo/route.ts
// -----------------------------------------------------------------------------
// Fast face‑presence check + multi‑size upload — serverless‑friendly version
// -----------------------------------------------------------------------------
// • TinyFaceDetector (≈1.3 MB) → <300 ms cold‑start, <5 ms warm.
// • Models fetched once from CDN under /public/models (or your prod URL).
// • Node.js runtime forced so native sharp bindings load.
// • No unsupported `config` export — compatible with Next 14 App Router.
// -----------------------------------------------------------------------------

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import * as faceapi from 'face-api.js';
import { createCanvas, Image, ImageData } from 'canvas';
import { createClient } from '@supabase/supabase-js';

/* -------------------------------------------------------------------------- */
/*  Face‑API environment patch (Node)                                         */
/* -------------------------------------------------------------------------- */

faceapi.env.monkeyPatch({
  Canvas: (createCanvas(1, 1).constructor as unknown) as {
    new (): HTMLCanvasElement;
    prototype: HTMLCanvasElement;
  },
  Image: (Image as unknown) as {
    new (): HTMLImageElement;
    prototype: HTMLImageElement;
  },
  //@ts-ignore
  ImageData: (ImageData as unknown) as {
    new (sw: number, sh: number): ImageData;
    prototype: ImageData;
  },
});

/* -------------------------------------------------------------------------- */
/*  Globals                                                                   */
/* -------------------------------------------------------------------------- */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET = 'dating-app';

const MODEL_BASE_URI =
  process.env.NODE_ENV === 'production'
    ? 'https://dating-next-gnmt.vercel.app/models'
    : 'http://localhost:3000/models';

let modelsReady = false;
async function ensureModels() {
  if (modelsReady) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE_URI);
  modelsReady = true;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

async function assertFacePresent(buffer: Buffer) {
  const img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width, img.height);
  canvas.getContext('2d').drawImage(img, 0, 0);

  const detection = await faceapi.detectSingleFace(
    canvas as unknown as HTMLCanvasElement,
    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
  );
  if (!detection) throw new Error('No face detected');
}

async function uploadVariant(buffer: Buffer, label: string, width: number) {
  const resized = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fileName = `${Date.now()}_${label}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, resized, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
}

/* -------------------------------------------------------------------------- */
/*  Route handler                                                             */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    await ensureModels();

    const form = await req.formData();
    const file = form.get('avatar');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await assertFacePresent(buffer);

    const [small, medium, large] = await Promise.all([
      uploadVariant(buffer, 'small', 200),
      uploadVariant(buffer, 'medium', 500),
      uploadVariant(buffer, 'large', 1024),
    ]);

    return NextResponse.json({ small, medium, large });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Upload error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
