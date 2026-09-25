'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export const CONSENT_KEY = 'e1-4:consent';
export type Consent = 'essential' | 'all';

export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === 'essential' || v === 'all' ? v : null;
}

/**
 * Cookie banner. Only essential cookies (the sign-in session) exist today; any
 * future analytics or ad pixels must check `readConsent() === 'all'` before loading.
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readConsent() === null);
  }, []);

  if (!open) return null;

  const choose = (c: Consent) => {
    window.localStorage.setItem(CONSENT_KEY, c);
    window.dispatchEvent(new CustomEvent('e1-4:consent', { detail: c }));
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-chalk/10 bg-blackboard/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-4 font-sans text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-chalk/80">
          e1-4 uses one essential cookie to keep you signed in. Optional cookies measure sign-ups
          and are off until you allow them.{' '}
          <Link href="/privacy" className="text-chalk underline underline-offset-4">
            Privacy
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => choose('essential')}
            className="rounded-full border border-chalk/25 px-4 py-2 text-chalk transition-colors hover:border-chalk"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose('all')}
            className="rounded-full bg-chalk px-4 py-2 text-blackboard transition-opacity hover:opacity-90"
          >
            Allow all
          </button>
        </div>
      </div>
    </div>
  );
}
