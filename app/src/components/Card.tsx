import type { ReactNode } from "react";

type CardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export default function Card({ title, description, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}
