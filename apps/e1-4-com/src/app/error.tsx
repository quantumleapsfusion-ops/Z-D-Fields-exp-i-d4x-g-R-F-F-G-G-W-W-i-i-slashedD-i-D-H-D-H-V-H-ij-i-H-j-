"use client";

import { MicMark } from "@/components/MicMark";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex h-dvh items-center justify-center bg-black">
      <button type="button" onClick={reset} aria-label="e1-4">
        <MicMark className="h-32 w-32" />
      </button>
    </main>
  );
}
