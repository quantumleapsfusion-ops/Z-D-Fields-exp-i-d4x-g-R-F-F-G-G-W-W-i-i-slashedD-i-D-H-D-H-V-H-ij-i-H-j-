import Link from 'next/link';

import { removeAvatar } from '@/app/actions/profile';
import { Avatar } from '@/components/Nav';
import { PageShell } from '@/components/PageShell';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';

import { AvatarForm, DeleteAccountForm, NameForm, RevokeShareButton } from './ProfileForms';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const sessionUser = await requireUser('/profile');
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    include: {
      accounts: { select: { provider: true } },
      shares: { where: { revokedAt: null }, orderBy: { createdAt: 'desc' } },
      stream: { select: { _count: { select: { segments: true } } } },
      _count: { select: { boards: true } },
    },
  });

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="flex items-center gap-6">
          <Avatar
            userId={user.id}
            image={user.image}
            name={user.name ?? user.email}
            hasUpload={Boolean(user.avatarKey)}
            size={88}
          />
          <div>
            <h1 className="font-display text-4xl tracking-tight">{user.name ?? 'Earthling'}</h1>
            <p className="mt-1 font-sans text-sm text-dust">{user.email}</p>
            <p className="label mt-2">
              {user.accounts.map((a) => a.provider).join(' · ') || 'dev login'}
            </p>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="label mb-3">Avatar</h2>
            <AvatarForm />
            {user.avatarKey ? (
              <form action={removeAvatar} className="mt-3">
                <button type="submit" className="text-sm text-dust hover:text-ochre">
                  Remove uploaded avatar
                </button>
              </form>
            ) : null}
          </div>
          <div>
            <h2 className="label mb-3">Name</h2>
            <NameForm defaultName={user.name ?? ''} />
          </div>
        </div>

        <div className="hairline my-10" />

        <h2 className="label mb-4">Your data</h2>
        <ul className="space-y-1 font-sans text-chalk/80">
          <li>
            <Link href="/stream" className="hover:text-ochre">
              Voice Stream segments: {user.stream?._count.segments ?? 0}
            </Link>
          </li>
          <li>Chalkboards: {user._count.boards}</li>
          <li>Active share links: {user.shares.length}</li>
        </ul>

        {user.shares.length > 0 ? (
          <ul className="mt-6 divide-y divide-chalk/10 rounded-sm border border-chalk/10">
            {user.shares.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <Link href={`/s/${s.token}`} className="truncate font-mono text-sm text-ochre">
                    /s/{s.token}
                  </Link>
                  <p className="label mt-1">
                    {s.segmentId ? 'One segment' : 'Whole stream'} ·{' '}
                    {[s.includeAudio && 'audio', s.includeTranscript && 'transcript']
                      .filter(Boolean)
                      .join(' + ')}
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
            className="rounded-full border border-chalk/20 px-4 py-2 text-sm hover:border-ochre hover:text-ochre"
          >
            Download my data (JSON)
          </a>
          <Link
            href="/api/auth/signout"
            className="rounded-full border border-chalk/20 px-4 py-2 text-sm hover:border-ochre hover:text-ochre"
          >
            Sign out
          </Link>
        </div>

        <div className="hairline my-10" />

        <h2 className="label mb-3 text-ochre">Delete account</h2>
        <p className="mb-4 max-w-xl text-sm leading-relaxed text-chalk/70">
          Permanently destroys your account, every Voice Stream segment and its audio, all
          transcriptions, share links, chalkboards and your avatar — database rows and stored files.
          This cannot be undone.
        </p>
        <DeleteAccountForm />
      </section>
    </PageShell>
  );
}
