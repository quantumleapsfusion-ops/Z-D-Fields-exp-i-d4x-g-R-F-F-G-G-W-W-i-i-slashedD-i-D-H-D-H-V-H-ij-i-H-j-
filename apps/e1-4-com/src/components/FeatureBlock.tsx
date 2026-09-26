import Link from "next/link";

import { statusLabel, type Feature } from "@/lib/site";

export function FeatureBlock({
  feature,
  enabled,
}: {
  feature: Feature;
  enabled: boolean;
}) {
  const { title, codenames, body, keywords, emphasis, href, status } = feature;

  return (
    <article
      className={
        emphasis
          ? "border-ochre/30 bg-chalk/[0.03] rounded-sm border px-5 py-8 sm:px-8 sm:py-10"
          : "px-0 py-8 sm:py-10"
      }
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <h3
          className={
            emphasis
              ? "font-display text-chalk text-3xl tracking-tight sm:text-4xl"
              : "font-display text-chalk text-2xl tracking-tight sm:text-3xl"
          }
        >
          {title}
        </h3>
        {codenames ? <p className="label sm:text-right">{codenames}</p> : null}
      </div>

      <p
        className={
          emphasis
            ? "text-chalk/90 mt-5 max-w-3xl font-sans text-base leading-relaxed sm:text-lg"
            : "text-chalk/75 mt-4 max-w-3xl font-sans text-base leading-relaxed"
        }
      >
        {body}
      </p>

      {keywords ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <li
              key={keyword}
              className="border-chalk/15 tracking-label text-dust rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase"
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
            className="border-ochre/60 text-ochre hover:border-ochre hover:text-chalk inline-flex items-center gap-2 border-b pb-0.5 font-sans text-sm transition-colors"
          >
            Open {title}
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className="text-dust font-sans text-sm">Not yet open</span>
        )}
        <span className="label">{statusLabel[status]}</span>
      </div>
    </article>
  );
}
