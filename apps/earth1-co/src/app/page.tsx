import type { Metadata } from "next";

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
        knowsAbout: site.pillars.map((p) => p.title),
        founder: {
          "@type": "Person",
          name: site.founder.name,
          jobTitle: site.founder.role,
          email: site.founder.email,
        },
        email: site.founder.email,
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <h1 className="sr-only">
        {site.org}: {site.focus}
      </h1>
      <figure>
        <blockquote
          lang="la"
          className="font-display text-[1.2rem] leading-[1.5] tracking-[0.12em] uppercase sm:text-3xl lg:text-4xl"
        >
          {site.quote.latin}
        </blockquote>
        <figcaption className="label mt-6">
          {site.quote.english}
          <span className="mt-3 block text-white/40">{site.quote.author}</span>
        </figcaption>
      </figure>
    </>
  );
}
