import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { formatRelativeTime } from "@/lib/format";
import { mockSubmissions } from "@/lib/mock-data";
import { SubmissionSummary } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { ListChecks, MessageSquare } from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getSubmissions(params: {tech?: string; search?: string}) {
  const query = new URLSearchParams();
  if (params.tech) query.set("tech", params.tech);
  if (params.search) query.set("search", params.search);

  const { userId, getToken } = await auth();
  const token = userId ? await getToken() : null;

  const res = await fetch(`${BACKEND_URL}/submissions/feed?${query.toString()}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    console.log(res.status, await res.text());
    return [];
  }

  return res.json() as Promise<SubmissionSummary[]>;
}

function filterMockSubmissions(params: { tech?: string; search?: string }) {
  return mockSubmissions.filter((s) => {
    const matchesTech = !params.tech || s.techTags.includes(params.tech.toLowerCase());
    const matchesSearch =
      !params.search ||
      s.title.toLowerCase().includes(params.search.toLowerCase()) ||
      s.description.toLowerCase().includes(params.search.toLowerCase());
    return matchesTech && matchesSearch;
  });
}

export default async function Home({
  searchParams,
  }: { 
    searchParams: Promise<{tech?: string; search?: string}> 
  }) {
  const params = await searchParams;
  const submissions = await getSubmissions(params);
  // const submissions = filterMockSubmissions(params);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <Button asChild>
          <Link href="/submissions/new">New submission</Link>
        </Button>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search title or description"
          className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <input
          type="text"
          name="tech"
          defaultValue={params.tech ?? ""}
          placeholder="Filter by tech tag"
          className="w-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {submissions.length === 0 && (
          <p className="text-sm text-zinc-500">No submissions match.</p>
        )}
        {submissions.map((s) => (
          <Link key={s.id} href={`/submissions/${s.id}`}>
            <Card className="transition-colors hover:border-primary/50 hover:shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserAvatar username={s.user.username} />
                    <span className="text-sm font-medium text-foreground">{s.user.username}</span>
                    <span className="text-xs text-muted-foreground">· {formatRelativeTime(s.createdAt)}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <CardTitle className="mt-2">{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="size-3.5" />
                  {s._count.criteria} criteria
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-3.5" />
                  {s._count.reviews} review{s._count.reviews === 1 ? "" : "s"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {s.techTags.map((t) => (
                    <span key={t} className="rounded-md bg-white/5 px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
