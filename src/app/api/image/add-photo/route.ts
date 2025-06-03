import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import * as faceapi from 'face-api.js';
import { createCanvas, Image, ImageData } from 'canvas';
import { createClient } from '@supabase/supabase-js';

faceapi.env.monkeyPatch({
  Canvas: (createCanvas(1, 1).constructor as unknown) as {
    new (): HTMLCanvasElement;
    prototype: HTMLCanvasElement;
  },
  Image: (Image as unknown) as {
    new (): HTMLImageElement;
    prototype: HTMLImageElement;
  },
  // @ts-ignore
  ImageData: (ImageData as unknown) as {
    new (sw: number, sh: number): ImageData;
    prototype: ImageData;
  },
});

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

export async function POST(req: NextRequest) {
  try {
    await ensureModels();

    const token = req.headers.get('authorization') ?? '';
    const userId = token.replace('Bearer ', '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const { data, error } = await supabase
      .from('user_images')
      .insert({
        user_id: userId,
        image_url: large,
        thumb_url: small,
        medium_url: medium,
        uploaded_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      small,
      medium,
      large,
      sort_order: data.sort_order,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Add-photo error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
