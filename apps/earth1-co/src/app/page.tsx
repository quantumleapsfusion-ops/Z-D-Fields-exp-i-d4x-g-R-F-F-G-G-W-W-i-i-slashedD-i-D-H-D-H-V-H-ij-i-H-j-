import type { Metadata } from "next";
import { Logo } from "@earth-one/ui";

import { CiceroPassage } from "@/components/CiceroPassage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#org`,
        name: site.org,
        alternateName: site.name,
        url: site.url,
        logo: `${site.url}/icon.png`,
        description: site.description,
        knowsAbout: ["Global citizenship"],
        sameAs: [site.flagshipUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.org,
        url: site.url,
        description: site.description,
        inLanguage: "en",
        publisher: { "@id": `${site.url}/#org` },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="flex min-h-[88svh] flex-col items-center justify-center px-6 text-center">
        <Logo
          brand="earth1"
          size={168}
          title={site.org}
          className="h-32 w-32 sm:h-44 sm:w-44"
        />
        <h1 className="mt-10 text-4xl tracking-[0.32em] sm:text-6xl">EARTH ONE</h1>
        <p className="mt-5 text-lg text-white/80 italic sm:text-2xl">{site.motto}</p>
      </header>

      <CiceroPassage />

      <section
        aria-labelledby="equations-heading"
        className="mx-auto mt-32 max-w-[92rem] px-5 pb-32 sm:px-10"
      >
        <h2 id="equations-heading" className="text-center text-2xl sm:text-3xl">
          Equations
        </h2>
        <div className="mx-auto mt-10 min-h-48 max-w-[70ch] rounded-sm border border-dashed border-white/25" />
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-white/60">
        {site.org} · {site.domain}
      </footer>
    </main>
  );
}
