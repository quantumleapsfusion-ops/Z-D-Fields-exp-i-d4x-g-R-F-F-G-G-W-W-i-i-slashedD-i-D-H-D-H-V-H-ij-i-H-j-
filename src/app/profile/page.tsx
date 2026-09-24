import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarForm } from "@/components/AvatarForm";
import { deleteMyAccount, ensureProfile, updateDisplayName } from "@/lib/account/actions";
import { AVATARS_BUCKET, storage } from "@/lib/storage";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const { error } = await searchParams;
  const profile = await ensureProfile();
  if (!profile) redirect("/login?next=/profile");

  const avatarUrl = profile.avatarPath
    ? `${storage.getPublicUrl(AVATARS_BUCKET, profile.avatarPath)}?v=${profile.updatedAt.getTime()}`
    : null;

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="font-display text-chalk text-4xl">Your profile</h1>
      <p className="text-dust mt-1 text-sm">{profile.email}</p>
      <div className="chalk-rule my-8" />

      {typeof error === "string" && (
        <p className="border-ochre text-ochre mb-6 rounded-(--radius-board) border px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <div className="grid gap-8 sm:grid-cols-[auto_1fr]">
        <AvatarForm avatarUrl={avatarUrl} displayName={profile.displayName} />

        <form action={updateDisplayName} className="flex flex-col gap-3">
          <label
            className="text-dust text-xs tracking-widest uppercase"
            htmlFor="displayName"
          >
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={profile.displayName ?? ""}
            maxLength={80}
            className="bg-board-2 border-line text-chalk focus:border-ochre rounded-(--radius-board) border px-3 py-2 outline-none"
          />
          <button
            type="submit"
            className="bg-ochre text-board self-start rounded-full px-4 py-2 text-sm font-medium"
          >
            Save
          </button>
        </form>
      </div>

      <div className="chalk-rule my-12" />

      <details className="border-line rounded-(--radius-board) border p-5">
        <summary className="text-dust cursor-pointer text-sm">Delete account</summary>
        <form action={deleteMyAccount} className="mt-4 flex flex-col gap-3">
          <p className="text-dust text-sm">
            This permanently removes your profile, voice streams, shares and every file
            you have uploaded. Type <span className="text-chalk font-mono">DELETE</span>{" "}
            to confirm.
          </p>
          <input
            name="confirm"
            autoComplete="off"
            className="bg-board-2 border-line text-chalk focus:border-ochre rounded-(--radius-board) border px-3 py-2 font-mono outline-none"
          />
          <button
            type="submit"
            className="border-ochre text-ochre hover:bg-ochre hover:text-board self-start rounded-full border px-4 py-2 text-sm"
          >
            Delete everything
          </button>
        </form>
      </details>
    </section>
  );
}
