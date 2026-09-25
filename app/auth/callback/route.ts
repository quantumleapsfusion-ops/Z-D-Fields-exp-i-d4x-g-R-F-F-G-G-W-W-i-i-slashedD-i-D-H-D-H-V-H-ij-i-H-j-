import { NextResponse, type NextRequest } from 'next/server';

import { ensureProfile, toSessionUser } from '@/lib/auth';
import { safeNextPath } from '@/lib/safe-next';
import { createClient } from '@/lib/supabase/server';

/** OAuth redirect target: exchanges the PKCE code for a session cookie. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data.user) await ensureProfile(toSessionUser(data.user)).catch(() => undefined);
      // Behind a proxy/load balancer, trust the forwarded host for the redirect.
      const forwardedHost = request.headers.get('x-forwarded-host');
      if (process.env.NODE_ENV === 'development' || !forwardedHost) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      const proto = request.headers.get('x-forwarded-proto') ?? 'https';
      return NextResponse.redirect(`${proto}://${forwardedHost}${next}`);
    }
    return NextResponse.redirect(`${origin}/signin?error=${encodeURIComponent(error.message)}`);
  }

  const providerError = searchParams.get('error_description') ?? searchParams.get('error');
  return NextResponse.redirect(
    `${origin}/signin?error=${encodeURIComponent(providerError ?? 'missing_code')}`,
  );
}
