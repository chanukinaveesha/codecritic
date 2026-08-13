import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { formatRelativeTime } from "@/lib/format";
import { mockSubmissionDetails } from "@/lib/mock-data";
import { SubmissionDetail } from "@/lib/types";
import { ListChecks, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaGithub } from "react-icons/fa";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getSubmission(id: string): Promise<SubmissionDetail | null> {
    const res = await fetch(`${BACKEND_URL}/submissions/${id}`, {
        cache: "no-store",
    });

    if(res.status === 404) {
        return null;
    }
    if (!res.ok) {
        return null;
    }
    return res.json();
}

export default async function SubmissionDetailPage({
    params,
}:{
    params: Promise<{id: string}>
}) {
    const {id} = await params;
    // const submission = await getSubmission(id);
    const submission = mockSubmissionDetails[Number(id)];

    if(!submission) {
        notFound();
    }

    return (
    <>
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserAvatar username={submission.user.username} size="md" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{submission.user.username}</span>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(submission.createdAt)}</span>
            </div>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        <h1 className="mt-4 text-2xl font-semibold text-foreground">{submission.title}</h1>
        <p className="mt-1 text-muted-foreground">{submission.description}</p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {submission.techTags.map((t) => (
            <span key={t} className="rounded-md bg-white/5 px-2 py-0.5">
              {t}
            </span>
          ))}
        </div>

        <a
          href={submission.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
        >
          <FaGithub className="size-4" />
          View on GitHub
        </a>
      </div>

      <section>
        <h2 className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
          <ListChecks className="size-4" />
          Review criteria
        </h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          {submission.criteria.map((c) => (
            <li key={c.id}>{c.label}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
          <MessageSquare className="size-4" />
          Reviews ({submission.reviews.length})
        </h2>
        <div className="mt-2 flex flex-col gap-4">
          {submission.reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          )}
          {submission.reviews.map((review) => (
            <div key={review.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar username={review.reviewer.username} />
                  <span className="text-sm font-medium text-foreground">{review.reviewer.username}</span>
                </div>
                <span className="text-xs text-muted-foreground">{review.reviewer.karma} karma</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {review.ratings.map((r) => {
                  const criterion = submission.criteria.find((c) => c.id === r.criteriaId);
                  return (
                    <span key={r.id} className="rounded-md bg-white/5 px-2 py-0.5">
                      {criterion?.label ?? "criterion"}: {r.rating}/10
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-foreground">
                <span className="font-medium">Strengths: </span>
                <span className="text-muted-foreground">{review.strengths}</span>
              </p>
              <p className="mt-1 text-sm text-foreground">
                <span className="font-medium">Improvements: </span>
                <span className="text-muted-foreground">{review.improvements}</span>
              </p>
              {review.resourceLinks.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {review.resourceLinks.map((link) => (
                    <li key={link}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        ← Back to feed
      </Link>
    </div>
    </>
  );
}
