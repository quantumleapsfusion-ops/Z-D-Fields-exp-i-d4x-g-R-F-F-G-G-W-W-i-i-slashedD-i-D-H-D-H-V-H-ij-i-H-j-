import type { Metadata } from "next";

import { MicPortal } from "@/features/portal/MicPortal";
import { SpokenIntro } from "@/features/portal/SpokenIntro";
import { getSessionUser } from "@/lib/auth/user";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const org = {
  "@type": "Organization",
  "@id": `${site.philosophyUrl}/#org`,
  name: site.org,
  url: site.philosophyUrl,
  logo: `${site.url}/brand/earth1.png`,
  sameAs: [site.url, site.philosophyUrl],
};

/**
 * The page shows no text, so this is where search engines, link previews and assistants learn
 * what "e1-4" means. Keep it in step with `site.expansion` and the Open Graph image.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    org,
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      alternateName: [site.tagline, `${site.name} (${site.tagline})`],
      url: site.url,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": org["@id"] },
    },
    {
      "@type": "WebApplication",
      "@id": `${site.url}/#app`,
      name: site.name,
      alternateName: site.tagline,
      url: site.url,
      description: site.description,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires a microphone.",
      image: `${site.url}/opengraph-image.png`,
      keywords: site.keywords.join(", "),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": org["@id"] },
    },
    {
      "@type": "DefinedTerm",
      "@id": `${site.url}/#name`,
      name: site.name,
      termCode: site.name,
      description: `${site.expansion}: Earth (e), one (1) through four (4), the first four dimensions of a voice. ${site.pitch}`,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: `${site.org} names`,
        url: site.philosophyUrl,
      },
    },
  ],
};

export default async function Home() {
  const user = await getSessionUser().catch(() => null);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <h1 className="sr-only">
        {site.name}: {site.tagline}. {site.motto}
      </h1>
      <MicPortal signedIn={Boolean(user)} />
      {user ? null : <SpokenIntro />}
    </>
  );
}
