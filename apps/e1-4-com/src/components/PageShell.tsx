import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export function PageShell({
  children,
  footer = true,
}: {
  children: React.ReactNode;
  footer?: boolean;
}) {
  return (
    <>
      <Nav />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      {footer ? <Footer /> : null}
    </>
  );
}

export function PageHeading({
  title,
  codenames,
  tagline,
  status,
}: {
  title: string;
  codenames?: string;
  tagline: string;
  status?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{title}</h1>
        {status ? <span className="label text-ochre">{status}</span> : null}
      </div>
      {codenames ? <p className="label mt-2">{codenames}</p> : null}
      <p className="text-chalk/75 mt-4 max-w-3xl font-sans text-base leading-relaxed">
        {tagline}
      </p>
    </div>
  );
}
