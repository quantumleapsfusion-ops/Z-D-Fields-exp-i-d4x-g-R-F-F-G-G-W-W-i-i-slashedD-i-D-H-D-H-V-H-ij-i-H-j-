import type { Metadata } from "next";
import { Logo } from "@earth-one/ui";

import { DomainBridge } from "@/components/DomainBridge";
import { GovernanceManifesto } from "@/components/GovernanceManifesto";
import { HeroSection } from "@/components/HeroSection";
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

  return (
    <div className="chalk-surface min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <Logo size={26} brand="earth1" title={site.org} />
          <span className="font-display text-lg tracking-tight">{site.name}</span>
        </div>
        <a
          href={site.flagship.url}
          className="label hover:text-ochre transition-colors"
          rel="noreferrer"
        >
          {site.flagship.domain}
        </a>
      </header>
      <main>
        <HeroSection />
        <GovernanceManifesto />
        <DomainBridge />
      </main>
      <footer className="border-chalk/10 border-t">
        <div className="text-dust mx-auto flex max-w-5xl flex-col gap-2 px-5 py-10 font-sans text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            {site.org} / {site.domain}
          </p>
          <p className="label">est. earth</p>
        </div>
      </footer>
    </div>
  );
}
