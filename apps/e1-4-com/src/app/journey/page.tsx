import { Journey } from "@/features/journey/Journey";
import { requireUser } from "@/lib/auth/user";

export const metadata = { title: "Journey" };

export default async function JourneyPage() {
  await requireUser("/journey");
  return <Journey />;
}
