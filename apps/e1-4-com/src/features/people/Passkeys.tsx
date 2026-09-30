"use client";

import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useState, useSyncExternalStore, useTransition } from "react";

import {
  passkeyLoginOptionsAction,
  passkeyLoginVerifyAction,
  passkeyRegisterOptionsAction,
  passkeyRegisterVerifyAction,
  removePasskeyAction,
} from "@/app/actions/passkeys";

const button =
  "rounded-full border border-chalk/20 px-4 py-2 text-sm transition-colors hover:border-ochre hover:text-ochre disabled:opacity-50";

const noSubscribe = () => () => {};

/** `null` during server render, then whether this browser can use passkeys. */
function useSupported(): boolean | null {
  return useSyncExternalStore(noSubscribe, browserSupportsWebAuthn, () => null);
}

/** The browser rejects with NotAllowedError when the person cancels the Face ID/fingerprint sheet. */
function cancelled(error: unknown) {
  return error instanceof Error && error.name === "NotAllowedError";
}

export function AddPasskeyButton() {
  const supported = useSupported();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const add = () =>
    start(async () => {
      setMessage(null);
      const begun = await passkeyRegisterOptionsAction();
      if (!begun?.ok) {
        setMessage({ ok: false, text: begun?.message ?? "Passkey failed" });
        return;
      }
      try {
        const response = await startRegistration({ optionsJSON: begun.options });
        const result = await passkeyRegisterVerifyAction(
          begun.challengeId,
          response,
          navigator.platform || null,
        );
        if (result) setMessage({ ok: result.ok, text: result.message });
      } catch (error) {
        setMessage({
          ok: false,
          text: cancelled(error) ? "Cancelled" : "This device couldn't create a passkey",
        });
      }
    });

  if (supported === false) {
    return (
      <p className="text-dust text-sm">{"This browser doesn't support passkeys."}</p>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={add}
        disabled={pending || !supported}
        className={button}
      >
        {pending ? "Waiting for your device…" : "Add a passkey on this device"}
      </button>
      {message ? (
        <p
          role="status"
          className={`mt-2 text-sm ${message.ok ? "text-dust" : "text-ochre"}`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/talk";
}

export function PasskeySignInButton({ next }: { next?: string }) {
  const supported = useSupported();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const signIn = () =>
    start(async () => {
      setError(null);
      try {
        const { challengeId, options } = await passkeyLoginOptionsAction();
        const response = await startAuthentication({ optionsJSON: options });
        const result = await passkeyLoginVerifyAction(challengeId, response);
        if (result?.ok) window.location.assign(safeNext(next));
        else setError(result?.message ?? "Passkey failed");
      } catch (err) {
        setError(cancelled(err) ? null : "This device couldn't use a passkey");
      }
    });

  if (!supported) return null;
  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="bg-ochre text-blackboard w-full rounded-(--radius-board) px-4 py-3 text-left text-sm font-medium transition hover:opacity-90 disabled:opacity-60"
      >
        {pending
          ? "Waiting for your device…"
          : "Sign in with a passkey (Face ID, fingerprint)"}
      </button>
      {error ? <p className="text-ochre mt-2 text-sm">{error}</p> : null}
    </div>
  );
}

export function RemovePasskeyButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => removePasskeyAction(id))}
      className="text-dust hover:text-ochre text-sm disabled:opacity-50"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
