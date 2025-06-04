import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabaseAdmin';

export async function getServerUser(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) {
    console.error('getServerUser error:', error.message);
    return null;
  }
  return data.user ?? null;
}