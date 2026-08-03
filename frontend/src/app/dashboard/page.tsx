import { currentUser } from "@clerk/nextjs/server";
import { SyncUser } from "@/components/sync-user";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
      <SyncUser />
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Signed in as {user?.username ?? user?.primaryEmailAddress?.emailAddress}
      </p>
    </div>
  );
}
