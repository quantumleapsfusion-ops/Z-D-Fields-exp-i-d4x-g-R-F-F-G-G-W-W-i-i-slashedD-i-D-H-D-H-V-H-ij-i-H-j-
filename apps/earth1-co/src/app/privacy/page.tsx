import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Earth 1 Lab Privacy Policy",
  alternates: { canonical: "/privacy" },
  robots: "noindex,nofollow",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        Privacy Policy
      </h1>
      <div className="mt-12 max-w-3xl space-y-8 text-left">
        <p className="text-white/50 text-sm font-light">
          Privacy policy coming soon. This page will be linked in the footer once approved.
        </p>
      </div>
    </>
  );
}
