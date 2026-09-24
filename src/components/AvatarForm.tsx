"use client";

import { useRef, useState, useTransition } from "react";
import { removeAvatar, uploadAvatar } from "@/lib/account/actions";

export function AvatarForm({
  avatarUrl,
  displayName,
}: {
  avatarUrl: string | null;
  displayName: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = (displayName ?? "?").trim().charAt(0).toUpperCase() || "?";

  function onFileChange() {
    const input = inputRef.current;
    if (!input?.files?.length) return;
    const formData = new FormData();
    formData.set("avatar", input.files[0]);
    startTransition(async () => {
      const result = await uploadAvatar(formData);
      setError(result.ok ? null : result.error);
      input.value = "";
    });
  }

  function onRemove() {
    startTransition(async () => {
      const result = await removeAvatar();
      setError(result.ok ? null : result.error);
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-board-2 border-line relative size-28 overflow-hidden rounded-full border">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL, no optimisation needed
          <img src={avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-display text-dust flex size-full items-center justify-center text-4xl">
            {initial}
          </span>
        )}
        {pending && <span className="bg-board/70 absolute inset-0 animate-pulse" />}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        id="avatar"
        onChange={onFileChange}
        disabled={pending}
      />
      <label
        htmlFor="avatar"
        className="border-line text-chalk hover:border-ochre cursor-pointer rounded-full border px-3 py-1 text-xs"
      >
        {avatarUrl ? "Change photo" : "Upload photo"}
      </label>
      {avatarUrl && (
        <button
          type="button"
          onClick={onRemove}
          disabled={pending}
          className="text-dust hover:text-ochre text-xs underline"
        >
          Remove
        </button>
      )}
      {error && <p className="text-ochre max-w-40 text-center text-xs">{error}</p>}
    </div>
  );
}
