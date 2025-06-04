// src/app/api/image/delete-photo/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerUser } from '@/lib/getServerUser';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET = "dating-app";

export async function POST(req: NextRequest) {
  try {
    // 1) Extract userId (same approach as update)
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    // 2) Parse JSON body (we expect { photoId: number })
    const { photoId } = (await req.json()) as { photoId?: number };
    if (!photoId || typeof photoId !== "number") {
      return NextResponse.json({ error: "Missing or invalid photoId" }, { status: 400 });
    }

    // 3) Fetch the record to confirm ownership & collect URLs
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

    // 4) Extract filenames from URLs so we can delete from Storage:
    const oldUrls = [existingRows.image_url, existingRows.thumb_url, existingRows.medium_url];
    const filenames: string[] = [];
    oldUrls.forEach((url) => {
      if (!url) return;
      try {
        const parts = new URL(url).pathname.split("/");
        const name = parts[parts.length - 1];
        filenames.push(name);
      } catch (_) {
        // ignore
      }
    });

    // 5) Soft-delete in the DB (set is_active = false)
    const { error: updateError } = await supabase
      .from("user_images")
      .update({ is_active: false })
      .eq("id", photoId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 6) Now delete the actual files from Storage:
    const { error: deleteError } = await supabase.storage.from(BUCKET).remove(filenames);
    if (deleteError) {
      console.error("Storage delete error:", deleteError.message);
      // We’ll ignore storage delete errors on purpose, since DB already updated
    }

    // 7) Return success:
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Delete-photo error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
