'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

import type { ProviderSummary } from '@/lib/auth';

const LABELS: Record<string, string> = {
  google: 'Continue with Google',
  facebook: 'Continue with Facebook',
  'azure-ad': 'Continue with Microsoft',
};

export function SignInButtons({
  providers,
  callbackUrl,
}: {
  providers: ProviderSummary[];
  callbackUrl: string;
}) {
  const [email, setEmail] = useState('');
  const oauth = providers.filter((p) => p.id !== 'dev');
  const dev = providers.find((p) => p.id === 'dev');

  return (
    <div className="mt-10 flex w-full flex-col gap-3">
      {oauth.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => signIn(p.id, { callbackUrl })}
          className="w-full rounded-full border border-chalk/20 px-5 py-3 font-sans text-chalk transition-colors hover:border-ochre hover:text-ochre"
        >
          {LABELS[p.id] ?? `Continue with ${p.name}`}
        </button>
      ))}
      {dev ? (
        <form
          className="mt-4 flex flex-col gap-2 border-t border-chalk/10 pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            void signIn('dev', { email, callbackUrl });
          }}
        >
          <label htmlFor="dev-email" className="label text-left">
            Dev login (local only)
          </label>
          <input
            id="dev-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-full border border-chalk/20 bg-transparent px-5 py-3 font-sans text-chalk placeholder:text-dust/60 focus:border-ochre focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-ochre px-5 py-3 font-sans font-medium text-blackboard transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      ) : null}
    </div>
  );
}
