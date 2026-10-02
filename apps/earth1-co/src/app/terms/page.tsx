import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Earth 1 Lab Terms of Service",
  alternates: { canonical: "/terms" },
  robots: "noindex,nofollow",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        Terms of Service
      </h1>
      <div className="mt-12 max-w-3xl space-y-8 text-left">
        <p className="text-white/50 text-sm font-light">
          Terms of service coming soon. This page will be linked in the footer once approved.
        </p>
      </div>
    </>
  );
}
