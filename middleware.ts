import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/** Refreshes the Supabase session cookie on every matched request. */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, the service worker and images.
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
