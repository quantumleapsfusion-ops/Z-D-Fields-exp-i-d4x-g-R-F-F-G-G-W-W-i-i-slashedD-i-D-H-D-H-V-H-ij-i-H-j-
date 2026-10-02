import { DaVinciConversation } from "@/features/davinci/Conversation";
import { flags } from "@/lib/flags";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Da Vinci",
  description: "Talk with Da Vinci, e1-4's voice",
};

export default function DaVinciPage() {
  if (!flags.daVinci) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <DaVinciConversation />
    </main>
  );
}
