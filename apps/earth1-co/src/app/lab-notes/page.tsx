import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab Notes",
  description: "Lab notes from Earth 1 Lab research",
  alternates: { canonical: "/lab-notes" },
};

export default function LabNotesPage() {
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        Lab Notes
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        What we tried, what happened. Newest first.
      </p>

      <div className="mt-12 max-w-3xl text-left">
        <p className="text-white/50 text-sm font-light">
          Lab notes coming soon. Each entry is a dated post describing our
          research progress.
        </p>
      </div>
    </>
  );
}
