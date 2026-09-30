import { notFound, redirect } from "next/navigation";

import { joinConversationAction } from "@/app/actions/talk";
import { Avatar } from "@/components/Avatar";
import { PageShell } from "@/components/PageShell";
import { requireUser } from "@/lib/auth/user";
import { findByInvite } from "@/lib/talk/conversations";

export const metadata = { title: "Join conversation", robots: { index: false } };

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await requireUser(`/talk/join/${token}`);
  const conversation = await findByInvite(token);
  if (!conversation) notFound();
  if (conversation.members.some((m) => m.userId === user.id)) {
    redirect(`/talk/${conversation.id}`);
  }
  const names = conversation.members.map((m) => m.user.displayName ?? "Earthling");

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-5 py-20 text-center sm:px-8">
        <div className="flex justify-center -space-x-2">
          {names.slice(0, 4).map((name, i) => (
            <Avatar key={i} name={name} size={48} />
          ))}
        </div>
        <h1 className="font-display mt-6 text-3xl tracking-tight">
          {conversation.title ?? names.join(", ")}
        </h1>
        <p className="text-chalk/75 mt-3 text-sm">
          {names.join(", ")} invited you to talk on e1-4 — voice notes and live streams,
          answered whenever you like, kept as one continuous conversation.
        </p>
        <form action={joinConversationAction.bind(null, token)}>
          <button
            type="submit"
            className="bg-ochre text-blackboard mt-8 rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Join conversation
          </button>
        </form>
      </section>
    </PageShell>
  );
}
