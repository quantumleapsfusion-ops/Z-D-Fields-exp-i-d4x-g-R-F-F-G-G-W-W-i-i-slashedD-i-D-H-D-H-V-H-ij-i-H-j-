import Link from "next/link";

import { startConversationAction } from "@/app/actions/talk";
import { Avatar } from "@/components/Avatar";
import { PageShell } from "@/components/PageShell";
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
        <h1 className="sr-only">Talk</h1>

        <form
          action={startConversationAction}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/talk/contacts"
            aria-label="Contacts"
            title="Contacts"
            className="border-chalk/20 hover:border-ochre hover:text-ochre flex h-12 w-12 items-center justify-center rounded-full border transition-colors"
          >
            <Icon d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 20a5 5 0 0 0-4-5" />
          </Link>
          <button
            type="submit"
            aria-label="New conversation"
            title="New conversation"
            className="bg-ochre text-blackboard flex h-16 w-16 items-center justify-center rounded-full hover:opacity-90"
          >
            <Icon d="M12 5v14M5 12h14" large />
          </button>
        </form>

        <div className="mt-12">
          {conversations.length === 0 ? (
            <p className="sr-only">No conversations yet.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-6 sm:grid-cols-4">
              {conversations.map((c) => {
                const others = c.members.filter((m) => !m.you);
                const live = others.filter((m) => m.liveId);
                const faces = (others.length > 0 ? others : c.members).slice(0, 3);
                const label = [
                  c.title,
                  live.length > 0
                    ? `${live.map((m) => m.name).join(", ")} live now`
                    : c.lastNoteAt
                      ? `${formatDay(c.lastNoteAt)} ${formatTime(c.lastNoteAt)}`
                      : null,
                  c.unread > 0 ? `${c.unread} unheard` : null,
                ]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <li key={c.id} className="flex justify-center">
                    <Link
                      href={`/talk/${c.id}`}
                      aria-label={label}
                      title={c.title}
                      className="hover:bg-chalk/[0.04] relative flex h-24 w-24 items-center justify-center rounded-full transition-colors"
                    >
                      {live.length > 0 ? (
                        <span
                          aria-hidden="true"
                          className="border-ochre absolute inset-1 animate-pulse rounded-full border-2"
                        />
                      ) : null}
                      <span className="flex -space-x-3">
                        {faces.map((m) => (
                          <Avatar key={m.id} image={m.image} name={m.name} size={44} />
                        ))}
                      </span>
                      {c.unread > 0 ? (
                        <span
                          aria-hidden="true"
                          className="bg-ochre absolute top-3 right-3 h-3 w-3 rounded-full"
                        />
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

function Icon({ d, large }: { d: string; large?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={large ? "h-7 w-7" : "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
