"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  hasPasskeyAction,
  passkeyLoginOptionsAction,
  passkeyLoginVerifyAction,
  passkeyRegisterOptionsAction,
  passkeyRegisterVerifyAction,
} from "@/app/actions/passkeys";
import { haptic } from "@/lib/device/haptics";

const KEY =
  "M15.5 7.5a3.5 3.5 0 1 1-2.1 6.3L9 18.2V20H7v-2H5v-2h2.2l4.6-4.6A3.5 3.5 0 0 1 15.5 7.5Z";

function KeyGlyph({ plus }: { plus?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={KEY} />
      {plus ? <path d="M19 3v4M17 5h4" /> : null}
    </svg>
  );
}

const buttonClass =
  "text-dust hover:text-chalk flex h-12 w-12 items-center justify-center rounded-full border border-chalk/20 transition-colors disabled:opacity-40";

/**
 * The silent way back in when the voice is not recognised (a noisy room, a sore throat). The
 * phone's own prompt (Face ID, fingerprint, PIN) does the rest; the page says nothing.
 */
export function PasskeyLogin({ next }: { next: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      const { challengeId, options } = await passkeyLoginOptionsAction();
      const response = await startAuthentication({ optionsJSON: options });
      const { ok } = await passkeyLoginVerifyAction(challengeId, response);
      if (!ok) throw new Error("not verified");
      haptic("accepted");
      router.replace(next);
      router.refresh();
    } catch {
      haptic("rejected");
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      aria-label="Passkey"
      disabled={busy}
      onClick={go}
      className={buttonClass}
    >
      <KeyGlyph />
    </button>
  );
}

/** Signed in with no passkey yet: one tap adds one. Disappears once there is one. */
export function PasskeyAdd() {
  const [has, setHas] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    hasPasskeyAction()
      .then((value) => live && setHas(value))
      .catch(() => null);
    return () => {
      live = false;
    };
  }, []);
  if (has) return null;
  const go = async () => {
    setBusy(true);
    try {
      const begin = await passkeyRegisterOptionsAction();
      if (!begin) throw new Error("no options");
      const response = await startRegistration({ optionsJSON: begin.options });
      const { ok } = await passkeyRegisterVerifyAction(begin.challengeId, response);
      if (!ok) throw new Error("not verified");
      haptic("saved");
      setHas(true);
    } catch {
      haptic("rejected");
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      aria-label="Add passkey"
      disabled={busy}
      onClick={go}
      className={buttonClass}
    >
      <KeyGlyph plus />
    </button>
  );
}
