import Link from "next/link";

import { site } from "@/lib/site";

export function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
      <p className="text-dust font-sans text-sm">
        Built by Earth One Global Coalescent. Global citizenship for all, one voice at a
        time.
      </p>
      <p className="mt-2 font-sans text-sm">
        <Link href={site.philosophyUrl} className="hover:text-ochre">
          Read the philosophy at earth1.co →
        </Link>
      </p>
    </section>
  );
}
