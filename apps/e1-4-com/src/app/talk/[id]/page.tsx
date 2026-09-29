import { notFound } from "next/navigation";

import { PageShell } from "@/components/PageShell";
import { TalkThread } from "@/features/talk/TalkThread";
import { requireUser } from "@/lib/auth/user";
import { getThread, markRead } from "@/lib/talk/conversations";

export const metadata = { title: "Talk", robots: { index: false } };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/talk/${id}`);
  const thread = await getThread(user.id, id);
  if (!thread) notFound();
  await markRead(user.id, id);

  return (
    <PageShell footer={false}>
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <TalkThread initial={thread} viewerId={user.id} />
      </section>
    </PageShell>
  );
}
