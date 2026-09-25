import Link from 'next/link';

import { site } from '@/lib/site';

export function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
      <p className="max-w-3xl font-display text-2xl leading-snug tracking-display sm:text-4xl">
        {site.community}.
      </p>
      <p className="mt-4 max-w-2xl font-sans text-base text-dust sm:text-lg">
        By 2030 the world communicates by speaking. Start your audio diary today.
      </p>
      <Link
        href="/signin"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-chalk px-6 py-3 font-sans text-base font-medium text-blackboard transition-opacity hover:opacity-90"
      >
        Sign in and say hello to earth
      </Link>
    </section>
  );
}
