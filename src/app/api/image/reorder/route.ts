import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerUser } from '@/lib/getServerUser';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const { order } = (await req.json()) as { order?: number[] };
    
    if (!Array.isArray(order) || order.some((id) => typeof id !== 'number')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      const { error } = await supabase
        .from('user_images')
        .update({ sort_order: i })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Reorder error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}