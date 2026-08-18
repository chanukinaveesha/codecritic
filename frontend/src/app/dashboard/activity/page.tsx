import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Review, SubmissionSummary } from "@/lib/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getMySubmissions(username: string): Promise<SubmissionSummary[]> {
  const res = await fetch(`${BACKEND_URL}/submissions/feed?username=${username}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getReviewsGiven(username: string): Promise<Review[]> {
  const res = await fetch(`${BACKEND_URL}/users/${username}/reviews-given`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getReviewsReceived(username: string): Promise<Review[]> {
  const res = await fetch(`${BACKEND_URL}/users/${username}/reviews-received`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function ActivityPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const username = user.username ?? user.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "";

  const [mySubmissions, reviewsGiven, reviewsReceived] = await Promise.all([
    getMySubmissions(username),
    getReviewsGiven(username),
    getReviewsReceived(username),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">My Activity</h1>

       <Card>
        <CardHeader>
          <CardTitle>My Submissions ({mySubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {mySubmissions.length === 0 && (
            <p className="text-sm text-zinc-500">You haven&apos;t posted anything yet.</p>
          )}
          {mySubmissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
            >
              <p className="font-medium">{submission.title}</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{submission.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span>{submission.status}</span>
                <span>{submission._count.criteria} criteria</span>
                <span>{submission._count.reviews} reviews</span>
                {submission.techTags.map((tech) => (
                  <span key={tech} className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Reviews Given ({reviewsGiven.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {reviewsGiven.length === 0 && (
            <p className="text-sm text-zinc-500">You haven&apos;t reviewed anything yet.</p>
          )}
          {reviewsGiven.map((review) => (
            <div key={review.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <p className="font-medium">Submission #{review.submissionId}</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{review.strengths}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews Received ({reviewsReceived.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {reviewsReceived.length === 0 && (
            <p className="text-sm text-zinc-500">No one has reviewed your submissions yet.</p>
          )}
          {reviewsReceived.map((review) => (
            <div key={review.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <p className="font-medium">From {review.reviewer.username}</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{review.strengths}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}