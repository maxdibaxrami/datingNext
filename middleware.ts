// /middleware.ts (Next.js 13/14 – root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res  = NextResponse.next();
  const supa = createMiddlewareSupabaseClient({ req, res });
  const { data: { session } } = await supa.auth.getSession();

  const signedIn    = !!session;
  const atSignup    = req.nextUrl.pathname.startsWith('/sign-up');
  const desiredPath = signedIn ? '/' : '/sign-up';

  // 1) Not signed in but hitting anything except /sign-up  ⇒ redirect to /sign-up
  if (!signedIn && !atSignup) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-up';
    return NextResponse.redirect(url);
  }

  // 2) Signed in *and* already completed profile but still on /sign-up ⇒ push them away
  if (signedIn && atSignup) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next).*)'], // run on every page except static assets
};
