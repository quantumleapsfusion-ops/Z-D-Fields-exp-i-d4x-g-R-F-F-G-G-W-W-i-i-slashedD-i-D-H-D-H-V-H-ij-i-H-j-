"use client";

import { useActionState, useTransition } from "react";

import {
  cancelDeletion,
  deleteAccount,
  updateName,
  uploadAvatar,
  type ActionState,
} from "@/app/actions/profile";
import { revokeShareAction } from "@/app/actions/stream";

const input =
  "w-full rounded-full border border-chalk/20 bg-transparent px-4 py-2 font-sans text-chalk placeholder:text-dust/60 focus:border-ochre focus:outline-none";
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

export function AvatarForm() {
  const [state, action, pending] = useActionState(uploadAvatar, null);
  return (
    <form action={action}>
      <input
        type="file"
        name="avatar"
        accept="image/png,image/jpeg,image/webp,image/gif"
        required
        className="text-dust file:border-chalk/20 file:text-chalk block w-full text-sm file:mr-3 file:rounded-full file:border file:bg-transparent file:px-3 file:py-1"
      />
      <button type="submit" disabled={pending} className={`${button} mt-3`}>
        {pending ? "Uploading…" : "Upload"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function NameForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(updateName, null);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input name="name" defaultValue={defaultName} maxLength={80} className={input} />
      <button type="submit" disabled={pending} className={`${button} self-start`}>
        Save
      </button>
      <Status state={state} />
    </form>
  );
}

export function DeleteAccountForm({
  deletionScheduledFor,
}: {
  deletionScheduledFor?: Date | null;
}) {
  const [state, action, pending] = useActionState(deleteAccount, null);

  if (deletionScheduledFor) {
    return (
      <div className="max-w-md">
        <p className="text-ochre mb-4 text-sm">
          Your account will be permanently deleted on{" "}
          <strong>{deletionScheduledFor.toLocaleDateString()}</strong>. You can cancel this
          anytime before then.
        </p>
        <CancelDeletionButton />
      </div>
    );
  }

  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      <input name="confirm" placeholder="Type DELETE to confirm" className={input} />
      <button
        type="submit"
        disabled={pending}
        className="border-ochre/60 text-ochre hover:bg-ochre hover:text-blackboard self-start rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50"
      >
        {pending ? "Scheduling deletion…" : "Delete everything"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function CancelDeletionButton() {
  const [state, start, pending] = useActionState(cancelDeletion, null);
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => start()}
        className="border-chalk/20 hover:border-chalk text-chalk self-start rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50"
      >
        {pending ? "Cancelling…" : "Cancel deletion"}
      </button>
      <Status state={state} />
    </>
  );
}

export function RevokeShareButton({ shareId }: { shareId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => revokeShareAction(shareId))}
      className="text-dust hover:text-ochre shrink-0 text-sm disabled:opacity-50"
    >
      Revoke
    </button>
  );
}
