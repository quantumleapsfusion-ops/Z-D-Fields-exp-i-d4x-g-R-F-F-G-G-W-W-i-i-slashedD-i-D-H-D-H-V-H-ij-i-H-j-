import type { Metadata } from "next";

import { Equations } from "@/components/Equations";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Mission } from "@/components/Mission";
import { Nav } from "@/components/Nav";
import { Philosophy } from "@/components/Philosophy";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#org`,
      name: site.org,
      alternateName: site.name,
      url: site.url,
      logo: `${site.url}/icon.svg`,
      description: site.description,
      knowsAbout: ["Global citizenship", "Data sovereignty", "Free speech", "Privacy"],
      sameAs: [site.flagship.url],
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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Nav />
      <main>
        <Hero />
        <Mission />
        <Equations />
        <Philosophy />
      </main>
      <Footer />
    </div>
  );
}
