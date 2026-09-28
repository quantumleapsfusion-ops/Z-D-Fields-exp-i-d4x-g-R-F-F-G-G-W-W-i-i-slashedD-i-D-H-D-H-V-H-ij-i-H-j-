import Link from "next/link";

import { removeAvatar } from "@/app/actions/profile";
import { Avatar } from "@/components/Nav";
import { PageShell } from "@/components/PageShell";
import { signOut } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { AVATARS_BUCKET, storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/supabase/server";

import {
  AvatarForm,
  DeleteAccountForm,
  NameForm,
  RevokeShareButton,
} from "./ProfileForms";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const sessionUser = await requireUser("/profile");
  const authUser = await getCurrentUser();
  const providers = authUser?.identities?.map((i) => i.provider) ?? [];
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    include: {
      shares: { where: { revokedAt: null }, orderBy: { createdAt: "desc" } },
      stream: { select: { _count: { select: { segments: true } } } },
      _count: { select: { boards: true } },
    },
  });

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="flex items-center gap-6">
          <Avatar
            image={
              user.avatarPath
                ? storage.getPublicUrl(AVATARS_BUCKET, user.avatarPath)
                : sessionUser.image
            }
            name={user.displayName ?? user.email}
            size={88}
          />
          <div>
            <h1 className="font-display text-4xl tracking-tight">
              {user.displayName ?? "Earthling"}
            </h1>
            <p className="text-dust mt-1 font-sans text-sm">{user.email}</p>
            <p className="label mt-2">{providers.join(" · ") || "Supabase Auth"}</p>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="label mb-3">Avatar</h2>
            <AvatarForm />
            {user.avatarPath ? (
              <form action={removeAvatar} className="mt-3">
                <button type="submit" className="text-dust hover:text-ochre text-sm">
                  Remove uploaded avatar
                </button>
              </form>
            ) : null}
          </div>
          <div>
            <h2 className="label mb-3">Name</h2>
            <NameForm defaultName={user.displayName ?? ""} />
          </div>
        </div>

        <div className="hairline my-10" />

        <h2 className="label mb-4">Your data</h2>
        <ul className="text-chalk/80 space-y-1 font-sans">
          <li>
            <Link href="/stream" className="hover:text-ochre">
              Voice Stream segments: {user.stream?._count.segments ?? 0}
            </Link>
          </li>
          <li>Chalkboards: {user._count.boards}</li>
          <li>Active share links: {user.shares.length}</li>
        </ul>

        {user.shares.length > 0 ? (
          <ul className="divide-chalk/10 border-chalk/10 mt-6 divide-y rounded-sm border">
            {user.shares.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/s/${s.token}`}
                    className="text-ochre truncate font-mono text-sm"
                  >
                    /s/{s.token}
                  </Link>
                  <p className="label mt-1">
                    {s.segmentId ? "One segment" : "Whole stream"} ·{" "}
                    {[s.includeAudio && "audio", s.includeTranscript && "transcript"]
                      .filter(Boolean)
                      .join(" + ")}
                  </p>
                </div>
                <RevokeShareButton shareId={s.id} />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/api/account/export"
            className="border-chalk/20 hover:border-ochre hover:text-ochre rounded-full border px-4 py-2 text-sm"
          >
            Download my data (JSON)
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="border-chalk/20 hover:border-ochre hover:text-ochre rounded-full border px-4 py-2 text-sm"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="hairline my-10" />

        <h2 className="label text-ochre mb-3">Delete account</h2>
        <p className="text-chalk/70 mb-4 max-w-xl text-sm leading-relaxed">
          Permanently destroys your account, every Voice Stream segment and its audio, all
          transcriptions, share links, chalkboards and your avatar — database rows and
          stored files. This cannot be undone.
        </p>
        <DeleteAccountForm />
      </section>
    </PageShell>
  );
}
