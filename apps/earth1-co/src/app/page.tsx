import { Logo } from "@earth-one/ui";

import { CiceroReveal } from "@/components/CiceroReveal";
import { Equations } from "@/components/Equations";
import { Mission } from "@/components/Mission";
import { Philosophy } from "@/components/Philosophy";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="chalk-surface min-h-screen">
      <header className="bg-blackboard/80 fixed inset-x-0 top-0 z-10 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo size={26} brand="earth1" title={site.org} />
            <span className="font-display text-lg tracking-tight">{site.name}</span>
          </div>
          <a
            href={site.flagship.url}
            className="label hover:text-ochre transition-colors"
            rel="noreferrer"
          >
            {site.flagship.domain} →
          </a>
        </div>
      </header>
      <main>
        <CiceroReveal />
        <Mission />
        <Equations />
        <Philosophy />
      </main>
      <footer className="border-chalk/10 border-t">
        <div className="text-dust mx-auto flex max-w-5xl flex-col gap-2 px-5 py-10 font-sans text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            {site.org} / {site.domain}
          </p>
          <a
            href={site.flagship.url}
            rel="noreferrer"
            className="label hover:text-ochre transition-colors"
          >
            {site.flagship.domain} →
          </a>
        </div>
      </footer>
    </div>
  );
}
