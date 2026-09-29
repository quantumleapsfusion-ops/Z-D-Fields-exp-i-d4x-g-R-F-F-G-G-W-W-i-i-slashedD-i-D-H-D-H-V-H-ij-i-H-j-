import { MicPortal } from "@/features/portal/MicPortal";
import { getSessionUser } from "@/lib/auth/user";

export default async function Home() {
  const user = await getSessionUser().catch(() => null);
  return <MicPortal signedIn={Boolean(user)} />;
}
