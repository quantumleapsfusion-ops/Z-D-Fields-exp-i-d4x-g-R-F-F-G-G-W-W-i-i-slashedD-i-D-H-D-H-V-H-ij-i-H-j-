import Link from "next/link";
import { notFound } from "next/navigation";

import { addContactAction, openDirectAction } from "@/app/actions/people";
import { Avatar } from "@/components/Avatar";
import { PageShell } from "@/components/PageShell";
import { getUserId } from "@/lib/auth/user";
import { isContact } from "@/lib/people/contacts";
import { findByHandle } from "@/lib/people/handles";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const person = await findByHandle(decodeURIComponent(handle));
  return {
    title: person ? `${person.name} (@${person.handle})` : "Not found",
    description: person ? `Talk to @${person.handle} by voice on e1-4.` : undefined,
    robots: { index: false },
  };
}

/** Where a shared link or scanned QR code lands: someone's e1-4 card. */
export default async function PersonPage({ params }: Props) {
  const { handle } = await params;
  const person = await findByHandle(decodeURIComponent(handle));
  if (!person) notFound();
  const viewerId = await getUserId();
  const self = viewerId === person.id;
  const saved = viewerId && !self ? await isContact(viewerId, person.id) : false;
  const here = `/@${person.handle}`;

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-5 py-20 text-center sm:px-8">
        <div className="flex justify-center">
          <Avatar image={person.image} name={person.name} size={88} />
        </div>
        <h1 className="font-display mt-6 text-4xl tracking-tight">{person.name}</h1>
        <p className="label mt-2">@{person.handle}</p>

        {self ? (
          <p className="text-dust mt-8 text-sm">
            This is your page. Share it, or show your code from{" "}
            <Link href="/talk/contacts" className="text-ochre">
              Contacts
            </Link>
            .
          </p>
        ) : viewerId ? (
          <div className="mt-8 flex justify-center gap-3">
            <form action={openDirectAction.bind(null, person.id)}>
              <button
                type="submit"
                className="bg-ochre text-blackboard rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
              >
                Talk
              </button>
            </form>
            {saved ? null : (
              <form action={addContactAction.bind(null, person.id)}>
                <button
                  type="submit"
                  className="border-chalk/20 hover:border-ochre hover:text-ochre rounded-full border px-6 py-3 text-sm"
                >
                  Add to contacts
                </button>
              </form>
            )}
          </div>
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(here)}`}
            className="bg-ochre text-blackboard mt-8 inline-block rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Sign in to talk
          </Link>
        )}
      </section>
    </PageShell>
  );
}
