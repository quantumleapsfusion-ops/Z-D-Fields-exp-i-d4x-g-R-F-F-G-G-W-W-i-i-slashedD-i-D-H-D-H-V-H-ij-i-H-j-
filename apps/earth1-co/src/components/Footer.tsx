import { Earth1Mark } from "@earth-one/ui";
import Link from "next/link";

import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 pt-10 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-white/70 hover:text-white"
        >
          <Earth1Mark size={24} />
          <span className="label text-inherit">{site.motto}</span>
        </Link>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <li>
            <a href="https://e1-4.com" className="label hover:text-white">
              e1-4.com
            </a>
          </li>
          <li>
            <Link href="/founder" className="label hover:text-white">
              Founder
            </Link>
          </li>
          <li>
            <a href={`mailto:${site.founder.email}`} className="label hover:text-white">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
