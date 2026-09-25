import Link from 'next/link';

import { statusLabel, type Feature } from '@/lib/site';

export function FeatureBlock({ feature, enabled }: { feature: Feature; enabled: boolean }) {
  const { title, codenames, body, keywords, emphasis, href, status } = feature;

  return (
    <article
      className={
        emphasis
          ? 'rounded-sm border border-ochre/30 bg-chalk/[0.03] px-5 py-8 sm:px-8 sm:py-10'
          : 'px-0 py-8 sm:py-10'
      }
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <h3
          className={
            emphasis
              ? 'font-display text-3xl tracking-tight text-chalk sm:text-4xl'
              : 'font-display text-2xl tracking-tight text-chalk sm:text-3xl'
          }
        >
          {title}
        </h3>
        {codenames ? <p className="label sm:text-right">{codenames}</p> : null}
      </div>

      <p
        className={
          emphasis
            ? 'mt-5 max-w-3xl font-sans text-base leading-relaxed text-chalk/90 sm:text-lg'
            : 'mt-4 max-w-3xl font-sans text-base leading-relaxed text-chalk/75'
        }
      >
        {body}
      </p>

      {keywords ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <li
              key={keyword}
              className="rounded-full border border-chalk/15 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-label text-dust"
            >
              {keyword}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex items-center gap-4">
        {enabled ? (
          <Link
            href={href}
            className="inline-flex items-center gap-2 border-b border-ochre/60 pb-0.5 font-sans text-sm text-ochre transition-colors hover:border-ochre hover:text-chalk"
          >
            Open {title}
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className="font-sans text-sm text-dust">Not yet open</span>
        )}
        <span className="label">{statusLabel[status]}</span>
      </div>
    </article>
  );
}
