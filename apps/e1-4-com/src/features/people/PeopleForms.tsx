"use client";

import { useActionState, useState } from "react";

import { addContactByHandleAction, claimHandleAction } from "@/app/actions/people";
import type { ActionState } from "@/app/actions/profile";

const input =
  "min-w-0 flex-1 rounded-full border border-chalk/20 bg-transparent px-4 py-2 font-sans text-chalk placeholder:text-dust/60 focus:border-ochre focus:outline-none";
const button =
  "rounded-full border border-chalk/20 px-4 py-2 text-sm transition-colors hover:border-ochre hover:text-ochre disabled:opacity-50";

function Status({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p role="status" className={`mt-2 text-sm ${state.ok ? "text-dust" : "text-ochre"}`}>
      {state.message}
    </p>
  );
}

export function HandleForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState(claimHandleAction, null);
  return (
    <form action={action}>
      <div className="flex gap-2">
        <input
          name="handle"
          defaultValue={current ?? ""}
          placeholder="@yourname"
          aria-label="Handle"
          maxLength={21}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={input}
        />
        <button type="submit" disabled={pending} className={button}>
          {current ? "Change" : "Claim"}
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}

export function AddContactForm() {
  const [state, action, pending] = useActionState(addContactByHandleAction, null);
  return (
    <form action={action}>
      <div className="flex gap-2">
        <input
          name="handle"
          placeholder="@their_handle"
          aria-label="Their handle"
          maxLength={21}
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={input}
        />
        <button type="submit" disabled={pending} className={button}>
          Add
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}

/** Copies (or, on phones, offers the system share sheet for) your `/u/<handle>` link. */
export function ShareMyLink({ url }: { url: string }) {
  const [note, setNote] = useState<string | null>(null);
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Talk to me on e1-4", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNote("Link copied");
    } catch {
      setNote(null);
    }
  };
  return (
    <div>
      <button type="button" onClick={share} className={button}>
        Share my link
      </button>
      {note ? <span className="text-dust ml-3 text-sm">{note}</span> : null}
    </div>
  );
}
