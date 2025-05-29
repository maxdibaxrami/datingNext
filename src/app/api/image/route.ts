// src/app/api/image/upload-photo/route.ts
// -----------------------------------------------------------------------------
// Fast face‑presence check + multi‑size upload — serverless‑friendly version
// -----------------------------------------------------------------------------
// • Uses TinyFaceDetector (≈1.3 MB) → loads in <300 ms cold‑start, <5 ms warm.
// • Models are fetched once from a CDN folder you host under /public/models.
// • Node.js runtime is forced so native sharp bindings work.
// • Global caches (modelsLoaded & supabase) survive warm invocations.
// -----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/consistent-type-assertions */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import * as faceapi from "face-api.js";
import { createCanvas, Image, ImageData } from "canvas";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";

// ──────────────────────────── Helpers / Globals ────────────────────────────

// 1. Patch the DOM globals that face‑api.js expects when running in Node.
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

// 2. Supabase client (reuse across invocations).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET = "dating-app";

// 3. Model loading (once per container). Point to your CDN folder.
const MODEL_BASE_URI =
  process.env.NODE_ENV === "production"
    ? "https://dating-next-gnmt.vercel.app/models"
    : "http://localhost:3000/models";

let modelsReady = false;
async function ensureModels() {
  if (modelsReady) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE_URI);
  modelsReady = true;
}

// ───────────────────────────── Core logic ──────────────────────────────────

async function assertFacePresent(buffer: Buffer) {
  const img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width, img.height);
  canvas.getContext("2d").drawImage(img, 0, 0);

  const result = await faceapi.detectSingleFace(
    canvas as unknown as HTMLCanvasElement,
    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
  );
  if (!result) throw new Error("No face detected");
}

async function uploadVariant(buffer: Buffer, label: string, width: number) {
  const resized = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fileName = `${Date.now()}_${label}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, resized, {
      contentType: "image/jpeg",
      upsert: true,
    });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
}

// ───────────────────────────── API handler ─────────────────────────────────

export const config = { api: { bodyParser: false } } as const;

export async function POST(req: NextRequest) {
  try {
    await ensureModels();

    const form = await req.formData();
    const file = form.get("avatar");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await assertFacePresent(buffer);

    // Generate 3 responsive sizes in parallel.
    const [small, medium, large] = await Promise.all([
      uploadVariant(buffer, "small", 200),
      uploadVariant(buffer, "medium", 500),
      uploadVariant(buffer, "large", 1024),
    ]);

    return NextResponse.json({ small, medium, large });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Upload error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
