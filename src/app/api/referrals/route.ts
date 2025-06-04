import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/getServerUser';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('referrals')
    .select('id, referred_user_id, referred_at, profiles!referrals_referred_user_id_fkey(name)')
    .eq('referrer_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const link = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/?ref=${user.id}`;

  const referredUsers = data?.map(r => ({
    id: r.referred_user_id,
    name: (r as any).profiles?.name ?? 'User',
    referred_at: r.referred_at,
  })) || [];

  return NextResponse.json({ link, referredUsers });
}