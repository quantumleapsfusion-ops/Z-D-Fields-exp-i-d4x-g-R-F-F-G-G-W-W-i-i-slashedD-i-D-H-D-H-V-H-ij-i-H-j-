export type User = {
  id: string;
  name: string;
  email: string;
};

const placeholderUser: User = {
  id: "usr_placeholder",
  name: "Ada Placeholder",
  email: "ada@e1-4.com",
};

/**
 * Placeholder session lookup. Replace with a real provider
 * (NextAuth/Auth.js, Clerk, Supabase, custom JWT, ...).
 */
export async function getCurrentUser(): Promise<User | null> {
  return placeholderUser;
}

/**
 * Placeholder credential check. Always succeeds; no credentials are stored
 * or validated.
 */
export async function signIn(email: string): Promise<User> {
  return { ...placeholderUser, email };
}
