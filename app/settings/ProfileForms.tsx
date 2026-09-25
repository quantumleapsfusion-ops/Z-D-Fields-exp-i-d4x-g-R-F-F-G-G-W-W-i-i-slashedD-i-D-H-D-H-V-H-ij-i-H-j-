'use client';

import { useActionState, useTransition } from 'react';

import {
  deleteAccount,
  destroyVoiceData,
  updateName,
  uploadAvatar,
  type ActionState,
} from '@/app/actions/profile';
import { revokeShareAction } from '@/app/actions/stream';

const input =
  'w-full rounded-full border border-chalk/20 bg-transparent px-4 py-2 font-sans text-chalk placeholder:text-dust/60 focus:border-ochre focus:outline-none';
const button =
  'rounded-full border border-chalk/20 px-4 py-2 text-sm transition-colors hover:border-ochre hover:text-ochre disabled:opacity-50';

function Status({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p role="status" className={`mt-2 text-sm ${state.ok ? 'text-dust' : 'text-ochre'}`}>
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
        className="block w-full text-sm text-dust file:mr-3 file:rounded-full file:border file:border-chalk/20 file:bg-transparent file:px-3 file:py-1 file:text-chalk"
      />
      <button type="submit" disabled={pending} className={`${button} mt-3`}>
        {pending ? 'Uploading…' : 'Upload'}
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

export function DestroyVoiceDataForm() {
  const [state, action, pending] = useActionState(destroyVoiceData, null);
  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      <label htmlFor="destroy-confirm" className="sr-only">
        Type DESTROY to confirm
      </label>
      <input
        id="destroy-confirm"
        name="confirm"
        placeholder="Type DESTROY to confirm"
        autoComplete="off"
        className={input}
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-spec-red/70 px-4 py-2 text-sm text-spec-red transition-colors hover:bg-spec-red hover:text-white disabled:opacity-50"
      >
        {pending ? 'Destroying…' : 'Destroy all my voice data'}
      </button>
      <Status state={state} />
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, null);
  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      <input name="confirm" placeholder="Type DELETE to confirm" className={input} />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-ochre/60 px-4 py-2 text-sm text-ochre transition-colors hover:bg-ochre hover:text-blackboard disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Delete everything'}
      </button>
      <Status state={state} />
    </form>
  );
}

export function RevokeShareButton({ shareId }: { shareId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => revokeShareAction(shareId))}
      className="shrink-0 text-sm text-dust hover:text-ochre disabled:opacity-50"
    >
      Revoke
    </button>
  );
}
