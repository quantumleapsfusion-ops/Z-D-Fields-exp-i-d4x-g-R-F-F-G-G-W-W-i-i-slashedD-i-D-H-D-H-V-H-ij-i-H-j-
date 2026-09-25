import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth';

/** For server components/actions that need a signed-in user; redirects to sign-in otherwise. */
export async function requireUser(next: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return user;
}
