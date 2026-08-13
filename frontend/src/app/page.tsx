import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { SubmissionSummary } from "@/lib/types";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getSubmissions(params: {tech?: string; search?: string}) {
  const query = new URLSearchParams();
  if(params.tech) query.set("tech", params.tech);
  if(params.search) query.set("search", params.search);

  const res = await fetch(`${BACKEND_URL}/submissions?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch submissions");
  }
  return res.json() as Promise<SubmissionSummary[]>;
}

export default async function Home({
  searchParams,
  }: { 
    searchParams: Promise<{tech?: string; search?: string}> 
  }) {
  const params = await searchParams;
  const submissions = await getSubmissions(params);

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
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          type="text"
          name="tech"
          defaultValue={params.tech ?? ""}
          placeholder="Filter by tech tag"
          className="w-48 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
            <Card className="transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>{s.status}</span>
                <span>{s._count.criteria} criteria</span>
                <span>{s._count.reviews} reviews</span>
                {s.techTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-white/5 px-2 py-0.5 text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
