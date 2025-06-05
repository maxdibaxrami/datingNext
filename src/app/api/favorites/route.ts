import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/getServerUser';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select(
      'favorite_id, profiles!favorites_favorite_id_fkey(name, city, country, user_images(id, thumb_url, medium_url, sort_order))'
    )
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const favorites = (data || []).map((f: any) => {
    const images = (f.profiles?.user_images || []).sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    const img = images[0];
    return {
      id: f.favorite_id,
      name: f.profiles?.name ?? 'User',
      city: f.profiles?.city ?? null,
      country: f.profiles?.country ?? null,
      image_url: img?.medium_url || img?.thumb_url || null,
    };
  });

  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { targetId } = await req.json();
  if (!targetId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('favorites')
    .upsert({ user_id: user.id, favorite_id: targetId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { targetId } = await req.json();
  if (!targetId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .match({ user_id: user.id, favorite_id: targetId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}