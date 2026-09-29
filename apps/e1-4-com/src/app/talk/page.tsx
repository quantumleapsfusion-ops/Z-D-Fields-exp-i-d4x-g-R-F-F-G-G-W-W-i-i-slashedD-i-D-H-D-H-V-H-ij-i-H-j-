import Link from "next/link";

import { startConversationAction } from "@/app/actions/talk";
import { Avatar } from "@/components/Avatar";
import { PageHeading, PageShell } from "@/components/PageShell";
import { formatDay, formatTime } from "@/features/voice-stream/format";
import { requireUser } from "@/lib/auth/user";
import { listConversations } from "@/lib/talk/conversations";

export const metadata = { title: "Talk", robots: { index: false } };

export default async function TalkInbox() {
  const user = await requireUser("/talk");
  const conversations = await listConversations(user.id);

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <PageHeading
          title="Talk"
          dimension={1}
          tagline="Voice, not calls. Send a voice note or go live; they listen and reply when they want. Every conversation is kept whole, transcribed, and plays back end to end."
        />

        <form action={startConversationAction} className="flex flex-wrap gap-3">
          <Link
            href="/talk/contacts"
            className="border-chalk/20 hover:border-ochre hover:text-ochre rounded-full border px-5 py-2 text-sm"
          >
            Contacts
          </Link>
          <input
            name="title"
            maxLength={120}
            placeholder="Name it (optional)"
            aria-label="Conversation name"
            className="border-chalk/20 focus:border-ochre min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-ochre text-blackboard rounded-full px-5 py-2 text-sm font-medium hover:opacity-90"
          >
            New conversation
          </button>
        </form>

        <div className="mt-10">
          {conversations.length === 0 ? (
            <p className="font-display text-dust text-center text-xl">
              No conversations yet. Talk to someone from your contacts, or start one and
              send the invite link.
            </p>
          ) : (
            <ul className="divide-chalk/10 border-chalk/10 divide-y rounded-sm border">
              {conversations.map((c) => {
                const others = c.members.filter((m) => !m.you);
                const live = others.filter((m) => m.liveId);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/talk/${c.id}`}
                      className="hover:bg-chalk/[0.03] flex items-center gap-4 px-4 py-4 transition-colors"
                    >
                      <div className="flex -space-x-2">
                        {(others.length > 0 ? others : c.members).slice(0, 3).map((m) => (
                          <Avatar key={m.id} image={m.image} name={m.name} size={36} />
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-chalk truncate font-sans">{c.title}</p>
                        <p className="label mt-1">
                          {live.length > 0 ? (
                            <span className="text-ochre">
                              ● {live.map((m) => m.name).join(", ")} live now
                            </span>
                          ) : c.lastNoteAt ? (
                            `${formatDay(c.lastNoteAt)} · ${formatTime(c.lastNoteAt)}`
                          ) : null}
                        </p>
                      </div>
                      {c.unread > 0 ? (
                        <span
                          className="bg-ochre text-blackboard min-w-6 rounded-full px-2 py-0.5 text-center font-mono text-xs"
                          aria-label={`${c.unread} unheard`}
                        >
                          {c.unread}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  );
}
