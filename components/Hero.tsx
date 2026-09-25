import Link from 'next/link';

import { DemoStream } from '@/components/DemoStream';
import { Lockup } from '@/components/Logo';
import { site } from '@/lib/site';

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-24">
      <Lockup width={320} priority className="max-w-full" />
      <h1 className="mt-10 font-display text-[3rem] leading-[0.95] tracking-tight sm:text-[5.5rem] lg:text-[7rem]">
        {site.hero}
      </h1>
      <p className="mt-5 font-display text-2xl text-dust sm:text-3xl">{site.motto}</p>
      <p className="mt-6 font-sans text-xl text-dust sm:mt-8 sm:text-2xl">{site.tagline}</p>
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
