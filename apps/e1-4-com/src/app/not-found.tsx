import Link from "next/link";

import { MicMark } from "@/components/MicMark";

export default function NotFound() {
  return (
    <main className="flex h-dvh items-center justify-center bg-black">
      <Link href="/" aria-label="e1-4">
        <MicMark className="h-32 w-32" />
      </Link>
    </main>
  );
}
