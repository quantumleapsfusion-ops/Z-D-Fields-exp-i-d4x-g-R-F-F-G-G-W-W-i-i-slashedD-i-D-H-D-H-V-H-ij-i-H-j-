import { Logo } from "@earth-one/ui";

import { DomainBridge } from "@/components/DomainBridge";
import { GovernanceManifesto } from "@/components/GovernanceManifesto";
import { HeroSection } from "@/components/HeroSection";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="chalk-surface min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <Logo size={26} variant="chalk" title={site.org} />
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
