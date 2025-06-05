import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/getServerUser';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { targetId } = await req.json();
  if (!targetId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('points')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile || profile.points < 50) {
    return NextResponse.json({ error: 'Not enough points' }, { status: 400 });
  }

  const newPoints = profile.points - 50;
  const { error: updErr } = await supabaseAdmin
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', user.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  const { error: insErr } = await supabaseAdmin
    .from('swipes')
    .upsert({ user_id: user.id, target_id: targetId, action: 'superlike' });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, newPoints });
}