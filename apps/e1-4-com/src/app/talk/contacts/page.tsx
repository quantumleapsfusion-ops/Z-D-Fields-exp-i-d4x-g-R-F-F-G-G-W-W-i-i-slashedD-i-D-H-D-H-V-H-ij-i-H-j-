import QRCode from "qrcode";
import Link from "next/link";

import { openDirectAction, removeContactAction } from "@/app/actions/people";
import { Avatar } from "@/components/Avatar";
import { PageHeading, PageShell } from "@/components/PageShell";
import { AddContactForm, HandleForm, ShareMyLink } from "@/features/people/PeopleForms";
import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { publicEnv } from "@/lib/env";
import { listContacts } from "@/lib/people/contacts";

export const metadata = { title: "Contacts", robots: { index: false } };

export default async function ContactsPage() {
  const user = await requireUser("/talk/contacts");
  const [me, contacts] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { handle: true } }),
    listContacts(user.id),
  ]);
  const myUrl = me.handle
    ? new URL(`/@${me.handle}`, publicEnv.siteUrl).toString()
    : null;
  const qr = myUrl
    ? await QRCode.toString(myUrl, {
        type: "svg",
        margin: 1,
        color: { dark: "#f1ede1", light: "#000000" },
      })
    : null;

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <PageHeading
          title="Contacts"
          dimension={1}
          tagline="Your @handle is your number. Share it, show your code, and talk to anyone here with one tap."
        />

        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="label mb-3">Your handle</h2>
            {me.handle ? (
              <p className="font-display text-chalk mb-3 text-3xl">@{me.handle}</p>
            ) : (
              <p className="text-chalk/75 mb-3 text-sm">
                Claim a handle so people can add you.
              </p>
            )}
            <HandleForm current={me.handle} />
            {myUrl ? (
              <div className="mt-4">
                <ShareMyLink url={myUrl} />
              </div>
            ) : null}
          </div>
          {qr ? (
            <div>
              <h2 className="label mb-3">Your code</h2>
              <div
                className="border-chalk/15 w-48 overflow-hidden rounded-sm border"
                role="img"
                aria-label={`QR code for @${me.handle}`}
                dangerouslySetInnerHTML={{ __html: qr }}
              />
              <p className="text-dust mt-2 text-xs">
                They point their phone camera at it to open your page.
              </p>
            </div>
          ) : null}
        </div>

        <div className="hairline my-10" />

        <h2 className="label mb-3">Add someone</h2>
        <AddContactForm />

        <div className="mt-10">
          {contacts.length === 0 ? (
            <p className="text-dust text-sm">
              No contacts yet. Add someone by their @handle, or scan their code.
            </p>
          ) : (
            <ul className="divide-chalk/10 border-chalk/10 divide-y rounded-sm border">
              {contacts.map((c) => (
                <li key={c.id} className="flex items-center gap-4 px-4 py-3">
                  <Avatar image={c.image} name={c.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-chalk truncate font-sans">{c.name}</p>
                    {c.handle ? (
                      <Link href={`/@${c.handle}`} className="label hover:text-ochre">
                        @{c.handle}
                      </Link>
                    ) : null}
                  </div>
                  <form action={openDirectAction.bind(null, c.id)}>
                    <button
                      type="submit"
                      className="bg-ochre text-blackboard rounded-full px-4 py-1.5 text-sm font-medium hover:opacity-90"
                    >
                      Talk
                    </button>
                  </form>
                  <form action={removeContactAction.bind(null, c.id)}>
                    <button type="submit" className="text-dust hover:text-ochre text-sm">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  );
}
