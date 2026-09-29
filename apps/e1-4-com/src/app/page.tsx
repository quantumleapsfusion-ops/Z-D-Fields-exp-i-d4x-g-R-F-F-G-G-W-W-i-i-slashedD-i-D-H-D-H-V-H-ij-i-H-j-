import type { Metadata } from "next";

import { MicPortal } from "@/features/portal/MicPortal";
import { getSessionUser } from "@/lib/auth/user";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      description: site.description,
      inLanguage: "en",
      publisher: {
        "@type": "Organization",
        name: site.org,
        url: site.philosophyUrl,
      },
    },
    {
      "@type": "WebApplication",
      name: site.name,
      url: site.url,
      description: site.description,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web",
      keywords: site.keywords.join(", "),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: {
        "@type": "Organization",
        name: site.org,
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
      <MicPortal signedIn={Boolean(user)} />
    </>
  );
}
