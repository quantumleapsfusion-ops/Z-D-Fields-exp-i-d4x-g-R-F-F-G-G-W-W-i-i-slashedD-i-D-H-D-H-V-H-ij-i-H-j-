/**
 * OAuth providers enabled in Supabase Auth. Client IDs / secrets are configured
 * in the Supabase dashboard (Authentication -> Providers), not in this repo.
 */
export const OAUTH_PROVIDERS = {
  google: {
    label: "Google",
    options: { queryParams: { access_type: "offline", prompt: "consent" } },
  },
  facebook: {
    label: "Facebook",
    options: {},
  },
  azure: {
    label: "Microsoft",
    options: { scopes: "email openid profile" },
  },
} as const;

export type OAuthProvider = keyof typeof OAUTH_PROVIDERS;
