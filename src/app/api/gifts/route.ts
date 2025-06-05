import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/getServerUser';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('gifts')
    .select(
      'id, sent_at, message, gift_type_id, gift_types(name, media_url), profiles!gifts_sender_id_fkey(name)'
    )
    .eq('receiver_id', user.id)
    .order('sent_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const gifts =
    data?.map((g: any) => ({
      id: g.id,
      sent_at: g.sent_at,
      message: g.message,
      type: {
        id: g.gift_type_id,
        name: g.gift_types?.name ?? 'Gift',
        media_url: g.gift_types?.media_url ?? null,
      },
      sender_name: g.profiles?.name ?? 'User',
    })) || [];

  return NextResponse.json({ gifts });
}