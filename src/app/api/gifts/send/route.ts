import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/getServerUser';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { receiverId, giftTypeId, message } = await req.json();
  if (!receiverId || !giftTypeId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('gifts').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    gift_type_id: giftTypeId,
    message: message ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}