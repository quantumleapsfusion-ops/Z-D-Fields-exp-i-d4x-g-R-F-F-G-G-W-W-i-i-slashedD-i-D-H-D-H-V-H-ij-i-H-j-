import type { Feature } from '@/lib/site';

export function FeatureBlock({ feature }: { feature: Feature }) {
  const { title, codenames, body, keywords, emphasis } = feature;

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
    </article>
  );
}
