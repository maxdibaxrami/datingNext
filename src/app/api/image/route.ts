// Force Node.js runtime so tfjs-node loads native binaries
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import * as faceapi from 'face-api.js';           // :contentReference[oaicite:6]{index=6}
import { createCanvas, Image, ImageData } from 'canvas';
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';

// disable built-in body parser
export const config = { api: { bodyParser: false } };

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET = 'dating-app';

// Patch face-api.js environment for Node
//@t
faceapi.env.monkeyPatch({
  // cast to any to satisfy TS’s new()/prototype signature requirement
  Canvas: (createCanvas(1, 1).constructor as unknown) as { new (): HTMLCanvasElement; prototype: HTMLCanvasElement },
  Image: (Image as unknown) as { new (): HTMLImageElement; prototype: HTMLImageElement },
  //@ts-ignore
  ImageData: (ImageData as unknown) as {
    new (sw: number, sh: number, settings?: ImageDataSettings): ImageData;
    new (data: Uint8ClampedArray, sw: number, sh?: number, settings?: ImageDataSettings): ImageData;
    prototype: ImageData;
  },
});

// Load models once at startup
const MODEL_PATH = path.join(process.cwd(), '/models');

let modelsLoaded = false;

async function ensureModels() {
  if (modelsLoaded) return;
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
  modelsLoaded = true;
}

// Detect faces in the buffer
async function detectFace(buffer: Buffer) {
  const img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const detections = await faceapi.detectAllFaces(canvas as any);
  if (!detections.length) throw new Error('No face detected');
}

// Resize and upload to Supabase
async function resizeAndUpload(buffer: Buffer, label: string, width: number) {
  const resized = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const fileName = `${Date.now()}_${label}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, resized, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function POST(req: NextRequest) {
  try {
    await ensureModels();
    const form = await req.formData();
    const file = form.get('avatar');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    await detectFace(buffer);
    const [small, medium, large] = await Promise.all([
      resizeAndUpload(buffer, 'small', 200),
      resizeAndUpload(buffer, 'medium', 500),
      resizeAndUpload(buffer, 'large', 1024),
    ]);
    return NextResponse.json({ small, medium, large });
  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
