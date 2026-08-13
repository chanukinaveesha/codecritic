import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Review } from "@/lib/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

  const [reviewsGiven, reviewsReceived] = await Promise.all([
    getReviewsGiven(username),
    getReviewsReceived(username),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">My Activity</h1>

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