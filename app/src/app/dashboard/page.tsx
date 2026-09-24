import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

const metrics = [
  { title: "Active projects", value: "3" },
  { title: "Open tasks", value: "17" },
  { title: "Members", value: "5" },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome back{user ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Placeholder dashboard — replace these cards with real product data.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            title={metric.title}
            description={metric.value}
          />
        ))}
      </div>
      <div className="mt-6">
        <Card title="Recent activity">
          <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Project “Atlas” moved to staging.</li>
            <li>2 new tasks assigned to you.</li>
            <li>Weekly report generated.</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
