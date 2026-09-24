import { redirect } from 'next/navigation';

import { Logo } from '@/components/Logo';
import { PageShell } from '@/components/PageShell';
import { enabledProviders, getSessionUser } from '@/lib/auth';

import { SignInButtons } from './SignInButtons';

export const metadata = { title: 'Sign in' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const safeCallback = callbackUrl?.startsWith('/') ? callbackUrl : '/stream';
  if (await getSessionUser().catch(() => null)) redirect(safeCallback);

  const providers = enabledProviders();

  return (
    <PageShell>
      <section className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <Logo size={64} />
        <h1 className="mt-8 font-display text-4xl tracking-tight">Greetings Earthling.</h1>
        <p className="mt-3 font-sans text-dust">Sign in to start your stream.</p>
        {error ? (
          <p className="mt-6 rounded-sm border border-ochre/40 px-4 py-2 text-sm text-ochre">
            Sign-in failed ({error}). Try again.
          </p>
        ) : null}
        <SignInButtons providers={providers} callbackUrl={safeCallback} />
        {providers.length === 0 ? (
          <p className="mt-8 text-sm text-dust">
            No sign-in providers are configured. Add OAuth credentials (or set{' '}
            <code className="text-chalk">AUTH_DEV_LOGIN=true</code> locally) in{' '}
            <code className="text-chalk">.env</code>.
          </p>
        ) : null}
      </section>
    </PageShell>
  );
}
