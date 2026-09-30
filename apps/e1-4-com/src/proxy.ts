import { NextResponse, type NextRequest } from "next/server";
import { PROTECTED_PREFIXES, SESSION_COOKIE } from "@/lib/auth/routes";

// Next.js 16 name for middleware. Runs before every matched request.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/") &&
    !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())
  ) {
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host.toLowerCase() !== request.nextUrl.host.toLowerCase()) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except static assets and image optimisation.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icon.svg|apple-icon.png|icons/|sw.js|manifest.webmanifest|opengraph-image|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
