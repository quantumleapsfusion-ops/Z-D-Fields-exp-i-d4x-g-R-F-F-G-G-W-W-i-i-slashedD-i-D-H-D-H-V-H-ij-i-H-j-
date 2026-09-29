import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Target of the links in Supabase auth emails (sign-up confirmation, password reset).
 * Accepts the PKCE `code` form and the `token_hash` + `type` form, then sets the session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/profile";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/profile";

  if (code || (tokenHash && type)) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash as string,
          type: type as EmailOtpType,
        });
    if (!error) {
      // Behind a proxy/load balancer, trust the forwarded host for the redirect.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      if (isLocal || !forwardedHost) return NextResponse.redirect(`${origin}${next}`);
      const proto = request.headers.get("x-forwarded-proto") ?? "https";
      return NextResponse.redirect(`${proto}://${forwardedHost}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const linkError = searchParams.get("error_description") ?? searchParams.get("error");
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(linkError ?? "missing_code")}`,
  );
}
