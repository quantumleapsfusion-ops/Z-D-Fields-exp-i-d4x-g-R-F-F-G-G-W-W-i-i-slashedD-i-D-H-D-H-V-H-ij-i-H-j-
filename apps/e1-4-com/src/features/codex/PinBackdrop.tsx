"use client";

import dynamic from "next/dynamic";

const PinField = dynamic(() => import("./PinField"), { ssr: false });

export function PinBackdrop() {
  return (
    <div className="absolute inset-0">
      <PinField phase="rest" />
    </div>
  );
}
