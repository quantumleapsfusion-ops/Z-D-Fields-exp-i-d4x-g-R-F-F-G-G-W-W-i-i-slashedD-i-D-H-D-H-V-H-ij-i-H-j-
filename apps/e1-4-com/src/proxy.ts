import { NextResponse, type NextRequest } from "next/server";
import { MissingEnvError } from "@/lib/env";
import { PROTECTED_PREFIXES, updateSession } from "@/lib/supabase/proxy";

// Next.js 16 name for middleware. Runs before every matched request.
export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    if (!(error instanceof MissingEnvError)) throw error;
    // Supabase is not configured: public pages still render; anything that
    // needs a session answers 503 so the misconfiguration is obvious.
    const { pathname } = request.nextUrl;
    const needsAuth =
      pathname.startsWith("/api/") ||
      pathname.startsWith("/auth/") ||
      pathname === "/login" ||
      PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    if (!needsAuth) return NextResponse.next({ request });
    return NextResponse.json(
      { error: `Service not configured: ${error.variable} is not set on the server.` },
      { status: 503 },
    );
  }
}

export const config = {
  matcher: [
    // Everything except static assets and image optimisation.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icon.svg|apple-icon.png|icons/|sw.js|manifest.webmanifest|opengraph-image|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
