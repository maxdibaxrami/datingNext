import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('gift_types')
    .select('id, name, media_url')
    .order('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ giftTypes: data || [] });
}