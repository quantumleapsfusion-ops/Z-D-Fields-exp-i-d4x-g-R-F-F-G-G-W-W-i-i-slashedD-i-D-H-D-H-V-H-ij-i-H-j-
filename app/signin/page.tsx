import { redirect } from 'next/navigation';

import { Lockup } from '@/components/Logo';
import { PageShell } from '@/components/PageShell';
import { enabledProviders, getSessionUser } from '@/lib/auth';
import { publicEnv } from '@/lib/env';
import { safeNextPath } from '@/lib/safe-next';

import { SignInButtons } from './SignInButtons';

export const metadata = { title: 'Sign in' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = safeNextPath(next);
  const configured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
  if (configured && (await getSessionUser().catch(() => null))) redirect(safeNext);

  return (
    <PageShell>
      <section className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <Lockup width={240} priority />
        <h1 className="sr-only">Sign in to e1-4</h1>
        <p className="mt-8 font-sans text-dust">Sign in to start your Voice Stream.</p>
        {error ? (
          <p className="mt-6 rounded-sm border border-spec-red/50 px-4 py-2 text-sm text-spec-red">
            Sign-in failed ({error}). Try again.
          </p>
        ) : null}
        {configured ? (
          <SignInButtons providers={enabledProviders()} next={safeNext} />
        ) : (
          <p className="mt-8 text-sm text-dust">
            Supabase is not configured. Set{' '}
            <code className="text-chalk">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-chalk">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
            <code className="text-chalk">.env</code>, then enable Google, Facebook and Microsoft
            under Authentication → Providers.
          </p>
        )}
      </section>
    </PageShell>
  );
}
