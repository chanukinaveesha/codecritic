import { SubmissionDetail } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    const submission = await getSubmission(id);

    if(!submission) {
        notFound();
    }

    return (
    <>
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
            <div>
                <h1 className="text-2xl font-semibold">{submission.title}</h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {submission.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{submission.status}</span>
                    {submission.techTags.map((t) => (
                        <span key={t} className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                            {t}
                        </span>
                    ))}
                </div>

                <a href={submission.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-blue-600 underline dark:text-blue-400"
                >
                View on GitHub →
            </a>
        </div><section>
                <h2 className="text-lg font-semibold">Review criteria</h2>
                <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {submission.criteria.map((c) => (
                        <li key={c.id}>{c.label}</li>
                    ))}
                </ul>
            </section><section>
                <h2 className="text-lg font-semibold">Reviews ({submission.reviews.length})</h2>
                <div className="mt-2 flex flex-col gap-4">
                    {submission.reviews.length === 0 && (
                        <p className="text-sm text-zinc-500">No reviews yet.</p>
                    )}
                    {submission.reviews.map((review) => (
                        <div key={review.id} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span>{review.reviewer.username}</span>
                                <span className="text-zinc-500">karma: {review.reviewer.karma}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                                {review.ratings.map((r) => {
                                    const criterion = submission.criteria.find((c) => c.id === r.criteriaId);
                                    return (
                                        <span key={r.id} className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                                            {criterion?.label ?? "criterion"}: {r.rating}/10
                                        </span>
                                    );
                                })}
                            </div>
                            <p className="mt-3 text-sm">
                                <span className="font-medium">Strengths: </span>
                                {review.strengths}
                            </p>
                            <p className="mt-1 text-sm">
                                <span className="font-medium">Improvements: </span>
                                {review.improvements}
                            </p>
                            {review.resourceLinks.length > 0 && (
                                <ul className="mt-2 list-disc pl-5 text-sm text-blue-600 dark:text-blue-400">
                                    {review.resourceLinks.map((link) => (
                                        <li key={link}>
                                            <a href={link} target="_blank" rel="noreferrer" className="underline">
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
            
            <Link href="/" className="text-sm text-zinc-500 underline">
                ← Back to feed
            </Link>
    </div>
    </>
  );
}
