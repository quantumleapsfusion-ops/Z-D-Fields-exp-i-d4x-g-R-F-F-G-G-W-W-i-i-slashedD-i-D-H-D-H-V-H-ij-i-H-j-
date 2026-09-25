import Link from 'next/link';

import { DemoStream } from '@/components/DemoStream';
import { Lockup } from '@/components/Logo';
import { site } from '@/lib/site';

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-24">
      <Lockup width={320} priority className="max-w-full" />
      <h1 className="sr-only">
        {site.name} — {site.tagline}
      </h1>
      <p className="mt-8 max-w-2xl font-display text-2xl leading-snug tracking-display sm:text-4xl">
        {site.pitch}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/signin"
          className="inline-flex items-center rounded-full bg-chalk px-6 py-3 font-sans text-base font-medium text-blackboard transition-opacity hover:opacity-90"
        >
          Sign in
        </Link>
        <span className="font-sans text-sm text-dust">Google · Facebook · Microsoft</span>
      </div>
      <DemoStream className="mt-14 sm:mt-20" />
    </section>
  );
}
