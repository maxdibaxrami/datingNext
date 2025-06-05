import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FILTER_FIELDS = [
  'city',
  'country',
  'gender',
  'relationship_status',
  'education',
  'looking_for',
  'smoking',
  'drinking',
  'pets',
];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let query = supabase
      .from('profiles')
      .select(
        'id,name,bio,city,is_verified,country,birth_date,gender,looking_for,smoking,drinking,education,relationship_status,pets,last_seen_at,user_images(id,thumb_url,medium_url,image_url,sort_order)'
      )
      .eq('is_visible', true);

    for (const field of FILTER_FIELDS) {
      const val = url.searchParams.get(field);
      if (val) query = query.eq(field, val);
    }

    const orderField = url.searchParams.get('order') || 'last_seen_at';
    query = query.order(orderField, { ascending: false });

    const { data, error } = await query.limit(50);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = (data || []).map((p: any) => {
      const img = (p.user_images || []).sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      )[0];
      return {
        ...p,
        image_url: img?.medium_url || img?.thumb_url || img?.image_url || null,
      };
    });

    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}