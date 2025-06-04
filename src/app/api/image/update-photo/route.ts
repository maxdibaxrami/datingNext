// src/app/api/image/update-photo/route.ts

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import * as faceapi from "face-api.js";
import { createCanvas, Image, ImageData } from "canvas";
import { createClient } from "@supabase/supabase-js";
import { getServerUser } from '@/lib/getServerUser';

// Patch face‐api.js for NodeJS (same as in upload-photo)
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
const BUCKET = "dating-app";

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

// Detects if the buffer has a face; throws if none found.
async function assertFacePresent(buffer: Buffer) {
  const img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width, img.height);
  canvas.getContext("2d").drawImage(img, 0, 0);

  const detection = await faceapi.detectSingleFace(
    canvas as unknown as HTMLCanvasElement,
    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
  );
  if (!detection) throw new Error("No face detected");
}

// Resize + upload a variant; returns the public URL.
async function uploadVariant(
  buffer: Buffer,
  label: string,
  width: number
): Promise<string> {
  const resized = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fileName = `${Date.now()}_${label}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, resized, { contentType: "image/jpeg", upsert: true });

  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
}

// Helper: Delete old variants by “filename” pattern; you can pass an array of filenames to delete
async function deleteOldFiles(filenames: string[]) {
  if (filenames.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(filenames);
  if (error) console.error("Error deleting old files:", error.message);
}

export async function POST(req: NextRequest) {
  try {
    // 1) Ensure face‐api models are loaded:
    await ensureModels();

    // 2) Extract current user’s ID from a JWT or other mechanism.
    //    Adjust if you’re not using NextAuth. Here we expect NextAuth session:
     const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3) Parse form data:
    const form = await req.formData();
    const file = form.get("avatar");
    const photoIdRaw = form.get("photoId");
    if (!(file instanceof File) || !photoIdRaw) {
      return NextResponse.json({ error: "Missing file or photoId" }, { status: 400 });
    }
    const photoId = parseInt(photoIdRaw.toString(), 10);
    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photoId" }, { status: 400 });
    }
    const userId = user.id;

    // 4) Fetch the existing image record to verify ownership & gather old URLs:
    const { data: existingRows, error: fetchError } = await supabase
      .from("user_images")
      .select("image_url, thumb_url, medium_url, user_id")
      .eq("id", photoId)
      .single();
    if (fetchError || !existingRows) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }
    if (existingRows.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5) Convert the file to a Buffer, run face detection:
    const buffer = Buffer.from(await file.arrayBuffer());
    await assertFacePresent(buffer);

    // 6) Before we upload new variants, parse out the old filenames (to delete):
    //    Supabase “publicUrl” is typically: https://xyz.supabase.co/storage/v1/object/public/dating-app/<filename>
    //    We can extract <filename> by splitting on “/” and taking the last segment.
    const oldUrls = [existingRows.image_url, existingRows.thumb_url, existingRows.medium_url];
    const oldFilenames: string[] = [];
    oldUrls.forEach((url) => {
      if (!url) return;
      try {
        const parts = new URL(url).pathname.split("/");
        const name = parts[parts.length - 1];
        oldFilenames.push(name);
      } catch (_) {
        // ignore
      }
    });

    // 7) Upload new small/medium/large variants (in parallel):
    const [small, medium, large] = await Promise.all([
      uploadVariant(buffer, "small", 200),
      uploadVariant(buffer, "medium", 500),
      uploadVariant(buffer, "large", 1024),
    ]);

    // 8) Update the existing row in “user_images”:
    const { error: updateError } = await supabase
      .from("user_images")
      .update({
        image_url: large,
        thumb_url: small,
        medium_url: medium,
        uploaded_at: new Date().toISOString(),
        is_active: true,
      })
      .eq("id", photoId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 9) Delete old files from Storage (fire-and-forget):
    await deleteOldFiles(oldFilenames);

    // 10) Return success with new URLs:
    return NextResponse.json({ small, medium, large });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Update‐photo error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
