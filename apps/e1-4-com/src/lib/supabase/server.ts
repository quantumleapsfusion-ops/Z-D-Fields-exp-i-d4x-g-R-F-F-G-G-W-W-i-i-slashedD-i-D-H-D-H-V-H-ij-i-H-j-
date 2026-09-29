import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sessionUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Reads the session from cookies and writes refreshed tokens back.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component: cookies are read-only there. The
          // proxy (src/proxy.ts) refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * The signed-in user, or null: from the e1-4 session cookie (voice and passkey sign-in), else from
 * a Supabase Auth session (OAuth, password).
 */
export async function getCurrentUser() {
  const user = await sessionUser();
  if (user) return user;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  return authUser;
}
